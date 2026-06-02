import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

export const maxDuration = 60;

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(params: {
  destination: string;
  days: number;
  startDate?: string;
  style: string;
  currency: string;
  locale: string;
}): string {
  const { destination, days, startDate, style, currency, locale } = params;

  const dateNote = startDate
    ? `The trip starts on ${startDate}. Mention seasonally-appropriate activities.`
    : '';

  const langNote = locale === 'he'
    ? 'IMPORTANT: Write all "name", "description", "notes", "region", and "tips" values in Hebrew. Keep place names and brand names in English/original script. Do NOT use Arabic characters.'
    : '';

  return `You are an expert travel planner. Create a detailed, realistic day-by-day itinerary.

Destination: ${destination}
Duration: ${days} day${days !== 1 ? 's' : ''}
Travel style: ${style || 'balanced mix of culture, food, and relaxation'}
Currency: ${currency}
${dateNote}
${langNote}

Return ONLY valid JSON (no markdown, no explanation) with this exact schema:
{
  "name": "Creative trip name (2–4 words, captures the spirit of the trip)",
  "theme": "One of: desert|nature|city|beach|mountain|lake|sunset",
  "countries": ["Country name"],
  "estimatedBudget": <total estimated cost as number in ${currency}>,
  "currency": "${currency}",
  "days": [
    {
      "dayNumber": 1,
      "region": "Specific area or neighbourhood for this day",
      "description": "One vivid sentence describing what makes this day special",
      "events": [
        {
          "time": "HH:MM",
          "name": "Activity or place name",
          "category": "food|cafe|attraction|museum|rest|transport|flight|beach|hiking|shopping|nightlife|spa|cultural|photography|market|other",
          "duration": <minutes as integer>,
          "location": "Specific address or well-known landmark",
          "cost": <cost per person in ${currency} as number, 0 if free>,
          "notes": "One practical tip (optional — omit if nothing useful to add)"
        }
      ]
    }
  ],
  "packingList": ["Practical item 1", "Practical item 2"],
  "tips": ["Local insight 1", "Local insight 2"]
}

Strict rules:
• Each day: 4–6 events, starting 08:00–09:30, ending by 22:30
• Events must NOT overlap — include travel time between distant locations
• Always include: 1 breakfast/café, 1 lunch, 1 dinner per day
• Include at least 1 main attraction or experience per day
• Costs must be realistic for ${destination} in ${currency}
• packingList: 8–12 items specific to this destination and travel style
• tips: 3–5 genuinely useful local insights
• DO NOT include hotel check-in as an event`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Strip markdown fences that Claude occasionally adds despite instructions
function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (c) => {
        try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  // Rate-limit: 5 plans per hour per user
  const rl = checkRateLimit(`ai:plan:${user.id}`, 5, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 5);

  // Parse body
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const destination = typeof b.destination === 'string' ? b.destination.trim() : '';
  const days        = typeof b.days      === 'number'  ? Math.min(Math.max(1, b.days), 21) : 0;
  const startDate   = typeof b.startDate === 'string'  ? b.startDate : undefined;
  const style       = typeof b.style     === 'string'  ? b.style.trim().slice(0, 300) : '';
  const currency    = typeof b.currency  === 'string'  ? b.currency  : 'USD';
  const locale      = typeof b.locale    === 'string'  ? b.locale    : 'en';

  if (!destination || days < 1) {
    return Response.json({ error: 'destination and days are required' }, { status: 400 });
  }

  const client  = new Anthropic();
  const encoder = new TextEncoder();
  const prompt  = buildPrompt({ destination, days, startDate, style, currency, locale });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let accumulated = '';
        let sentDays    = 0;

        const msgStream = client.messages.stream({
          model:      'claude-sonnet-4-6',
          max_tokens: 6000,
          system:     locale === 'he'
            ? 'אתה מתכנן טיולים מקצועי. החזר JSON תקני בלבד, ללא markdown. כל הטקסטים בעברית.'
            : 'You are a professional travel planner. Return only valid JSON, no markdown or explanation.',
          messages:   [{ role: 'user', content: prompt }],
        });

        for await (const chunk of msgStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            accumulated += chunk.delta.text;

            // Send a progress token each time a new day appears in the stream
            const dayMatches = accumulated.match(/"dayNumber"\s*:\s*\d+/g);
            if (dayMatches && dayMatches.length > sentDays) {
              sentDays = dayMatches.length;
              controller.enqueue(
                encoder.encode(`\n__PROGRESS__${sentDays}/${days}\n`),
              );
            }
          }
        }

        // Parse and re-emit the final result
        try {
          const parsed = JSON.parse(stripFences(accumulated));
          controller.enqueue(encoder.encode('\n__RESULT__' + JSON.stringify(parsed)));
        } catch {
          controller.enqueue(encoder.encode('\n__ERROR__Failed to parse AI response'));
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode('\n__ERROR__' + (err instanceof Error ? err.message : 'Unknown error')),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':           'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

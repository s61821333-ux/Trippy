import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

export const maxDuration = 45;

// ── Token budget ──────────────────────────────────────────────────────────────
// 4 lean events/day × ~40 tokens/event = ~160/day.
// 7 days × 160 = 1120 + overhead ≈ 1600. Cap at 2000 to leave headroom.
const tokensForDays = (days: number) => Math.min(2000, Math.max(800, days * 230));

// ── Prompt: tight schema, no fluff ───────────────────────────────────────────

function buildPrompt(p: {
  destination: string; days: number; startDate?: string;
  travelers: string; pace: string; interests: string[]; budget: string;
  currency: string; locale: string;
}): string {
  const dateNote = p.startDate ? `Starts ${p.startDate}.` : '';
  const heNote   = p.locale === 'he'
    ? 'Write all text fields in Hebrew (name,region,desc,notes). Keep place names in English.'
    : '';

  // Map pace → event count so output stays small
  const evPerDay = p.pace === 'relaxed' ? 3 : p.pace === 'packed' ? 5 : 4;

  return `Trip: ${p.days}d in ${p.destination}. ${dateNote}
Who: ${p.travelers}. Pace: ${p.pace} (${evPerDay} events/day). Budget: ${p.budget}. Focus: ${p.interests.join(', ')}. Currency: ${p.currency}.
${heNote}

Return ONLY minified JSON, no markdown:
{"name":"2-4 word name","theme":"city|beach|nature|desert|mountain|lake|sunset","countries":["X"],"estimatedBudget":0,"currency":"${p.currency}","days":[{"dayNumber":1,"region":"Area","description":"1 sentence","events":[{"time":"HH:MM","name":"Name","category":"food|cafe|attraction|museum|rest|transport|beach|hiking|shopping|nightlife|other","duration":60,"location":"Place","cost":0}]}],"packingList":["item"],"tips":["tip"]}

Rules: start 08:00–09:30, no overlaps, include breakfast+lunch+dinner each day, costs in ${p.currency}, packingList 6–8 items, tips 2–3.`;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const rl = checkRateLimit(`ai:plan:${user.id}`, 5, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 5);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const destination = typeof body.destination === 'string' ? body.destination.trim().slice(0, 100) : '';
  const days        = typeof body.days        === 'number'  ? Math.min(Math.max(1, body.days), 21) : 0;
  const startDate   = typeof body.startDate   === 'string'  ? body.startDate : undefined;
  const currency    = typeof body.currency    === 'string'  ? body.currency  : 'USD';
  const locale      = typeof body.locale      === 'string'  ? body.locale    : 'en';
  const travelers   = typeof body.travelers   === 'string'  ? body.travelers : 'couple';
  const pace        = typeof body.pace        === 'string'  ? body.pace      : 'balanced';
  const budget      = typeof body.budget      === 'string'  ? body.budget    : 'mid';
  const interests   = Array.isArray(body.interests) ? (body.interests as unknown[]).map(String).slice(0, 4) : ['culture'];

  if (!destination || days < 1) {
    return Response.json({ error: 'destination and days required' }, { status: 400 });
  }

  const client   = new Anthropic();
  const encoder  = new TextEncoder();
  const maxToks  = tokensForDays(days);
  const prompt   = buildPrompt({ destination, days, startDate, currency, locale, travelers, pace, budget, interests });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let accumulated = '';
        let sentDays    = 0;

        const msgStream = client.messages.stream({
          model:      'claude-haiku-4-5-20251001', // fast + cheap
          max_tokens: maxToks,
          system: locale === 'he'
            ? 'מתכנן טיולים. JSON בלבד, ללא markdown.'
            : 'Travel planner. Return only minified JSON, no markdown.',
          messages: [{ role: 'user', content: prompt }],
        });

        for await (const chunk of msgStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            accumulated += chunk.delta.text;
            const ms = accumulated.match(/"dayNumber"\s*:\s*\d+/g);
            if (ms && ms.length > sentDays) {
              sentDays = ms.length;
              controller.enqueue(encoder.encode(`\n__PROGRESS__${sentDays}/${days}\n`));
            }
          }
        }

        try {
          const clean  = accumulated.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(clean);
          controller.enqueue(encoder.encode('\n__RESULT__' + JSON.stringify(parsed)));
        } catch {
          controller.enqueue(encoder.encode('\n__ERROR__Failed to parse response'));
        }
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode('\n__ERROR__' + (err instanceof Error ? err.message : 'Unknown')));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  });
}

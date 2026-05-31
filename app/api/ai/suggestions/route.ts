import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import type { AiSuggestion, Category } from '@/lib/types';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { AiSuggestionsBody } from '@/lib/schemas';
import { GOOGLE_MAPS_API_KEY } from '@/lib/env';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

async function enrichWithPlaces(
  suggestions: AiSuggestion[],
  region: string,
): Promise<AiSuggestion[]> {
  const key = GOOGLE_MAPS_API_KEY();
  if (!key) return suggestions;

  const results = await Promise.allSettled(
    suggestions.map(async (s) => {
      const query = s.location ? `${s.name}, ${s.location}` : `${s.name}, ${region}`;
      try {
        const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': 'places.rating,places.userRatingCount,places.googleMapsUri,places.priceLevel,places.currentOpeningHours.openNow',
          },
          body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
        });
        if (!res.ok) return s;
        const data = await res.json() as { places?: Array<{ rating?: number; userRatingCount?: number; googleMapsUri?: string; priceLevel?: string; currentOpeningHours?: { openNow?: boolean } }> };
        const place = data.places?.[0];
        if (!place) return s;
        const priceLevelMap: Record<string, number> = {
          PRICE_LEVEL_FREE: 0,
          PRICE_LEVEL_INEXPENSIVE: 1,
          PRICE_LEVEL_MODERATE: 2,
          PRICE_LEVEL_EXPENSIVE: 3,
          PRICE_LEVEL_VERY_EXPENSIVE: 4,
        };
        return {
          ...s,
          rating: place.rating,
          ratingCount: place.userRatingCount,
          mapsUrl: place.googleMapsUri,
          priceLevel: place.priceLevel ? (priceLevelMap[place.priceLevel] ?? undefined) : undefined,
          open: place.currentOpeningHours?.openNow ?? s.open,
        };
      } catch {
        return s;
      }
    }),
  );

  return results.map((r, i) => (r.status === 'fulfilled' ? r.value : suggestions[i]));
}

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  // Auth check — extract userId for per-user rate limiting
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  // Rate limit: 10 requests/60s per user
  const rl = checkRateLimit(`ai:${user.id}`, 10, 60);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 10);

  // Validate request body
  let raw: unknown;
  try { raw = await request.json() } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const parsed = AiSuggestionsBody.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { dayNumber, dayMeta, existingEvents, tripName, countries = [], exclude = [], gapStart, gapEnd, locale } = parsed.data;

  const client = new Anthropic();

  const toHHMM = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  const eventsText =
    existingEvents.length > 0
      ? existingEvents
          .map(e => `  - ${e.time} ${e.name} (${e.category}, ${e.duration}min)`)
          .join('\n')
      : '  (no events yet)';

  const destinationText = countries.length > 0
    ? countries.join(', ')
    : dayMeta?.region ?? 'the trip destination';

  const regionText = dayMeta
    ? `Region: ${dayMeta.region}${dayMeta.desc ? ` — ${dayMeta.desc}` : ''}`
    : `Day ${dayNumber}`;

  const gapLine = gapStart != null && gapEnd != null
    ? `\nFree slot to fill: ${toHHMM(gapStart)} – ${toHHMM(gapEnd)} (${gapEnd - gapStart} min available). Every suggestion MUST start at or after ${toHHMM(gapStart)} and finish by ${toHHMM(gapEnd)}. Set "time" to a value within this window and keep "duration" short enough to fit.`
    : '';

  const languageInstruction = locale === 'he'
    ? '\nחשוב: השב בעברית בלבד. כל שדות "name" ו-"description" חייבים להיות בעברית. כתוב בשפה יומיומית וטבעית — קצר, ישיר, כמו שחבר היה ממליץ בע"פ. אל תכתוב בסגנון רשמי או שיווקי. שמות פרטיים של מקומות, מסעדות, אתרים ומותגים — השאר בשמם המקורי באנגלית, אל תתרגם אותם. אל תשתמש בשום אות ערבית — גם לא בתוך מילה עברית. כתוב אך ורק באותיות עבריות ואנגליות.'
    : '';

  const prompt = `You are a trip planning assistant for "${tripName}" — a trip to ${destinationText}.

Day ${dayNumber} — ${regionText}
Existing schedule:
${eventsText}
${gapLine}
Suggest exactly 4 NEW activities that complement this day's existing schedule and fit ${destinationText}.${exclude.length > 0 ? `\nDo NOT suggest any of these already-shown activities: ${exclude.join(', ')}.` : ''}${languageInstruction}
Return ONLY valid JSON — an array of 4 objects with this exact shape:
[
  {
    "id": "ai-1",
    "name": "Activity name",
    "category": "attraction",
    "description": "One or two short sentences — casual and direct, like a friend recommending it.",
    "duration": 90,
    "time": "10:00",
    "distance": "2.3 km away",
    "open": true,
    "cost": 150,
    "location": "Address or general location"
  }
]

category must be one of: food | cafe | attraction | rest | transport | flight | other
time must be HH:MM and should not conflict with existing events.
duration is in minutes (integer).
open is a boolean indicating whether the place is likely open now.
cost is an estimated cost in local currency (number).
location is a string representing the address or place.
Respond with ONLY the JSON array, no other text.`;

  const systemPrompt = locale === 'he'
    ? 'אתה עוזר טיולים. תמיד השב עם JSON תקין בלבד — ללא markdown, ללא הסברים. כל שדות הטקסט בעברית. כתוב בשפה יומיומית ורגועה — קצר, ישיר, לא פורמלי ולא שיווקי. כאילו מסביר לחבר. שמות פרטיים של מקומות, מסעדות, אתרים ומותגים — השאר בשמם המקורי באנגלית, אל תתרגם אותם. חשוב מאוד: אל תשתמש בשום אות ערבית — גם לא בתוך מילה עברית. כתוב אך ורק באותיות עבריות ואנגליות.'
    : 'You are a travel planning assistant. Always respond with valid JSON only — no markdown, no explanation.';

  const validCategories: Category[] = [
    'food', 'cafe', 'attraction', 'hotel', 'rest', 'transport', 'flight', 'other',
  ];

  const encoder = new TextEncoder();
  const region = dayMeta?.region ?? destinationText;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let accumulated = '';

        const messageStream = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        });

        for await (const chunk of messageStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            accumulated += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // Strip markdown fences Claude occasionally adds despite instructions
        const cleanText = accumulated.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

        let suggestions: AiSuggestion[];
        try {
          const rawParsed = JSON.parse(cleanText) as Array<{
            id?: string; name?: string; category?: string; description?: string;
            duration?: number; time?: string; distance?: string; open?: boolean;
            cost?: number; location?: string;
          }>;
          suggestions = rawParsed.map((s, i) => ({
            id: s.id ?? `ai-${i}`,
            name: s.name ?? 'Suggestion',
            category: validCategories.includes(s.category as Category) ? (s.category as Category) : 'other',
            description: s.description ?? '',
            duration: typeof s.duration === 'number' ? s.duration : 60,
            time: s.time ?? '10:00',
            distance: s.distance ?? '—',
            open: s.open ?? true,
            cost: typeof s.cost === 'number' ? s.cost : undefined,
            location: s.location,
          }));
        } catch {
          controller.enqueue(encoder.encode('\n__ERROR__Failed to parse AI response'));
          controller.close();
          return;
        }

        const enriched = await enrichWithPlaces(suggestions, region);
        controller.enqueue(encoder.encode('\n__ENRICHED__' + JSON.stringify(enriched)));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode('\n__ERROR__' + msg));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

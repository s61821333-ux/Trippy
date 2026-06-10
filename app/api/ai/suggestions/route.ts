import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import type { AiSuggestion, Category } from '@/lib/types';
import { checkRateLimitPersistent, rateLimitResponse } from '@/lib/rateLimit';
import { AiSuggestionsBody } from '@/lib/schemas';
import { GOOGLE_MAPS_API_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

function tryAdminClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }) }
  catch { return null }
}

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

  // Rate limit: 10 requests/60s per user (persistent across serverless instances)
  const admin = tryAdminClient();
  const rl = await checkRateLimitPersistent(admin, `ai:${user.id}`, 10, 60);
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

  const { dayNumber, dayMeta, existingEvents, tripName, countries = [], exclude = [], gapStart, gapEnd, locale, hotelLocation, hotelName } = parsed.data;

  const client = new Anthropic();

  const toHHMM = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  const isHebrew = locale === 'he';

  const eventsText =
    existingEvents.length > 0
      ? existingEvents
          .map(e => `  - ${e.time} ${e.name} (${e.category}, ${e.duration}min)`)
          .join('\n')
      : isHebrew ? '  (אין אירועים עדיין)' : '  (no events yet)';

  const destinationText = countries.length > 0
    ? countries.join(', ')
    : dayMeta?.region ?? (isHebrew ? 'יעד הטיול' : 'the trip destination');

  const regionText = dayMeta
    ? `${isHebrew ? 'אזור' : 'Region'}: ${dayMeta.region}${dayMeta.desc ? ` — ${dayMeta.desc}` : ''}`
    : isHebrew ? `יום ${dayNumber}` : `Day ${dayNumber}`;

  const gapLine = gapStart != null && gapEnd != null
    ? (isHebrew
        ? `\nחלון פנוי למילוי: ${toHHMM(gapStart)}–${toHHMM(gapEnd)} (${gapEnd - gapStart} דקות פנויות). כל הצעה חייבת להתחיל בשעה ${toHHMM(gapStart)} או אחריה ולהסתיים עד ${toHHMM(gapEnd)}. קבע "time" בתוך החלון הזה ושמור על "duration" קצר מספיק כדי להיכנס בו.`
        : `\nFree slot to fill: ${toHHMM(gapStart)} – ${toHHMM(gapEnd)} (${gapEnd - gapStart} min available). Every suggestion MUST start at or after ${toHHMM(gapStart)} and finish by ${toHHMM(gapEnd)}. Set "time" to a value within this window and keep "duration" short enough to fit.`)
    : '';

  const hotelLine = hotelLocation
    ? (isHebrew
        ? `\nהמטייל לן ב: ${hotelName ? `${hotelName}, ` : ''}${hotelLocation}. העדף פעילויות קרובות למיקום הזה או נגישות ממנו בקלות. אל תציע פעילויות בעיר או באזור אחר לגמרי.`
        : `\nThe traveler is staying at: ${hotelName ? `${hotelName}, ` : ''}${hotelLocation}. Prioritize activities that are close to or easy to reach from this location. Do NOT suggest activities in a completely different city or region.`)
    : '';

  const excludeLine = exclude.length > 0
    ? (isHebrew
        ? `\nאל תציע אף אחד מאלה (כבר הוצגו): ${exclude.join(', ')}.`
        : `\nDo NOT suggest any of these (already shown): ${exclude.join(', ')}.`)
    : '';

  const hebrewPrompt = `טיול: "${tripName}" → ${destinationText}.

יום ${dayNumber} — ${regionText}${hotelLine}
לוח הזמנים של היום:
${eventsText}
${gapLine}
תן בדיוק 4 הצעות לפעילויות. כללים:
• הצע אך ורק מקומות אמיתיים וקיימים ב-${destinationText} — עם שם המקום המדויק
• כל ההצעות חייבות להיות בתוך ${destinationText} או קרוב מאוד אליו — לעולם לא בעיר או באזור אחר
• גוון בקטגוריות (אוכל / בית קפה / אטרקציה וכו') ובאווירה
• בלי התנגשויות זמנים עם הלו"ז הקיים למעלה
• העדף פנינות מקומיות אהובות על פני מלכודות תיירים מפורסמות${excludeLine}

שדה "description": משפט אחד או שניים בעברית טבעית וזורמת — כמו חבר ישראלי שגר ביעד וממליץ לך אישית. תאר את האווירה, מה מיוחד במקום, או טיפ פרקטי אחד. אסור עברית מליצית, אסור ניסוח שנשמע כמו תרגום מילולי מאנגלית, ואסור סופרלטיבים ריקים ("מדהים", "חובה", "מושלם").
שדה "name": שם המקום בשפת המקור (כתב לטיני) — אל תתרגם שמות פרטיים. אסור אותיות ערביות בשום שדה.

החזר אך ורק JSON תקין — מערך של בדיוק 4 אובייקטים:
[
  {
    "id": "ai-1",
    "name": "Café de Flore",
    "category": "cafe",
    "description": "בית קפה ותיק בלב הרובע, עם טרסה שנעים לשבת בה ולצפות בעוברים ושבים. כדאי להגיע לפני 9 בבוקר כדי לתפוס שולחן בחוץ.",
    "duration": 90,
    "time": "10:00",
    "distance": "1.5 ק״מ",
    "open": true,
    "cost": 0,
    "location": "שכונה או כתובת"
  }
]

category חייב להיות אחד מ: food | cafe | attraction | museum | beach | sport | shopping | nightlife | rest | other
time: HH:MM בפורמט 24 שעות, בלי התנגשות עם אירועים קיימים
duration: דקות (מספר שלם, ריאלי)
open: true (Google Maps יאמת)
cost: עלות משוערת במטבע המקומי (0 אם חינם)
השב עם מערך ה-JSON בלבד, בלי markdown.`;

  const englishPrompt = `Trip: "${tripName}" → ${destinationText}.

Day ${dayNumber} — ${regionText}${hotelLine}
Today's schedule:
${eventsText}
${gapLine}
Give exactly 4 activity suggestions. Rules:
• ONLY suggest real, named places that actually exist in ${destinationText} — include the exact venue name
• All suggestions MUST be within or very close to ${destinationText} — never suggest places in other cities or regions
• Good variety of category (mix food/cafe/attraction/etc.) and vibe
• No time conflicts with the existing schedule above
• Prioritize local favourites over famous tourist traps${excludeLine}

Each description: 1–2 vivid sentences. Mention atmosphere, what makes it special, or one practical tip. Write like a knowledgeable local friend.

Return ONLY valid JSON — array of exactly 4 objects:
[
  {
    "id": "ai-1",
    "name": "Exact venue name",
    "category": "attraction",
    "description": "Specific, vivid description.",
    "duration": 90,
    "time": "10:00",
    "distance": "1.5 km away",
    "open": true,
    "cost": 0,
    "location": "Neighbourhood or street address"
  }
]

category must be one of: food | cafe | attraction | museum | beach | sport | shopping | nightlife | rest | other
time: HH:MM 24h, no conflict with existing events
duration: minutes (integer, realistic)
open: true (Google Maps will verify)
cost: estimated cost in local currency (0 if free)
Respond with ONLY the JSON array, no markdown.`;

  const prompt = isHebrew ? hebrewPrompt : englishPrompt;

  const systemPrompt = isHebrew
    ? 'אתה מדריך טיולים ישראלי שמכיר את היעד מקרוב. כתוב עברית טבעית ועכשווית — כמו שחבר ישראלי באמת מדבר, לא כמו תרגום מאנגלית ולא כמו חוברת תיירות. משפטים קצרים וקונקרטיים. שמות מקומות, עסקים ומותגים נשארים בכתב הלטיני המקורי. השב עם JSON תקין בלבד, ללא markdown. אסור להמציא מקומות שאינם קיימים. אסור להשתמש באותיות ערביות.'
    : 'You are a local travel expert who knows real, specific places. Respond with valid JSON only — no markdown. Only suggest real venues that actually exist at the destination. Descriptions must be vivid and specific — like a knowledgeable friend, not a travel brochure. Never invent fictional places.';

  const validCategories: Category[] = [
    'food', 'cafe', 'attraction', 'hotel', 'rest', 'transport', 'flight', 'other',
    'museum', 'beach', 'sport', 'shopping', 'nightlife', 'hiking', 'nature_walk',
    'spa', 'wellness', 'cultural', 'market', 'art', 'theater', 'festival',
  ];

  const encoder = new TextEncoder();
  const region = dayMeta?.region ?? destinationText;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Prefill the assistant turn with '[' so the model can't prepend prose
        // or markdown fences — faster first token and far fewer parse failures.
        let accumulated = '[';
        controller.enqueue(encoder.encode('['));

        const messageStream = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt },
            { role: 'assistant', content: '[' },
          ],
        });

        for await (const chunk of messageStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            accumulated += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // Strip markdown fences Claude occasionally adds despite instructions
        const cleanText = accumulated.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

        type RawSuggestion = {
          id?: string; name?: string; category?: string; description?: string;
          duration?: number; time?: string; distance?: string; open?: boolean;
          cost?: number; location?: string;
        };

        let suggestions: AiSuggestion[];
        try {
          let rawParsed: RawSuggestion[];
          try {
            rawParsed = JSON.parse(cleanText) as RawSuggestion[];
          } catch {
            // Truncated/malformed array — salvage every complete object inside it
            rawParsed = [...cleanText.matchAll(/\{[^{}]*\}/g)].flatMap(m => {
              try { return [JSON.parse(m[0]) as RawSuggestion]; } catch { return []; }
            });
            if (rawParsed.length === 0) throw new Error('no parseable objects');
          }
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

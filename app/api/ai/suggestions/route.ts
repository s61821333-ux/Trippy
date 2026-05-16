import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import type { TripEvent, DayMeta, AiSuggestion, Category } from '@/lib/types';

const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';

async function enrichWithPlaces(
  suggestions: AiSuggestion[],
  region: string,
): Promise<AiSuggestion[]> {
  if (!PLACES_API_KEY) return suggestions;

  const results = await Promise.allSettled(
    suggestions.map(async (s) => {
      const query = s.location ? `${s.name}, ${s.location}` : `${s.name}, ${region}`;
      try {
        const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.rating,places.userRatingCount,places.googleMapsUri',
          },
          body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
        });
        if (!res.ok) return s;
        const data = await res.json() as { places?: Array<{ rating?: number; userRatingCount?: number; googleMapsUri?: string }> };
        const place = data.places?.[0];
        if (!place) return s;
        return {
          ...s,
          rating: place.rating,
          ratingCount: place.userRatingCount,
          mapsUrl: place.googleMapsUri,
        };
      } catch {
        return s;
      }
    }),
  );

  return results.map((r, i) => (r.status === 'fulfilled' ? r.value : suggestions[i]));
}

export const maxDuration = 30;

const client = new Anthropic();

interface RequestBody {
  dayNumber: number;
  dayMeta?: DayMeta;
  existingEvents: TripEvent[];
  tripName: string;
  countries?: string[];
  exclude?: string[];
  gapStart?: number; // minutes from midnight
  gapEnd?: number;   // minutes from midnight
  locale?: string;
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { dayNumber, dayMeta, existingEvents, tripName, countries = [], exclude = [], gapStart, gapEnd, locale }: RequestBody =
    await request.json();

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
    ? '\nחשוב: השב בעברית בלבד. כל שדות "name" ו-"description" חייבים להיות כתובים בעברית.'
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
    "description": "Two-sentence description of why this fits the trip.",
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

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:
        locale === 'he'
          ? 'אתה עוזר תכנון טיולים. תמיד השב עם JSON תקין בלבד — ללא markdown, ללא הסברים. כל שדות הטקסט חייבים להיות בעברית.'
          : 'You are a travel planning assistant. Always respond with valid JSON only — no markdown, no explanation.',
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: `AI request failed: ${msg}` }, { status: 502 });
  }

  const rawText =
    message.content[0].type === 'text' ? message.content[0].text : '[]';

  // Claude occasionally wraps JSON in markdown code fences despite instructions
  const text = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let suggestions: AiSuggestion[];
  try {
    const raw = JSON.parse(text) as Array<{
      id?: string;
      name?: string;
      category?: string;
      description?: string;
      duration?: number;
      time?: string;
      distance?: string;
      open?: boolean;
      cost?: number;
      location?: string;
    }>;
    const validCategories: Category[] = [
      'food', 'cafe', 'attraction', 'hotel', 'rest', 'transport', 'flight', 'other',
    ];
    suggestions = raw.map((s, i) => ({
      id: s.id ?? `ai-${i}`,
      name: s.name ?? 'Suggestion',
      category: validCategories.includes(s.category as Category)
        ? (s.category as Category)
        : 'other',
      description: s.description ?? '',
      duration: typeof s.duration === 'number' ? s.duration : 60,
      time: s.time ?? '10:00',
      distance: s.distance ?? '—',
      open: s.open ?? true,
      cost: typeof s.cost === 'number' ? s.cost : undefined,
      location: s.location,
    }));
  } catch {
    return Response.json({ error: 'Failed to parse AI response' }, { status: 502 });
  }

  const region = dayMeta?.region ?? destinationText;
  const enriched = await enrichWithPlaces(suggestions, region);

  return Response.json(enriched);
}

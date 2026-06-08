import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { AiSuggestion, Category } from '@/lib/types';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { RecommendBody } from '@/lib/schemas';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_MAPS_API_KEY } from '@/lib/env';
import { adjacentSeasons } from '@/lib/season';

function serviceClient(url: string, key: string) {
  return createClient(url, key, { auth: { persistSession: false } });
}

export const maxDuration = 30;


const STYLE_TO_CATEGORY: Record<string, Category> = {
  food:    'food',
  bars:    'nightlife',
  quiet:   'attraction',
  relaxed: 'attraction',
  other:   'other',
};

// ── Geo bounding-box helpers ─────────────────────────────────────────────────

function latDelta(km: number): number {
  return km / 111.0;
}
function lngDelta(km: number, lat: number): number {
  return km / (111.0 * Math.cos((lat * Math.PI) / 180));
}

// ── Google Places enrichment (same pattern as /api/ai/suggestions) ───────────

interface PlaceData {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  priceLevel?: string;
  currentOpeningHours?: { openNow?: boolean };
}

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

async function fetchPlaceData(query: string, key: string): Promise<PlaceData | null> {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.rating,places.userRatingCount,places.googleMapsUri,places.priceLevel,places.currentOpeningHours.openNow',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { places?: PlaceData[] };
    return data.places?.[0] ?? null;
  } catch {
    return null;
  }
}

// ── Cache lookup ─────────────────────────────────────────────────────────────

interface CacheRow {
  rec_id: string;
  city: string;
  area?: string | null;
  lat: number | null;
  lng: number | null;
  style: string;
  duration_bucket: string;
  budget_tier: string;
  season: string;
  title: string;
  short_description?: string | null;
  source_site?: string | null;
  source_url?: string | null;
  google_place_id?: string | null;
  google_rating?: number | null;
  avg_duration_min?: number | null;
  price_level?: number | null;
  popularity_count: number;
}

async function queryCacheHits(ctx: {
  city: string; lat?: number; lng?: number; radius_km: number;
  style: string; season: string; duration_bucket: string; budget_tier: string;
}, supabaseUrl: string, serviceKey: string): Promise<CacheRow[]> {
  const supa = serviceClient(supabaseUrl, serviceKey);

  const adjSeasons = adjacentSeasons(ctx.season as Parameters<typeof adjacentSeasons>[0]);
  const allSeasons = [ctx.season, ...adjSeasons];

  let q = supa
    .from('rec_cache')
    .select('*')
    .ilike('city', ctx.city)
    .eq('style', ctx.style)
    .in('season', allSeasons)
    .order('google_rating', { ascending: false })
    .order('popularity_count', { ascending: false })
    .limit(6);

  if (ctx.budget_tier !== 'any') {
    q = q.or(`budget_tier.eq.${ctx.budget_tier},budget_tier.eq.any`);
  }

  const { data, error } = await q;
  if (error || !data) return [];

  // Additional geo filter when coordinates are available
  if (ctx.lat != null && ctx.lng != null) {
    const dLat = latDelta(ctx.radius_km);
    const dLng = lngDelta(ctx.radius_km, ctx.lat);
    const rows = data as CacheRow[];
  return rows.filter(r =>
      r.lat == null ||
      (Math.abs(r.lat - ctx.lat!) <= dLat && Math.abs((r.lng ?? 0) - ctx.lng!) <= dLng)
    );
  }

  return data as CacheRow[];
}

// ── Map cache row → AiSuggestion ─────────────────────────────────────────────

function cacheToSuggestion(r: CacheRow, style: string): AiSuggestion {
  return {
    id: r.rec_id,
    name: r.title,
    category: STYLE_TO_CATEGORY[style] ?? 'other',
    description: r.short_description ?? '',
    duration: r.avg_duration_min ?? 60,
    time: '10:00',
    distance: '—',
    open: true,
    rating: r.google_rating ?? undefined,
    priceLevel: r.price_level ?? undefined,
    location: r.area ?? r.city ?? undefined,
    mapsUrl: r.google_place_id
      ? `https://www.google.com/maps/place/?q=place_id:${r.google_place_id}`
      : undefined,
    // source fields forwarded via extended shape (SuggCard reads them)
    ...({ source_site: r.source_site, source_url: r.source_url } as object),
  };
}

// ── Claude fallback (persona-aware, direct call — no web search) ──────────────

const STYLE_LABEL: Record<string, string> = {
  food:    'restaurant, food market, or dining experience',
  bars:    'bar, craft cocktail spot, or local pub',
  quiet:   'peaceful, low-key, or contemplative place',
  relaxed: 'relaxed, casual, or leisurely spot',
  other:   'interesting place or experience',
};

const DURATION_LABEL: Record<string, string> = {
  short:    'under 2 hours',
  half_day: 'half a day (2–5 hours)',
  full_day: 'a full day (5+ hours)',
};

const BUDGET_LABEL: Record<string, string> = {
  low:  'free or budget-friendly',
  mid:  'mid-range',
  high: 'upscale or splurge-worthy',
  any:  '',
};

async function searchAndEnrich(ctx: {
  city: string; area?: string; country?: string;
  style: string; style_detail?: string;
  season: string; duration_bucket: string; budget_tier: string;
  locale: string; exclude?: string[];
}, googleKey: string): Promise<AiSuggestion[]> {
  const client = new Anthropic();
  const isHe = ctx.locale === 'he';

  const locationText = ctx.area ? `${ctx.area}, ${ctx.city}` : ctx.city;
  const styleLabel = ctx.style === 'other' && ctx.style_detail
    ? ctx.style_detail
    : STYLE_LABEL[ctx.style] ?? 'interesting place';
  const budgetLine = ctx.budget_tier !== 'any' ? ` that is ${BUDGET_LABEL[ctx.budget_tier]}` : '';
  const exclusionLine = ctx.exclude?.length
    ? `\nSkip these already-suggested names: ${ctx.exclude.join(', ')}.` : '';

  const langNote = isHe
    ? '\n\n🔴 כל שדות "name" ו-"description" חייבים להיות בעברית.'
    : '';

  const systemPrompt = isHe
    ? 'אתה מומחה טיולים מקומי. כלל ברזל: הפלט הוא אך ורק מערך JSON תקין — ללא markdown, ללא הקדמה, ללא שום טקסט מחוץ למערך. פתח מיד עם [.'
    : 'You are a local travel expert. Iron rule: output ONLY a raw JSON array — no markdown fences, no intro sentence, no explanation. Start your response with [ and end with ].';

  const userPrompt = `Recommend exactly 4 ${styleLabel}s${budgetLine} in ${locationText} during ${ctx.season}. Each should take ${DURATION_LABEL[ctx.duration_bucket] ?? '1–3 hours'} to enjoy.${exclusionLine}${langNote}

Output a JSON array of exactly 4 objects with keys: name, description, location.
Example shape (replace content):
[{"name":"...","description":"...","location":"..."},{"name":"...","description":"...","location":"..."},{"name":"...","description":"...","location":"..."},{"name":"...","description":"...","location":"..."}]`;

  // Prime the assistant turn with `[` so it can't prepend prose
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: '[' },
    ],
  });

  const textBlock = message.content.find(b => b.type === 'text');
  const rawText = '[' + (textBlock && textBlock.type === 'text' ? textBlock.text : '');

  // Extract the JSON array robustly — find the first [ … ] span
  let candidates: Array<{ name: string; description: string; location?: string }> = [];
  const arrayMatch = rawText.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) candidates = parsed;
    } catch {
      // partial array: try extracting complete objects
      try {
        const objects = [...arrayMatch[0].matchAll(/\{[^{}]*\}/g)].map(m => JSON.parse(m[0]));
        if (objects.length > 0) candidates = objects;
      } catch { /* give up */ }
    }
  }

  // Enrich each candidate with Google Places structured data
  const enriched = await Promise.allSettled(
    candidates.slice(0, 6).map(async (c): Promise<AiSuggestion | null> => {
      const query = `${c.name}, ${locationText}`;
      const place = googleKey ? await fetchPlaceData(query, googleKey) : null;

      return {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: c.name,
        category: STYLE_TO_CATEGORY[ctx.style] ?? 'other',
        description: c.description,
        duration: ctx.duration_bucket === 'short' ? 90 : ctx.duration_bucket === 'half_day' ? 210 : 390,
        time: '10:00',
        distance: '—',
        open: place?.currentOpeningHours?.openNow ?? true,
        rating: place?.rating,
        ratingCount: place?.userRatingCount,
        priceLevel: place?.priceLevel ? (PRICE_LEVEL_MAP[place.priceLevel] ?? undefined) : undefined,
        mapsUrl: place?.googleMapsUri,
        location: c.location ?? locationText,
        ...({ google_place_id: place?.id } as object),
      };
    })
  );

  return enriched
    .filter((r): r is PromiseFulfilledResult<AiSuggestion> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)
    .slice(0, 4);
}

// ── Store results to rec_cache ────────────────────────────────────────────────

async function storeToCache(
  suggestions: AiSuggestion[],
  ctx: {
    city: string; area?: string; country?: string; region?: string;
    lat?: number; lng?: number;
    style: string; style_detail?: string; duration_bucket: string;
    budget_tier: string; season: string;
  },
  supabaseUrl: string, serviceKey: string
): Promise<void> {
  const supa = serviceClient(supabaseUrl, serviceKey);

  const rows = suggestions.map(s => {
    const ext = s as AiSuggestion & { source_site?: string; source_url?: string; google_place_id?: string };
    return {
      country:           ctx.country ?? null,
      region:            ctx.region ?? null,
      city:              ctx.city,
      area:              ctx.area ?? null,
      lat:               ctx.lat ?? null,
      lng:               ctx.lng ?? null,
      style:             ctx.style,
      style_detail:      ctx.style_detail ?? null,
      duration_bucket:   ctx.duration_bucket,
      budget_tier:       ctx.budget_tier,
      season:            ctx.season,
      title:             s.name,
      short_description: s.description,
      source_site:       ext.source_site ?? null,
      source_url:        ext.source_url ?? null,
      google_place_id:   ext.google_place_id ?? null,
      google_rating:     s.rating ?? null,
      avg_duration_min:  s.duration ?? null,
      price_level:       s.priceLevel ?? null,
      last_served_at:    new Date().toISOString(),
      popularity_count:  1,
    };
  });

  // Upsert: if google_place_id already exists for city+style+season → increment
  for (const row of rows) {
    if (row.google_place_id) {
      const { data: existing } = await supa
        .from('rec_cache')
        .select('rec_id, popularity_count')
        .eq('google_place_id', row.google_place_id)
        .eq('city', row.city)
        .eq('style', row.style)
        .eq('season', row.season)
        .maybeSingle();

      if (existing) {
        await supa
          .from('rec_cache')
          .update({ popularity_count: (existing.popularity_count ?? 0) + 1, last_served_at: row.last_served_at })
          .eq('rec_id', existing.rec_id);
        continue;
      }
    }
    await supa.from('rec_cache').insert(row);
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Auth
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cs) => {
        try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  // Rate limit (shared with /api/ai/suggestions)
  const rl = checkRateLimit(`ai:${user.id}`, 10, 60);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 10);

  // Parse body
  let raw: unknown;
  try { raw = await request.json(); } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const parsed = RecommendBody.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const ctx = parsed.data;
  const supabaseUrl = SUPABASE_URL();
  const serviceKey = SUPABASE_SERVICE_ROLE_KEY();
  const googleKey = GOOGLE_MAPS_API_KEY();

  // ── Cache lookup ──────────────────────────────────────────────────────────
  const cacheHits = await queryCacheHits(
    { city: ctx.city, lat: ctx.lat, lng: ctx.lng, radius_km: ctx.radius_km,
      style: ctx.style, season: ctx.season, duration_bucket: ctx.duration_bucket,
      budget_tier: ctx.budget_tier },
    supabaseUrl, serviceKey
  );

  if (cacheHits.length >= 3) {
    // Update served-at + popularity (fire and forget)
    void serviceClient(supabaseUrl, serviceKey)
      .from('rec_cache')
      .update({ last_served_at: new Date().toISOString() })
      .in('rec_id', cacheHits.map(r => r.rec_id));

    // Increment popularity counts individually (can't bulk-increment easily)
    const supa2 = serviceClient(supabaseUrl, serviceKey);
    for (const r of cacheHits.slice(0, 4)) {
      void supa2.from('rec_cache')
        .update({ popularity_count: r.popularity_count + 1 })
        .eq('rec_id', r.rec_id);
    }

    const suggestions = cacheHits.slice(0, 4).map(r => cacheToSuggestion(r, ctx.style));
    return Response.json(suggestions);
  }

  // ── Claude fallback (awaited, returns JSON — no streaming protocol) ──────────
  try {
    const timeoutPromise = new Promise<AiSuggestion[]>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 22000)
    );

    const searchPromise = searchAndEnrich(
          {
            city: ctx.city, area: ctx.area, country: ctx.country,
            style: ctx.style, style_detail: ctx.style_detail,
            season: ctx.season, duration_bucket: ctx.duration_bucket,
            budget_tier: ctx.budget_tier, locale: ctx.locale,
            exclude: ctx.exclude,
          },
          googleKey
        );

    let suggestions: AiSuggestion[];
    let timedOut = false;
    try {
      suggestions = await Promise.race([searchPromise, timeoutPromise]);
    } catch (err) {
      timedOut = err instanceof Error && err.message === 'timeout';
      suggestions = [];
      if (!timedOut) throw err;
    }

    // Store to cache in background (don't block the response)
    if (suggestions.length > 0) {
      void storeToCache(suggestions, {
        city: ctx.city, area: ctx.area, country: ctx.country, region: ctx.region,
        lat: ctx.lat, lng: ctx.lng,
        style: ctx.style, style_detail: ctx.style_detail,
        duration_bucket: ctx.duration_bucket, budget_tier: ctx.budget_tier, season: ctx.season,
      }, supabaseUrl, serviceKey);
    }

    return Response.json(suggestions);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}

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

const WHITELIST_DOMAINS = [
  'lametayel.co.il',
  'tripadvisor.com',
  'travelandleisure.com',
  'nationalgeographic.com',
  'lonelyplanet.com',
  'atlasobscura.com',
];

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
  regularOpeningHours?: { openNow?: boolean };
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
        'X-Goog-FieldMask': 'places.id,places.rating,places.userRatingCount,places.googleMapsUri,places.priceLevel,places.regularOpeningHours.openNow',
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

// ── Web-search fallback via Claude ───────────────────────────────────────────

interface CandidatePlace {
  name: string;
  description: string;
  source_site?: string;
  source_url?: string;
}

async function searchAndEnrich(ctx: {
  city: string; area?: string; country?: string;
  style: string; style_detail?: string;
  season: string; duration_bucket: string; budget_tier: string;
  locale: string; exclude?: string[];
}, googleKey: string): Promise<AiSuggestion[]> {
  const client = new Anthropic();

  const locationText = ctx.area ? `${ctx.area}, ${ctx.city}` : ctx.city;
  const budgetHint = ctx.budget_tier !== 'any' ? ` (${ctx.budget_tier} budget)` : '';
  const durationHint =
    ctx.duration_bucket === 'short'    ? 'under 2 hours' :
    ctx.duration_bucket === 'half_day' ? 'half a day' : 'full day';
  const exclusionNote = ctx.exclude?.length
    ? ` Skip these already-suggested places: ${ctx.exclude.join(', ')}.` : '';

  const userPrompt = `Find exactly 4 recommended places for "${ctx.style}${ctx.style_detail ? ' — ' + ctx.style_detail : ''}" in ${locationText} during ${ctx.season}. Duration suitable for ${durationHint}.${budgetHint}${exclusionNote}

Search reputable travel sites and extract real, specific places. Return ONLY a JSON array of exactly 4 objects:
[{"name":"Place Name","description":"1-2 sentences, specific and vivid","source_site":"tripadvisor.com","source_url":"https://..."}]

Respond with valid JSON only.`;

  const response = await (client.beta.messages as unknown as {
    create: (params: object) => Promise<{
      content: Array<{ type: string; text?: string; }>
    }>
  }).create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    betas: ['web-search-2025-03-05'],
    tools: [{
      type: 'web_search_20250305',
      name: 'web_search',
      allowed_domains: WHITELIST_DOMAINS,
      max_uses: 3,
    }],
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Extract final text block from assistant response
  let jsonText = '';
  for (const block of response.content) {
    if (block.type === 'text' && block.text) {
      jsonText = block.text;
    }
  }

  // Parse candidates
  const clean = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  let candidates: CandidatePlace[] = [];
  try {
    candidates = JSON.parse(clean) as CandidatePlace[];
    if (!Array.isArray(candidates)) candidates = [];
  } catch {
    candidates = [];
  }

  // Enrich each candidate with Google Places
  const enriched = await Promise.allSettled(
    candidates.slice(0, 6).map(async (c): Promise<AiSuggestion | null> => {
      const query = `${c.name}, ${locationText}`;
      const place = googleKey ? await fetchPlaceData(query, googleKey) : null;

      // Filter out low-rated places
      if (place?.rating != null && place.rating < 4.0) return null;

      return {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: c.name,
        category: STYLE_TO_CATEGORY[ctx.style] ?? 'other',
        description: c.description,
        duration: ctx.duration_bucket === 'short' ? 90 : ctx.duration_bucket === 'half_day' ? 180 : 360,
        time: '10:00',
        distance: '—',
        open: place?.regularOpeningHours?.openNow ?? true,
        rating: place?.rating,
        ratingCount: place?.userRatingCount,
        priceLevel: place?.priceLevel ? (PRICE_LEVEL_MAP[place.priceLevel] ?? undefined) : undefined,
        mapsUrl: place?.googleMapsUri,
        location: locationText,
        ...({ source_site: c.source_site, source_url: c.source_url, google_place_id: place?.id } as object),
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

  // ── Internet fallback (streaming) ─────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const timeoutPromise = new Promise<AiSuggestion[]>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 7500)
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

        controller.enqueue(encoder.encode('\n__ENRICHED__' + JSON.stringify(suggestions)));

        if (timedOut) {
          controller.enqueue(encoder.encode('\n__PARTIAL__searching for more in the background'));
        }

        controller.close();

        // Store to cache after streaming (fire and forget)
        if (suggestions.length > 0) {
          void storeToCache(suggestions, {
            city: ctx.city, area: ctx.area, country: ctx.country, region: ctx.region,
            lat: ctx.lat, lng: ctx.lng,
            style: ctx.style, style_detail: ctx.style_detail,
            duration_bucket: ctx.duration_bucket, budget_tier: ctx.budget_tier, season: ctx.season,
          }, supabaseUrl, serviceKey);
        }

        // If we timed out, continue searching in the background and cache results
        if (timedOut) {
          searchAndEnrich(
            {
              city: ctx.city, area: ctx.area, country: ctx.country,
              style: ctx.style, style_detail: ctx.style_detail,
              season: ctx.season, duration_bucket: ctx.duration_bucket,
              budget_tier: ctx.budget_tier, locale: ctx.locale, exclude: ctx.exclude,
            },
            googleKey
          ).then(bg => {
            if (bg.length > 0) {
              return storeToCache(bg, {
                city: ctx.city, area: ctx.area, country: ctx.country, region: ctx.region,
                lat: ctx.lat, lng: ctx.lng,
                style: ctx.style, style_detail: ctx.style_detail,
                duration_bucket: ctx.duration_bucket, budget_tier: ctx.budget_tier, season: ctx.season,
              }, supabaseUrl, serviceKey);
            }
          }).catch(() => {});
        }
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

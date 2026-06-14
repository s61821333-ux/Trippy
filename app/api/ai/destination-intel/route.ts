import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const maxDuration = 20;

export interface DestinationIntel {
  currency:  string;
  tipping:   string;
  customs:   string;
  safety:    string;
  adapter:   string;
  emergency: string;
}

// Server-side cache — country facts barely change, so a warm instance can
// answer repeats (from any user) instantly without another Claude call.
// Note: browsers never cache POST responses, so Cache-Control alone did nothing.
const INTEL_TTL_MS = 24 * 60 * 60 * 1000;
const INTEL_CACHE_MAX = 500;
const intelCache = new Map<string, { data: DestinationIntel; ts: number }>();

// Persistent (DB) cache TTL — country facts barely change, so a month is plenty.
const DB_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function serviceClient() {
  try { return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), { auth: { persistSession: false } }); }
  catch { return null; }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? user.id;
  const rl = checkRateLimit(`ai:intel:user:${ip}`, 10, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 10);

  let body: { country?: string; locale?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const country = typeof body.country === 'string' ? body.country.trim().slice(0, 80) : '';
  const locale  = typeof body.locale  === 'string' ? body.locale : 'en';
  if (!country) return Response.json({ error: 'country required' }, { status: 400 });

  const cacheKey = `${country.toLowerCase()}|${locale}`;
  const hit = intelCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < INTEL_TTL_MS) {
    return Response.json(hit.data, { headers: { 'X-Cache': 'HIT' } });
  }

  // L2: persistent shared cache (Supabase). Survives serverless cold starts and
  // is shared across every user, so a given country's guide is generated once.
  const svc = serviceClient();
  if (svc) {
    try {
      const { data: row } = await svc
        .from('destination_guides')
        .select('data, updated_at')
        .eq('country', country.toLowerCase())
        .eq('locale', locale)
        .maybeSingle();
      if (row?.data && Date.now() - new Date(row.updated_at as string).getTime() < DB_TTL_MS) {
        const data = row.data as DestinationIntel;
        intelCache.set(cacheKey, { data, ts: Date.now() });
        return Response.json(data, { headers: { 'X-Cache': 'DB' } });
      }
    } catch { /* fall through to AI generation */ }
  }

  const langNote = locale === 'he'
    ? 'ענה בעברית. שמות פרטיים, מספרים וקודים — השאר באנגלית.'
    : 'Reply in English only.';

  const prompt = `Practical travel quick-facts for a visitor to ${country}. ${langNote}
Be specific and actionable — real numbers, real names, real tips. Not generic advice.
Return ONLY minified JSON (no markdown, no explanation):
{"currency":"local currency name, whether cards are widely accepted, and any cash tips","tipping":"local tipping norm with specific amounts or percentages","customs":"one concrete local etiquette rule that surprises most visitors","safety":"honest safety rating and one specific precaution that matters here","adapter":"plug type letter(s), voltage, and whether a converter/adapter is needed","emergency":"police number and ambulance number"}`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system:     locale === 'he'
        ? 'אתה מומחה מידע לטיולים. ענה אך ורק ב-JSON מינימלי בעברית. מידע ספציפי ומדויק בלבד.'
        : 'You are a practical travel expert. Return only minified JSON. Give specific, actionable facts — not generic travel advice.',
      messages:   [
        { role: 'user', content: prompt },
        // Prefill so the model can't prepend prose or markdown fences
        { role: 'assistant', content: '{' },
      ],
    });

    const raw   = '{' + (msg.content[0].type === 'text' ? msg.content[0].text.trim() : '}');
    const clean = raw.replace(/\s*```$/, '').trim();
    const data  = JSON.parse(clean) as DestinationIntel;

    if (intelCache.size >= INTEL_CACHE_MAX) {
      const oldest = intelCache.keys().next().value;
      if (oldest !== undefined) intelCache.delete(oldest);
    }
    intelCache.set(cacheKey, { data, ts: Date.now() });

    // Persist to the shared DB cache for every future user / serverless instance.
    if (svc) {
      try {
        await svc.from('destination_guides').upsert(
          { country: country.toLowerCase(), locale, data, updated_at: new Date().toISOString() },
          { onConflict: 'country,locale' },
        );
      } catch { /* cache write is best-effort */ }
    }

    return Response.json(data, { headers: { 'X-Cache': 'MISS' } });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'AI error' }, { status: 500 });
  }
}

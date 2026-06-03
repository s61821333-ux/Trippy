import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

export const maxDuration = 20;

export interface DestinationIntel {
  currency:  string;   // e.g. "Japanese Yen (¥). Cards widely accepted."
  tipping:   string;   // e.g. "Tipping is considered rude in Japan."
  customs:   string;   // e.g. "Remove shoes before entering homes."
  safety:    string;   // e.g. "Very safe. Watch for pickpockets in Shinjuku."
  adapter:   string;   // e.g. "Type A/B plugs, 100V. Bring a converter."
  emergency: string;   // e.g. "Police: 110  Ambulance: 119"
}

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

  // Light rate limit — this is called once per country per session
  const rl = checkRateLimit(`ai:intel:${user.id}`, 20, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 20);

  let body: { country?: string; locale?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const country = typeof body.country === 'string' ? body.country.trim().slice(0, 80) : '';
  const locale  = typeof body.locale  === 'string' ? body.locale : 'en';
  if (!country) return Response.json({ error: 'country required' }, { status: 400 });

  const heNote = locale === 'he'
    ? 'Reply in Hebrew. Keep numbers and proper nouns in English.'
    : '';

  const prompt = `Travel quick-facts for ${country}. ${heNote}
Return ONLY minified JSON (no markdown):
{"currency":"1 sentence about local currency and card acceptance","tipping":"1 sentence on tipping culture","customs":"1 key local custom travelers must know","safety":"1 sentence on safety level and top tip","adapter":"plug type, voltage, and whether a converter is needed","emergency":"police and ambulance numbers"}`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 250,
      system:     'Travel facts expert. Return only minified JSON.',
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw   = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const data  = JSON.parse(clean) as DestinationIntel;

    return Response.json(data, {
      headers: { 'Cache-Control': 'public, max-age=86400' }, // cache 24h at CDN
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'AI error' }, { status: 500 });
  }
}

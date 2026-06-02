import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

export const maxDuration = 20;

const VALID_CATS = ['Documents', 'Gear', 'Medical', 'Food', 'Water', 'Other'] as const;
type Cat = typeof VALID_CATS[number];

function safeCategory(raw: unknown): Cat {
  return VALID_CATS.includes(raw as Cat) ? (raw as Cat) : 'Other';
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

  const rl = checkRateLimit(`ai:packing:${user.id}`, 10, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 10);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const destination  = typeof body.destination  === 'string' ? body.destination  : 'Unknown';
  const days         = typeof body.days         === 'number' ? body.days          : 7;
  const startDate    = typeof body.startDate    === 'string' ? body.startDate     : undefined;
  const locale       = typeof body.locale       === 'string' ? body.locale        : 'en';
  const existing     = Array.isArray(body.existing) ? (body.existing as unknown[]).map(String) : [];
  const eventCats    = Array.isArray(body.eventCats) ? (body.eventCats as unknown[]).map(String) : [];
  const weatherSummary = typeof body.weather === 'string' ? body.weather : '';

  // Derive season from start date
  let season = '';
  if (startDate) {
    const m = new Date(startDate).getMonth();
    season = m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
  }

  const uniqueActivities = [...new Set(eventCats)].slice(0, 12).join(', ');
  const existingStr = existing.slice(0, 30).join(', ');
  const heNote = locale === 'he'
    ? 'Return all "name" values in Hebrew. Keep brand names in English.'
    : '';

  const prompt = `Packing list for a ${days}-day trip to ${destination}.${season ? ` Season: ${season}.` : ''}${weatherSummary ? ` Weather: ${weatherSummary}.` : ''}
Activities: ${uniqueActivities || 'general sightseeing'}.
Already packed: ${existingStr || 'nothing yet'} — do NOT repeat these.
${heNote}

Return ONLY a JSON array, no markdown:
[{"name":"Item name","category":"Documents|Gear|Medical|Food|Water|Other"}]

15–18 practical, specific items. Include destination-specific adapters, currency notes, and activity-relevant gear.
Skip items the hotel/airline always provides (hangers, basic toiletries if not relevant, etc).`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'Travel packing expert. Return only a JSON array. No markdown.',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw  = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]';
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const parsed = (JSON.parse(clean) as Array<{ name?: string; category?: string }>)
      .filter(i => i.name)
      .map(i => ({ name: String(i.name), category: safeCategory(i.category) }))
      .slice(0, 25);

    return Response.json({ items: parsed });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'AI error' }, { status: 500 });
  }
}

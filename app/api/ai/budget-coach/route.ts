import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

export const maxDuration = 20;

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

  // Generous rate limit - this is a lightweight call
  const rl = checkRateLimit(`ai:coach:${user.id}`, 20, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 20);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const tripName    = typeof body.tripName    === 'string' ? body.tripName  : 'your trip';
  const currency    = typeof body.currency    === 'string' ? body.currency  : 'USD';
  const budget      = typeof body.budget      === 'number' ? body.budget    : null;
  const spent       = typeof body.spent       === 'number' ? body.spent     : 0;
  const days        = typeof body.days        === 'number' ? body.days      : 1;
  const currentDay  = typeof body.currentDay  === 'number' ? body.currentDay : null;
  const daysLeft    = typeof body.daysLeft    === 'number' ? body.daysLeft  : null;
  const upcomingCost = typeof body.upcomingCost === 'number' ? body.upcomingCost : 0;
  const packedPct   = typeof body.packedPct   === 'number' ? body.packedPct : 0;
  const topCats     = Array.isArray(body.topCats) ? body.topCats as { name: string; amount: number }[] : [];
  const locale      = typeof body.locale      === 'string' ? body.locale    : 'en';

  const pct = budget ? Math.round((spent / budget) * 100) : null;

  const budgetLine = budget
    ? `Budget: ${currency} ${budget.toLocaleString()}  |  Spent: ${currency} ${spent.toLocaleString()} (${pct}%)  |  Remaining: ${currency} ${(budget - spent).toLocaleString()}`
    : `Spent so far: ${currency} ${spent.toLocaleString()} (no budget limit set)`;

  const dayLine = currentDay
    ? `Day ${currentDay} of ${days}${daysLeft != null ? ` - ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining` : ''}`
    : `${days}-day trip (not started yet)`;

  const catsLine = topCats.length
    ? `Top spending: ${topCats.map(c => `${c.name} ${currency}${c.amount.toLocaleString()}`).join(', ')}`
    : '';

  const heNote = locale === 'he'
    ? 'Reply in Hebrew. Keep numbers and currency codes in English.'
    : '';

  const prompt = `Budget coach for "${tripName}". Give exactly 2-3 sentences of direct, specific advice. No greeting, no sign-off. Reference real numbers. ${heNote}

${budgetLine}
Upcoming planned event costs: ${currency} ${upcomingCost.toLocaleString()}
${dayLine}
${catsLine}
Packing: ${packedPct}% complete`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system: locale === 'he'
        ? 'אתה יועץ תקציב לטיולים. ענה בעברית בלבד. 2-3 משפטים ישירים ומעשיים.'
        : 'You are a travel budget coach. Give 2-3 direct, actionable sentences. No filler.',
      messages: [{ role: 'user', content: prompt }],
    });

    const advice = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    return Response.json({ advice });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'AI error' },
      { status: 500 },
    );
  }
}

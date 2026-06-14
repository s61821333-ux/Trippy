import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const maxDuration = 30;

interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface ChatContext {
  tripName?: string;
  countries?: string[];
  days?: number;
  currentDay?: number;
  city?: string;
}

const MAX_TURNS = 14;          // most recent turns kept
const MAX_CONTENT = 2000;      // per-message character cap

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
  const rl = checkRateLimit(`ai:chat:user:${ip}`, 40, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 40);

  let body: { messages?: unknown; context?: ChatContext; locale?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const locale = body.locale === 'he' ? 'he' : 'en';
  const ctx = (body.context ?? {}) as ChatContext;

  // Validate + clamp the conversation.
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = raw
    .filter((m): m is ChatMessage =>
      !!m && typeof m === 'object' &&
      ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant') &&
      typeof (m as ChatMessage).content === 'string' && (m as ChatMessage).content.trim().length > 0)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT) }))
    .slice(-MAX_TURNS);

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return Response.json({ error: 'Last message must be from the user' }, { status: 400 });
  }

  const tripLine = [
    ctx.tripName ? `Trip: ${ctx.tripName}` : '',
    ctx.countries?.length ? `Destinations: ${ctx.countries.join(', ')}` : '',
    ctx.days ? `Length: ${ctx.days} days${ctx.currentDay ? ` (currently day ${ctx.currentDay})` : ''}` : '',
    ctx.city ? `Focused on: ${ctx.city}` : '',
  ].filter(Boolean).join(' · ');

  const system = locale === 'he'
    ? `אתה Haiko — בן הלוויה הידידותי לטיולים של אפליקציית Trippy. אתה עוזר למטיילים בעצות מעשיות, המלצות על מקומות אמיתיים, אוכל, תחבורה, תקציב ולוגיסטיקה.
${tripLine ? `הקשר הטיול הנוכחי — ${tripLine}.` : ''}
כללים: ענה בעברית, בקצרה וברורה (2–5 משפטים אלא אם ביקשו פירוט). תן שמות אמיתיים של מקומות ופרטים מעשיים, לא עצות גנריות. כשרלוונטי לכרטיסים/סיורים, ציין שאפשר להזמין דרך GetYourGuide. אל תמציא עובדות — אם אינך בטוח, אמור זאת.`
    : `You are Haiko — the friendly travel companion in the Trippy app. You help travelers with practical advice, real place recommendations, food, transport, budgeting and logistics.
${tripLine ? `Current trip context — ${tripLine}.` : ''}
Rules: reply in English, keep it concise and skimmable (2–5 sentences unless asked for detail). Give real place names and concrete, actionable specifics — never generic filler. When tickets or guided experiences are relevant, mention they can be booked on GetYourGuide. Don't invent facts; if unsure, say so.`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system,
      messages:   messages.map(m => ({ role: m.role, content: m.content })),
    });
    const reply = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : '';
    return Response.json({ reply });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'AI error' }, { status: 500 });
  }
}

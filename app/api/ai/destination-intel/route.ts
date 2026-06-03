import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
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

export async function POST(request: NextRequest) {
  // Destination intel is public travel information — no auth required.
  // Rate-limit by IP so the AI cost stays bounded (10 req/hr per IP).
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const rl = checkRateLimit(`ai:intel:ip:${ip}`, 10, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 10);

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
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'AI error' }, { status: 500 });
  }
}

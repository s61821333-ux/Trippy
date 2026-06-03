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

  const rl = checkRateLimit(`ai:receipt:${user.id}`, 15, 3600);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 15);

  let body: { imageBase64?: string; mediaType?: string };
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { imageBase64, mediaType = 'image/jpeg' } = body;
  if (!imageBase64) return Response.json({ error: 'imageBase64 required' }, { status: 400 });

  // Validate media type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const safeType = allowed.includes(mediaType) ? mediaType : 'image/jpeg';

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system:     'Receipt OCR. Return only valid JSON, no markdown.',
      messages: [{
        role: 'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: safeType as 'image/jpeg', data: imageBase64 },
          },
          {
            type: 'text',
            text: 'Extract from this receipt: merchant name, total amount (number only, no currency), and one category. Return ONLY JSON: {"description":"Merchant name","amount":0.00,"category":"food|transport|attraction|cafe|shopping|other"}. If you cannot read the receipt clearly, return {"error":"unreadable"}.',
          },
        ],
      }],
    });

    const raw   = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const data  = JSON.parse(clean) as { description?: string; amount?: number; category?: string; error?: string };

    if (data.error) return Response.json({ error: data.error }, { status: 422 });

    return Response.json({
      description: data.description ?? '',
      amount:      typeof data.amount === 'number' ? data.amount : 0,
      category:    data.category ?? 'other',
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'AI error' }, { status: 500 });
  }
}

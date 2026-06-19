import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_MAPS_API_KEY } from '@/lib/env'

// GET /api/places?input=TEXT
// Server-side proxy - keeps GOOGLE_MAPS_API_KEY off the client
export async function GET(request: NextRequest) {
  // Auth check - prevents anonymous quota exhaustion on Google Places API
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 60 autocomplete requests/60s per user
  const rl = checkRateLimit(`places:${user.id}`, 60, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60)

  const input = request.nextUrl.searchParams.get('input')?.trim()
  if (!input) return NextResponse.json([], { status: 200 })

  const key = GOOGLE_MAPS_API_KEY()
  if (!key) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', input)
  url.searchParams.set('key', key)
  url.searchParams.set('types', 'establishment|geocode')
  url.searchParams.set('limit', '5')

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    const data = await res.json()
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ error: data.status }, { status: 502 })
    }
    const predictions = (data.predictions ?? []).slice(0, 5)
    return NextResponse.json(predictions)
  } catch {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  }
}

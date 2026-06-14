import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_MAPS_API_KEY } from '@/lib/env'

// GET /api/places/details?place_id=PLACE_ID
// Resolves a Google Place ID to lat/lng + formatted address
export async function GET(request: NextRequest) {
  // Auth check - prevents anonymous quota exhaustion on Google Places Details API
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 60 detail lookups/60s per user
  const rl = checkRateLimit(`places-details:${user.id}`, 60, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60)

  const placeId = request.nextUrl.searchParams.get('place_id')?.trim()
  if (!placeId) return NextResponse.json({ error: 'Missing place_id' }, { status: 400 })

  const key = GOOGLE_MAPS_API_KEY()
  if (!key) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'geometry,formatted_address,name')
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
    const data = await res.json()
    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.status }, { status: 502 })
    }
    const result = data.result
    return NextResponse.json({
      name: result.name ?? result.formatted_address,
      formatted_address: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    })
  } catch {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  }
}

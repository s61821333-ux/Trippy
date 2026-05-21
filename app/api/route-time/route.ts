import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { GOOGLE_MAPS_API_KEY } from '@/lib/env'

// GET /api/route-time?olat=&olng=&dlat=&dlng=
// Returns travel time + distance for driving, walking, and transit modes.
export async function GET(request: NextRequest) {
  // Rate limit: 60 requests/60s per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = checkRateLimit(`route:${ip}`, 60, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60)

  const { searchParams } = request.nextUrl
  const olat = searchParams.get('olat')
  const olng = searchParams.get('olng')
  const dlat = searchParams.get('dlat')
  const dlng = searchParams.get('dlng')

  if (!olat || !olng || !dlat || !dlng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const key = GOOGLE_MAPS_API_KEY()
  if (!key) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  const modes = ['driving', 'walking', 'transit'] as const

  async function fetchMode(mode: string) {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.set('origins', `${olat},${olng}`)
    url.searchParams.set('destinations', `${dlat},${dlng}`)
    url.searchParams.set('mode', mode)
    url.searchParams.set('key', key!)
    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    const data = await res.json()
    const element = data?.rows?.[0]?.elements?.[0]
    if (!element || element.status !== 'OK') return null
    return {
      durationMins: Math.max(1, Math.round(element.duration.value / 60)),
      distanceKm: Math.round(element.distance.value / 100) / 10,
    }
  }

  try {
    const [driving, walking, transit] = await Promise.all(modes.map(fetchMode))
    if (!driving && !walking && !transit) {
      return NextResponse.json({ error: 'no_route' }, { status: 404 })
    }
    return NextResponse.json({ driving, walking, transit })
  } catch {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  }
}

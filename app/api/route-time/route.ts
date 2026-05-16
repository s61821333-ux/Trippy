import { NextRequest, NextResponse } from 'next/server'

// GET /api/route-time?olat=&olng=&dlat=&dlng=
// Returns driving time (minutes) and distance (km) via Google Distance Matrix
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const olat = searchParams.get('olat')
  const olng = searchParams.get('olng')
  const dlat = searchParams.get('dlat')
  const dlng = searchParams.get('dlng')

  if (!olat || !olng || !dlat || !dlng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  url.searchParams.set('origins', `${olat},${olng}`)
  url.searchParams.set('destinations', `${dlat},${dlng}`)
  url.searchParams.set('mode', 'driving')
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    const data = await res.json()
    const element = data?.rows?.[0]?.elements?.[0]
    if (!element || element.status !== 'OK') {
      return NextResponse.json({ error: 'no_route' }, { status: 404 })
    }
    return NextResponse.json({
      durationMins: Math.max(1, Math.round(element.duration.value / 60)),
      distanceKm: Math.round(element.distance.value / 100) / 10,
    })
  } catch {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

// GET /api/places?input=TEXT
// Server-side proxy — keeps GOOGLE_MAPS_API_KEY off the client
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input')?.trim()
  if (!input) return NextResponse.json([], { status: 200 })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', input)
  url.searchParams.set('key', key)
  url.searchParams.set('types', 'establishment|geocode')
  url.searchParams.set('limit', '5')

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
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

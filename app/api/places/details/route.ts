import { NextRequest, NextResponse } from 'next/server'

// GET /api/places/details?place_id=PLACE_ID
// Resolves a Google Place ID to lat/lng + formatted address
export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')?.trim()
  if (!placeId) return NextResponse.json({ error: 'Missing place_id' }, { status: 400 })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'geometry,formatted_address,name')
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
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

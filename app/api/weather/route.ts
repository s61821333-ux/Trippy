import { NextRequest, NextResponse } from 'next/server';

// GET /api/weather?lat=...&lng=...&start=YYYY-MM-DD&days=N
// Server-side proxy to Open-Meteo — clients never see the external domain.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat   = searchParams.get('lat');
  const lng   = searchParams.get('lng');
  const start = searchParams.get('start');
  const days  = searchParams.get('days');

  if (!lat || !lng || !start || !days) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate   = new Date(start);
  endDate.setDate(endDate.getDate() + Number(days) - 1);
  const toYMD = (d: Date) => d.toISOString().split('T')[0];

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',   lat);
  url.searchParams.set('longitude',  lng);
  url.searchParams.set('daily',      'temperature_2m_max,temperature_2m_min,weathercode');
  url.searchParams.set('timezone',   'auto');
  url.searchParams.set('start_date', toYMD(startDate));
  url.searchParams.set('end_date',   toYMD(endDate));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 });
  }
}

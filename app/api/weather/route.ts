import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_WEATHER_CONDITION_MAP: Record<string, { icon: string; label: string }> = {
  SUNNY:           { icon: '☀️',  label: 'Sunny' },
  CLEAR:           { icon: '☀️',  label: 'Clear' },
  MOSTLY_CLEAR:    { icon: '🌤',  label: 'Mostly clear' },
  PARTLY_CLOUDY:   { icon: '⛅',  label: 'Partly cloudy' },
  MOSTLY_CLOUDY:   { icon: '🌥️', label: 'Mostly cloudy' },
  CLOUDY:          { icon: '☁️',  label: 'Cloudy' },
  WINDY:           { icon: '💨',  label: 'Windy' },
  FROST:           { icon: '🌨',  label: 'Frost' },
  HAZY:            { icon: '🌫',  label: 'Hazy' },
  FOG:             { icon: '🌫',  label: 'Fog' },
  LIGHT_RAIN:      { icon: '🌦',  label: 'Light rain' },
  RAIN:            { icon: '🌧',  label: 'Rain' },
  HEAVY_RAIN:      { icon: '🌧',  label: 'Heavy rain' },
  THUNDERSTORM:    { icon: '⛈',  label: 'Thunderstorm' },
  LIGHT_SNOW:      { icon: '🌨',  label: 'Light snow' },
  SNOW:            { icon: '❄️',  label: 'Snow' },
  HEAVY_SNOW:      { icon: '❄️',  label: 'Heavy snow' },
  ICE:             { icon: '🌨',  label: 'Ice' },
  HAIL:            { icon: '🌨',  label: 'Hail' },
  WINTRY_MIX:      { icon: '🌨',  label: 'Wintry mix' },
  DRIZZLE:         { icon: '🌦',  label: 'Drizzle' },
};

const WMO: Record<number, { icon: string; label: string }> = {
  0:  { icon: '☀️',  label: 'Clear' },
  1:  { icon: '🌤',  label: 'Mainly clear' },
  2:  { icon: '⛅',  label: 'Partly cloudy' },
  3:  { icon: '☁️',  label: 'Overcast' },
  45: { icon: '🌫',  label: 'Fog' },
  48: { icon: '🌫',  label: 'Icy fog' },
  51: { icon: '🌦',  label: 'Drizzle' },
  53: { icon: '🌦',  label: 'Drizzle' },
  55: { icon: '🌧',  label: 'Heavy drizzle' },
  61: { icon: '🌧',  label: 'Light rain' },
  63: { icon: '🌧',  label: 'Rain' },
  65: { icon: '🌧',  label: 'Heavy rain' },
  71: { icon: '🌨',  label: 'Light snow' },
  73: { icon: '❄️',  label: 'Snow' },
  75: { icon: '❄️',  label: 'Heavy snow' },
  77: { icon: '🌨',  label: 'Snow grains' },
  80: { icon: '🌦',  label: 'Showers' },
  81: { icon: '🌧',  label: 'Heavy showers' },
  82: { icon: '🌧',  label: 'Violent showers' },
  85: { icon: '🌨',  label: 'Snow showers' },
  95: { icon: '⛈',  label: 'Thunderstorm' },
  96: { icon: '⛈',  label: 'Thunderstorm' },
  99: { icon: '⛈',  label: 'Heavy thunderstorm' },
};

function wmoToWeather(code: number): { icon: string; label: string } {
  return WMO[code] ?? WMO[0];
}

// Normalised daily shape returned to clients — same as before
interface DailyWeather {
  time:               string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode:        number[];   // kept for backward compat; set to 0 when using Google
  icon:               string[];
  label:              string[];
}

async function fetchGoogleWeather(
  lat: string, lng: string, days: number,
): Promise<DailyWeather | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const url = new URL('https://weather.googleapis.com/v1/forecast:lookup');
  url.searchParams.set('key',                key);
  url.searchParams.set('location.latitude',  lat);
  url.searchParams.set('location.longitude', lng);
  url.searchParams.set('days',               String(days));
  url.searchParams.set('languageCode',       'en');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = await res.json();
  const forecastDays = data?.forecastDays as any[];
  if (!Array.isArray(forecastDays) || forecastDays.length === 0) return null;

  const time:               string[] = [];
  const temperature_2m_max: number[] = [];
  const temperature_2m_min: number[] = [];
  const weathercode:        number[] = [];
  const icon:               string[] = [];
  const label:              string[] = [];

  for (const day of forecastDays) {
    const date = day.displayDate;
    if (!date) continue;
    const dateStr = `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`;
    time.push(dateStr);

    temperature_2m_max.push(Math.round(day.maxTemperature?.value ?? day.maxTemperature?.degrees ?? 0));
    temperature_2m_min.push(Math.round(day.minTemperature?.value ?? day.minTemperature?.degrees ?? 0));
    weathercode.push(0);

    const condType: string =
      day.daytimeForecast?.weatherCondition?.type ??
      day.daytimeForecast?.condition?.type ?? 'CLEAR';
    const mapped = GOOGLE_WEATHER_CONDITION_MAP[condType] ?? { icon: '☀️', label: condType };
    icon.push(mapped.icon);
    label.push(mapped.label);
  }

  return { time, temperature_2m_max, temperature_2m_min, weathercode, icon, label };
}

async function fetchOpenMeteoWeather(
  lat: string, lng: string, startDate: string, days: number,
): Promise<DailyWeather | null> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days - 1);
  const toYMD = (d: Date) => d.toISOString().split('T')[0];

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',   lat);
  url.searchParams.set('longitude',  lng);
  url.searchParams.set('daily',      'temperature_2m_max,temperature_2m_min,weathercode');
  url.searchParams.set('timezone',   'auto');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date',   toYMD(endDate));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = await res.json();
  const dates    = data?.daily?.time                as string[] ?? [];
  const maxTemps = data?.daily?.temperature_2m_max  as number[] ?? [];
  const minTemps = data?.daily?.temperature_2m_min  as number[] ?? [];
  const codes    = data?.daily?.weathercode         as number[] ?? [];

  const icon:  string[] = codes.map(c => wmoToWeather(c).icon);
  const label: string[] = codes.map(c => wmoToWeather(c).label);

  return {
    time:               dates,
    temperature_2m_max: maxTemps.map(Math.round),
    temperature_2m_min: minTemps.map(Math.round),
    weathercode:        codes,
    icon,
    label,
  };
}

// GET /api/weather?lat=...&lng=...&start=YYYY-MM-DD&days=N
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat   = searchParams.get('lat');
  const lng   = searchParams.get('lng');
  const start = searchParams.get('start');
  const days  = Number(searchParams.get('days') ?? '0');

  if (!lat || !lng || !start || !days) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    // Try Google Weather API first; fall back to Open-Meteo
    const googleData = await fetchGoogleWeather(lat, lng, days).catch(() => null);
    const daily = googleData ?? await fetchOpenMeteoWeather(lat, lng, start, days);

    if (!daily) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    return NextResponse.json(
      { daily, source: googleData ? 'google' : 'open-meteo' },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 });
  }
}

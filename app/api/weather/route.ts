import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_MAPS_API_KEY } from '@/lib/env';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

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
  const key = GOOGLE_MAPS_API_KEY();
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

const toYMD = (d: Date) => d.toISOString().split('T')[0];

// Open-Meteo forecast: works up to 16 days ahead
async function fetchOpenMeteoForecast(
  lat: string, lng: string, startDate: string, days: number,
): Promise<DailyWeather | null> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days - 1);

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

// Open-Meteo ERA5 archive: fetch the same calendar dates from one year ago as a climate estimate.
// Useful when trip is > 16 days away and no forecast is available.
async function fetchOpenMeteoClimateEstimate(
  lat: string, lng: string, startDate: string, days: number,
): Promise<(DailyWeather & { isEstimate: true }) | null> {
  // Shift dates back one year
  const start = new Date(startDate);
  start.setFullYear(start.getFullYear() - 1);
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);

  // Archive API only has data up to ~5 days before today
  const archiveCutoff = new Date();
  archiveCutoff.setDate(archiveCutoff.getDate() - 5);
  if (end > archiveCutoff) {
    // Clamp end to what's available
    end.setTime(archiveCutoff.getTime());
  }
  if (start > archiveCutoff) return null;

  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.searchParams.set('latitude',   lat);
  url.searchParams.set('longitude',  lng);
  url.searchParams.set('daily',      'temperature_2m_max,temperature_2m_min,weathercode');
  url.searchParams.set('timezone',   'auto');
  url.searchParams.set('start_date', toYMD(start));
  url.searchParams.set('end_date',   toYMD(end));

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } }); // cache 24h — historical
  if (!res.ok) return null;

  const data = await res.json();
  // Remap dates to the actual trip dates (not last year's dates)
  const historicTimes = data?.daily?.time               as string[] ?? [];
  const maxTemps      = data?.daily?.temperature_2m_max as number[] ?? [];
  const minTemps      = data?.daily?.temperature_2m_min as number[] ?? [];
  const codes         = data?.daily?.weathercode        as number[] ?? [];

  // Generate trip date strings
  const tripTimes: string[] = historicTimes.map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });

  const icon:  string[] = codes.map(c => wmoToWeather(c).icon);
  const label: string[] = codes.map(c => wmoToWeather(c).label);

  return {
    isEstimate:         true,
    time:               tripTimes,
    temperature_2m_max: maxTemps.map(Math.round),
    temperature_2m_min: minTemps.map(Math.round),
    weathercode:        codes,
    icon,
    label,
  };
}

const FORECAST_HORIZON_DAYS = 16;

// GET /api/weather?lat=...&lng=...&start=YYYY-MM-DD&days=N
export async function GET(request: NextRequest) {
  // Rate limit: 30 requests/60s per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = checkRateLimit(`weather:${ip}`, 30, 60)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 30)

  const { searchParams } = request.nextUrl;
  const lat   = searchParams.get('lat');
  const lng   = searchParams.get('lng');
  const start = searchParams.get('start');
  const days  = Number(searchParams.get('days') ?? '0');

  if (!lat || !lng || !start || !days) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    // Determine if the trip start is within forecast range
    const tripStart   = new Date(start + 'T00:00:00');
    const today       = new Date(); today.setHours(0, 0, 0, 0);
    const daysUntil   = Math.round((tripStart.getTime() - today.getTime()) / 86_400_000);
    const isFarFuture = daysUntil > FORECAST_HORIZON_DAYS;

    let daily: (DailyWeather & { isEstimate?: boolean }) | null = null;
    let source = 'unknown';

    if (!isFarFuture) {
      // Within forecast window — try Google first, then Open-Meteo forecast
      const googleData = await fetchGoogleWeather(lat, lng, days).catch(() => null);
      daily = googleData ?? await fetchOpenMeteoForecast(lat, lng, start, days);
      source = googleData ? 'google' : 'open-meteo';
    } else {
      // Too far out for a real forecast — use historical climate estimate
      daily = await fetchOpenMeteoClimateEstimate(lat, lng, start, days);
      source = 'climate-estimate';
    }

    if (!daily) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    return NextResponse.json(
      { daily, source, isEstimate: (daily as any).isEstimate ?? false },
      { headers: { 'Cache-Control': `public, s-maxage=${isFarFuture ? 86400 : 3600}, stale-while-revalidate=${isFarFuture ? 172800 : 7200}` } },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 });
  }
}

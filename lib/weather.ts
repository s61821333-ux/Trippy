// Weather utilities — uses Open-Meteo (free, no API key needed, HTTPS)
// Docs: https://open-meteo.com/en/docs

export interface WeatherDay {
  tempMax: number;
  tempMin: number;
  code: number;
  icon: string;
  label: string;
}

// WMO Weather interpretation codes → icon + label
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

interface WeatherCache {
  data: WeatherDay[];
  ts: number;
}
// key = "lat,lng,startDate"
const cache = new Map<string, WeatherCache>();
const CACHE_TTL = 3_600_000; // 1 hour

export async function fetchWeatherForTrip(
  lat: number,
  lng: number,
  startDateStr: string,
  days: number,
): Promise<WeatherDay[]> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)},${startDateStr},${days}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  // Open-Meteo allows up to 16 forecast days; use forecast API
  // For past trips we'd use the historical API but that requires a subscription.
  // We'll gracefully return [] for dates too far in the past or future.
  const start = new Date(startDateStr);
  const end = new Date(startDateStr);
  end.setDate(end.getDate() + days - 1);
  const toYMD = (d: Date) => d.toISOString().split('T')[0];

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',  String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('daily',     'temperature_2m_max,temperature_2m_min,weathercode');
  url.searchParams.set('timezone',  'auto');
  url.searchParams.set('start_date', toYMD(start));
  url.searchParams.set('end_date',   toYMD(end));

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const dates    = data?.daily?.time           as string[] ?? [];
    const maxTemps = data?.daily?.temperature_2m_max as number[] ?? [];
    const minTemps = data?.daily?.temperature_2m_min as number[] ?? [];
    const codes    = data?.daily?.weathercode    as number[] ?? [];

    const result: WeatherDay[] = dates.map((_, i) => {
      const code = codes[i] ?? 0;
      const { icon, label } = wmoToWeather(code);
      return {
        tempMax: Math.round(maxTemps[i] ?? 0),
        tempMin: Math.round(minTemps[i] ?? 0),
        code,
        icon,
        label,
      };
    });

    cache.set(key, { data: result, ts: Date.now() });
    return result;
  } catch {
    return [];
  }
}

export function getWeatherUrl(location: string): string {
  return `https://wttr.in/${encodeURIComponent(location)}`;
}

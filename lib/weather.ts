// Weather utilities — fetches via /api/weather (server-side proxy, no external domain exposed)

export interface WeatherDay {
  tempMax: number;
  tempMin: number;
  code: number;
  icon: string;
  label: string;
}

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

  const params = new URLSearchParams({
    lat:   String(lat),
    lng:   String(lng),
    start: startDateStr,
    days:  String(days),
  });

  try {
    const res = await fetch(`/api/weather?${params}`);
    if (!res.ok) return [];
    const data = await res.json();

    const dates    = data?.daily?.time                as string[] ?? [];
    const maxTemps = data?.daily?.temperature_2m_max  as number[] ?? [];
    const minTemps = data?.daily?.temperature_2m_min  as number[] ?? [];
    const codes    = data?.daily?.weathercode         as number[] ?? [];

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
  return `https://www.google.com/search?q=${encodeURIComponent(location + ' weather')}`;
}

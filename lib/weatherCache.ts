export interface DailyWeather {
  date: string;
  high: number;
  low: number;
  icon: string;
  label: string;
  precipitation?: number;
}

export interface WeatherData {
  daily: DailyWeather[];
  source?: string;
}

interface CacheEntry {
  data: WeatherData;
  lat: number;
  lng: number;
  ts: number;
}

const TTL = 30 * 60 * 1000; // 30 minutes — matches API revalidate
const COORD_TOLERANCE = 0.01; // ~1 km — same-city hits share cache
const cache: CacheEntry[] = [];

export async function getWeather(lat: number, lng: number, days: number): Promise<WeatherData> {
  const existing = cache.find(
    e =>
      Math.abs(e.lat - lat) < COORD_TOLERANCE &&
      Math.abs(e.lng - lng) < COORD_TOLERANCE &&
      Date.now() - e.ts < TTL,
  );
  if (existing) return existing.data;

  const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}&days=${days}`);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data: WeatherData = await res.json();

  cache.push({ data, lat, lng, ts: Date.now() });
  // Keep cache bounded — evict entries older than TTL
  const now = Date.now();
  const staleIdx = cache.findIndex(e => now - e.ts >= TTL);
  if (staleIdx !== -1) cache.splice(staleIdx, 1);

  return data;
}

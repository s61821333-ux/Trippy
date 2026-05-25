export interface RouteResult {
  driving: { durationMins: number; distanceKm: number } | null;
  walking: { durationMins: number; distanceKm: number } | null;
  transit: { durationMins: number; distanceKm: number } | null;
}

interface CacheEntry {
  result: RouteResult;
  ts: number;
}

const TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function key(olat: number, olng: number, dlat: number, dlng: number) {
  return `${olat.toFixed(5)},${olng.toFixed(5)}→${dlat.toFixed(5)},${dlng.toFixed(5)}`;
}

export function getCachedRoute(
  olat: number, olng: number, dlat: number, dlng: number,
): RouteResult | null {
  const hit = cache.get(key(olat, olng, dlat, dlng));
  if (hit && Date.now() - hit.ts < TTL) return hit.result;
  return null;
}

export function setCachedRoute(
  olat: number, olng: number, dlat: number, dlng: number,
  result: RouteResult,
) {
  cache.set(key(olat, olng, dlat, dlng), { result, ts: Date.now() });
}

export async function fetchRoute(
  olat: number, olng: number, dlat: number, dlng: number,
): Promise<RouteResult | null> {
  const cached = getCachedRoute(olat, olng, dlat, dlng);
  if (cached) return cached;

  const res = await fetch(
    `/api/route-time?olat=${olat}&olng=${olng}&dlat=${dlat}&dlng=${dlng}`,
  );
  if (!res.ok) return null;
  const result: RouteResult = await res.json();
  setCachedRoute(olat, olng, dlat, dlng, result);
  return result;
}

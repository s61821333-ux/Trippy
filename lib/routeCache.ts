export interface RouteResult {
  driving: { durationMins: number; distanceKm: number } | null;
  walking: { durationMins: number; distanceKm: number } | null;
  transit: { durationMins: number; distanceKm: number } | null;
}

interface CacheEntry {
  result: RouteResult;
  ts: number;
  departureTime?: number;
}

const TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function coordKey(olat: number, olng: number, dlat: number, dlng: number): string {
  return `${olat.toFixed(5)},${olng.toFixed(5)}→${dlat.toFixed(5)},${dlng.toFixed(5)}`;
}

// Round departure time to nearest 30 minutes for higher cache hit rate.
// 09:05 and 09:20 both resolve to the 09:00 slot.
function roundDeparture(ts?: number): number {
  if (!ts) return 0;
  return Math.round(ts / 1800) * 1800;
}

function cacheKey(
  olat: number, olng: number, dlat: number, dlng: number, departureTime?: number,
): string {
  return `${coordKey(olat, olng, dlat, dlng)}:${roundDeparture(departureTime)}`;
}

export function getCachedRoute(
  olat: number, olng: number, dlat: number, dlng: number, departureTime?: number,
): RouteResult | null {
  const hit = cache.get(cacheKey(olat, olng, dlat, dlng, departureTime));
  if (hit && Date.now() - hit.ts < TTL) return hit.result;
  return null;
}

export function setCachedRoute(
  olat: number, olng: number, dlat: number, dlng: number,
  result: RouteResult, departureTime?: number,
): void {
  cache.set(
    cacheKey(olat, olng, dlat, dlng, departureTime),
    { result, ts: Date.now(), departureTime },
  );
}

export async function fetchRoute(
  olat: number, olng: number, dlat: number, dlng: number, departureTime?: number,
): Promise<RouteResult | null> {
  const cached = getCachedRoute(olat, olng, dlat, dlng, departureTime);
  if (cached) return cached;

  const params = new URLSearchParams({
    olat: String(olat), olng: String(olng),
    dlat: String(dlat), dlng: String(dlng),
  });
  if (departureTime) params.set('departureTime', String(departureTime));

  const res = await fetch(`/api/route-time?${params.toString()}`);
  if (!res.ok) return null;
  const result: RouteResult = await res.json();
  setCachedRoute(olat, olng, dlat, dlng, result, departureTime);
  return result;
}

export interface BatchPair {
  olat: number; olng: number;
  dlat: number; dlng: number;
  departureTime?: number;
}

// Batch-fetch up to 25 route pairs in a single API call (§2.2 ME-1).
// Returns results in the same order as the input pairs.
export async function fetchBatchRoutes(
  pairs: BatchPair[],
): Promise<(RouteResult | null)[]> {
  const results: (RouteResult | null)[] = new Array(pairs.length).fill(null);
  const missing: { index: number; pair: BatchPair }[] = [];

  // Pull cache hits first
  for (let i = 0; i < pairs.length; i++) {
    const { olat, olng, dlat, dlng, departureTime } = pairs[i];
    const hit = getCachedRoute(olat, olng, dlat, dlng, departureTime);
    if (hit) {
      results[i] = hit;
    } else {
      missing.push({ index: i, pair: pairs[i] });
    }
  }

  if (missing.length === 0) return results;

  // Fetch uncached pairs in batches of 25
  const BATCH_SIZE = 25;
  for (let b = 0; b < missing.length; b += BATCH_SIZE) {
    const chunk = missing.slice(b, b + BATCH_SIZE);
    try {
      const body = {
        pairs: chunk.map(({ pair }) => ({
          olat: pair.olat, olng: pair.olng,
          dlat: pair.dlat, dlng: pair.dlng,
          departureTime: pair.departureTime,
        })),
      };
      const res = await fetch('/api/route-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) continue;
      const data: { results: (RouteResult | null)[] } = await res.json();
      for (let j = 0; j < chunk.length; j++) {
        const { index, pair } = chunk[j];
        const result = data.results[j] ?? null;
        results[index] = result;
        if (result) {
          setCachedRoute(pair.olat, pair.olng, pair.dlat, pair.dlng, result, pair.departureTime);
        }
      }
    } catch {
      // Network failure — leave affected indices as null
    }
  }

  return results;
}

import type { RouteResult } from './routeCache';

export type TravelMode = 'walking' | 'transit' | 'driving';

export interface ModeRecommendation {
  mode: TravelMode;
  reason: 'short_walk' | 'pleasant_walk' | 'time_critical' | 'eco_convenient' | 'fastest';
}

export function recommendMode(
  route: RouteResult,
  gapMinutes: number,
): ModeRecommendation {
  const walk = route.walking;
  const transit = route.transit;
  const drive = route.driving;

  // Derive distance in meters from km (driving gives best distance estimate)
  const distanceM = (drive?.distanceKm ?? walk?.distanceKm ?? transit?.distanceKm ?? 0) * 1000;

  // Under 600m: always walk
  if (distanceM < 600 && walk) {
    return { mode: 'walking', reason: 'short_walk' };
  }

  // Pleasant walk: under 20 min with enough gap buffer
  if (walk && walk.durationMins <= 20 && gapMinutes >= walk.durationMins + 15) {
    return { mode: 'walking', reason: 'pleasant_walk' };
  }

  // Time-crunched: pick fastest available mode
  if (gapMinutes < 30) {
    const candidates: { mode: TravelMode; t: number }[] = [
      { mode: 'walking', t: walk?.durationMins ?? Infinity },
      { mode: 'transit', t: transit?.durationMins ?? Infinity },
      { mode: 'driving', t: drive?.durationMins ?? Infinity },
    ];
    const fastest = candidates.sort((a, b) => a.t - b.t)[0];
    return { mode: fastest.mode, reason: 'time_critical' };
  }

  // Prefer transit over driving in cities (≤130% of driving time)
  if (transit && transit.durationMins <= (drive?.durationMins ?? Infinity) * 1.3) {
    return { mode: 'transit', reason: 'eco_convenient' };
  }

  return { mode: drive ? 'driving' : transit ? 'transit' : 'walking', reason: 'fastest' };
}

export type GapUrgency = 'overlap' | 'tight' | 'warning' | 'ok';

export function getGapUrgency(gapMinutes: number, travelMinutes: number): GapUrgency {
  const buffer = gapMinutes - travelMinutes;
  if (buffer < 0) return 'overlap';
  if (buffer < 10) return 'tight';
  if (buffer < 20) return 'warning';
  return 'ok';
}

export const URGENCY_COLORS: Record<GapUrgency, { line: string; badge: string; label: string }> = {
  overlap:  { line: 'var(--danger)',  badge: 'rgba(192,57,43,0.12)',   label: '⚠️ Overlap!' },
  tight:    { line: '#E67E22',        badge: 'rgba(230,126,34,0.10)',  label: 'Tight connection' },
  warning:  { line: '#F39C12',        badge: 'rgba(243,156,18,0.10)',  label: 'Allow travel time' },
  ok:       { line: 'rgba(99,102,241,0.5)', badge: 'rgba(99,102,241,0.08)', label: '' },
};

export const MODE_ICON: Record<TravelMode, string> = {
  walking: '🚶',
  transit: '🚇',
  driving: '🚗',
};

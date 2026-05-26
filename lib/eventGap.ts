import type { TripEvent } from './types';

export function getGapMinutes(current: TripEvent, next: TripEvent): number {
  const endMins = toMins(current.time) + (current.duration ?? 60);
  const nextStart = toMins(next.time);
  return nextStart - endMins;
}

function toMins(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export type GapUrgency = 'overlap' | 'tight' | 'warning' | 'ok';

export function getGapUrgency(gapMinutes: number, travelMinutes: number): GapUrgency {
  const buffer = gapMinutes - travelMinutes;
  if (buffer < 0) return 'overlap';
  if (buffer < 10) return 'tight';
  if (buffer < 20) return 'warning';
  return 'ok';
}

import type { Season } from './types';

const NORTHERN: Season[] = [
  'winter', 'winter', 'spring', 'spring', 'spring',
  'summer', 'summer', 'summer',
  'autumn', 'autumn', 'autumn',
  'winter',
];
const SOUTHERN: Season[] = [
  'summer', 'summer', 'autumn', 'autumn', 'autumn',
  'winter', 'winter', 'winter',
  'spring', 'spring', 'spring',
  'summer',
];

export function computeSeason(date: Date, lat: number): Season {
  return (lat >= 0 ? NORTHERN : SOUTHERN)[date.getMonth()];
}

export function adjacentSeasons(season: Season): Season[] {
  const idx = ['spring', 'summer', 'autumn', 'winter'].indexOf(season);
  const all: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  const prev = all[(idx + 3) % 4];
  const next = all[(idx + 1) % 4];
  return [prev, next];
}

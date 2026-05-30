/**
 * Maps event category → illustrated stamp key + left-stripe color.
 * Stamp keys reference STAMP_ICONS in lib/stampIcons.ts.
 * Colors match the stamp bg color so the left stripe echoes the seal.
 */
export const CAT_STAMP: Record<string, { key: string; color: string }> = {
  food:       { key: 'noodles',    color: '#C4714A' },
  cafe:       { key: 'coffee',     color: '#9C3F2C' },
  attraction: { key: 'museum',     color: '#C8944A' },
  hotel:      { key: 'hotel',      color: '#A03CB4' },
  rest:       { key: 'tent',       color: '#1A7840' },
  transport:  { key: 'car',        color: '#3B6E52' },
  flight:     { key: 'plane',      color: '#2A4894' },
  concert:    { key: 'concert',    color: '#7C22BE' },
  theme_park: { key: 'theme_park', color: '#D4531A' },
  sport:      { key: 'sport',      color: '#1A6E3C' },
  beach:      { key: 'beach',      color: '#E8C46E' },
  other:      { key: 'compass',    color: '#C4714A' },
};

export function catStamp(category: string): { key: string; color: string } {
  return CAT_STAMP[category] ?? CAT_STAMP.other;
}

/** Supply category → stamp key */
export const SUPPLY_STAMP: Record<string, string> = {
  Water:     'water_bottle',
  Food:      'noodles',
  Gear:      'backpack',
  Medical:   'first_aid',
  Documents: 'passport',
  Other:     'compass',
};

export function supplyStamp(category: string): string {
  return SUPPLY_STAMP[category] ?? 'compass';
}

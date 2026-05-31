/**
 * Maps event category → illustrated stamp key + left-stripe color.
 * Stamp keys reference STAMP_ICONS in lib/stampIcons.ts.
 * Colors match the stamp bg color so the left stripe echoes the seal.
 */
export const CAT_STAMP: Record<string, { key: string; color: string }> = {
  // Core
  food:         { key: 'noodles',        color: '#C4714A' },
  cafe:         { key: 'coffee',         color: '#9C3F2C' },
  attraction:   { key: 'museum',         color: '#C8944A' },
  hotel:        { key: 'hotel',          color: '#A03CB4' },
  rest:         { key: 'tent',           color: '#1A7840' },
  transport:    { key: 'car',            color: '#3B6E52' },
  flight:       { key: 'plane',          color: '#2A4894' },
  concert:      { key: 'concert',        color: '#7C22BE' },
  theme_park:   { key: 'theme_park',     color: '#D4531A' },
  sport:        { key: 'sport',          color: '#1A6E3C' },
  beach:        { key: 'beach',          color: '#E8C46E' },
  other:        { key: 'compass',        color: '#C4714A' },
  // Extended
  museum:       { key: 'museum',         color: '#1B6A9A' },
  hiking:       { key: 'hiking',         color: '#2B6E38' },
  nightlife:    { key: 'nightlife',      color: '#8B14C8' },
  shopping:     { key: 'shopping',       color: '#C42850' },
  spa:          { key: 'spa',            color: '#1E9B82' },
  nature_walk:  { key: 'pine_tree',      color: '#2B7A38' },
  cycling:      { key: 'bike',           color: '#1A7A4C' },
  boat:         { key: 'kayak',          color: '#1864B4' },
  cooking:      { key: 'noodles',        color: '#C06818' },
  theater:      { key: 'concert',        color: '#B418C4' },
  photography:  { key: 'camera',         color: '#1A5FA8' },
  winery:       { key: 'wine',           color: '#A41828' },
  safari:       { key: 'binoculars',     color: '#B48018' },
  festival:     { key: 'concert',        color: '#D44818' },
  water_sports: { key: 'kayak',          color: '#1878B4' },
  golf:         { key: 'stadium',        color: '#1A7838' },
  guided_tour:  { key: 'compass',        color: '#1E78A8' },
  national_park:{ key: 'pine_tree',      color: '#1C7840' },
  ski:          { key: 'skiing',         color: '#1858B4' },
  wellness:     { key: 'spa',            color: '#1E9476' },
  cultural:     { key: 'museum',         color: '#B47818' },
  religious:    { key: 'church',         color: '#A48830' },
  market:       { key: 'shopping',       color: '#C07018' },
  picnic:       { key: 'picnic',         color: '#A4A018' },
  hot_springs:  { key: 'hot_spring',     color: '#C84818' },
  aerial:       { key: 'hot_air_balloon',color: '#C86418' },
  cruise:       { key: 'ship',           color: '#1868A8' },
  farm:         { key: 'leaf',           color: '#A09018' },
  art:          { key: 'museum',         color: '#8C18B8' },
  cinema:       { key: 'camera',         color: '#3C38B8' },
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

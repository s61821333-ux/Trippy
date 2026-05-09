import { AiSuggestion, SupplyItem, Trip, TripTheme } from './types';

export const MOCK_TRIP: Trip = {
  name: 'Negev Desert Adventure',
  days: 4,
  startDate: '2026-07-14',
  participants: [
    { id: 1, name: 'Yoav', initials: 'YO', color: 'oklch(62% 0.15 195)' },
    { id: 2, name: 'Dana', initials: 'DA', color: 'oklch(60% 0.17 28)' },
    { id: 3, name: 'Miri', initials: 'MI', color: 'oklch(60% 0.14 148)' },
  ],
  dayMeta: [
    { region: 'Mitzpe Ramon',  emoji: '🏔️', lat: 30.62, lng: 34.82, desc: 'Ramon Crater' },
    { region: 'Avdat Valley',  emoji: '🏛️', lat: 30.79, lng: 34.77, desc: 'Ancient Nabatean' },
    { region: 'Dead Sea',      emoji: '🌊', lat: 31.20, lng: 35.36, desc: 'Lowest point on Earth' },
    { region: 'Timna & Eilat', emoji: '⚓', lat: 29.55, lng: 34.95, desc: 'Red Sea coast' },
  ],
  events: {
    1: [
      { id: 'e1', time: '07:00', duration: 60,  name: 'Morning camp breakfast',   category: 'food',       location: 'Ramon Crater Base', addedBy: 'Yoav', notes: 'Bring the camping stove' },
      { id: 'e2', time: '09:00', duration: 180, name: 'Makhtesh Ramon Hike',      category: 'attraction', location: 'Ramon Crater Rim',  addedBy: 'Dana', notes: 'Sunrise colors are magical' },
      { id: 'e3', time: '13:30', duration: 90,  name: 'Lunch at Beresheet Hotel', category: 'food',       location: 'Mitzpe Ramon',      addedBy: 'Yoav' },
      { id: 'e4', time: '16:00', duration: 120, name: 'Desert Jeep Tour',         category: 'transport',  location: 'Negev Highlands',   addedBy: 'Miri' },
      { id: 'e5', time: '19:30', duration: 60,  name: 'Stargazing setup',         category: 'rest',       location: 'Camp Site Alpha',   addedBy: 'Dana' },
    ],
    2: [
      { id: 'e6', time: '06:30', duration: 45,  name: 'Sunrise meditation',   category: 'rest',       location: 'Dune Ridge',       addedBy: 'Dana' },
      { id: 'e7', time: '08:00', duration: 120, name: 'Avdat National Park',  category: 'attraction', location: 'Avdat',            addedBy: 'Yoav', notes: 'Nabatean ruins — arrive early' },
      { id: 'e8', time: '12:00', duration: 60,  name: 'Lunch & shade rest',   category: 'food',       location: 'Ein Avdat Picnic', addedBy: 'Miri' },
      { id: 'e9', time: '15:00', duration: 90,  name: 'Ein Avdat Canyon',     category: 'attraction', location: 'Ein Avdat',        addedBy: 'Dana' },
    ],
    3: [
      { id: 'e10', time: '08:00', duration: 120, name: 'Dead Sea Morning Swim',     category: 'attraction', location: 'Ein Bokek Beach', addedBy: 'Yoav' },
      { id: 'e11', time: '11:00', duration: 60,  name: 'Masada via cable car',      category: 'attraction', location: 'Masada',          addedBy: 'Dana' },
      { id: 'e12', time: '14:00', duration: 90,  name: 'Lunch — Masada Rest House', category: 'food',       location: 'Masada',          addedBy: 'Miri' },
    ],
    4: [
      { id: 'e13', time: '09:00', duration: 60,  name: 'Pack & prep',         category: 'transport',  location: 'Camp Site Alpha', addedBy: 'Yoav' },
      { id: 'e14', time: '11:00', duration: 90,  name: 'Timna Valley Park',   category: 'attraction', location: 'Timna',           addedBy: 'Dana' },
      { id: 'e15', time: '14:00', duration: 60,  name: 'Final lunch — Eilat', category: 'food',       location: 'Eilat Port',      addedBy: 'Miri' },
    ],
  },
};

export const MOCK_AI_SUGGESTIONS: AiSuggestion[] = [
  { id: 's1', name: 'Alpaca Farm Mitzpe Ramon', category: 'attraction', description: 'A charming desert farm — perfect 45-min stop for the whole group.', duration: 45, time: '15:00', distance: '2.1 km', open: true },
  { id: 's2', name: 'Desert Bistro & Coffee',   category: 'cafe',       description: 'Acclaimed café with Bedouin coffee and a crater-view terrace.', duration: 60, time: '15:00', distance: '0.8 km', open: true },
  { id: 's3', name: 'Camel Crossing Viewpoint', category: 'attraction', description: '15-min walk to a spectacular vantage over the crater floor.', duration: 30, time: '15:15', distance: '1.4 km', open: true },
  { id: 's4', name: 'Bedouin Hospitality Tent', category: 'food',       description: 'Traditional tea and local bread with a Bedouin family — unforgettable.', duration: 60, time: '16:00', distance: '3.2 km', open: false },
];

export const MOCK_SUPPLIES: SupplyItem[] = [
  { id: 'sp1',  name: 'Water (3L/person/day)',     category: 'Water',    checked: true  },
  { id: 'sp2',  name: 'Sunscreen SPF50+',           category: 'Gear',     checked: true  },
  { id: 'sp3',  name: 'Hat / Buff',                 category: 'Gear',     checked: false },
  { id: 'sp4',  name: 'Electrolytes',               category: 'Food',     checked: true  },
  { id: 'sp5',  name: 'Snacks (nuts, dates, bars)', category: 'Food',     checked: false },
  { id: 'sp6',  name: 'First aid kit',              category: 'Medical',  checked: true  },
  { id: 'sp7',  name: 'Emergency blanket',          category: 'Gear',     checked: false },
  { id: 'sp8',  name: 'Headlamp + batteries',       category: 'Gear',     checked: false },
  { id: 'sp9',  name: 'Offline maps downloaded',    category: 'Gear',     checked: true  },
  { id: 'sp10', name: 'Multi-tool',                 category: 'Gear',     checked: false },
  { id: 'sp11', name: 'Power bank',                 category: 'Gear',     checked: true  },
  { id: 'sp12', name: 'Trash bags',                 category: 'Other',    checked: false },
  { id: 'sp13', name: 'Navigation (offline maps)',  category: 'Documents',checked: true  },
  { id: 'sp14', name: 'ID / Passport',              category: 'Documents',checked: false },
];

export const DEMO_TRIP_NAME = 'Negev Desert Adventure';
export const DEMO_TRIP_CODE = 'desert123';

const CITY_SUPPLIES: SupplyItem[] = [
  { id: 'cs1',  name: 'Passport / ID',              category: 'Documents', checked: false },
  { id: 'cs2',  name: 'Travel insurance',            category: 'Documents', checked: false },
  { id: 'cs3',  name: 'Museum / attraction tickets', category: 'Documents', checked: false },
  { id: 'cs4',  name: 'Rail / transit pass',         category: 'Documents', checked: false },
  { id: 'cs5',  name: 'Travel adapter',              category: 'Gear',     checked: false },
  { id: 'cs6',  name: 'Power bank',                  category: 'Gear',     checked: false },
  { id: 'cs7',  name: 'Comfortable walking shoes',   category: 'Gear',     checked: false },
  { id: 'cs8',  name: 'Rain jacket / umbrella',      category: 'Gear',     checked: false },
  { id: 'cs9',  name: 'Day backpack',                category: 'Gear',     checked: false },
  { id: 'cs10', name: 'Sunscreen SPF30',             category: 'Gear',     checked: false },
  { id: 'cs11', name: 'First aid kit',               category: 'Medical',  checked: false },
  { id: 'cs12', name: 'Pain relievers',              category: 'Medical',  checked: false },
  { id: 'cs13', name: 'Reusable water bottle',       category: 'Water',    checked: false },
  { id: 'cs14', name: 'Snacks for travel days',      category: 'Food',     checked: false },
];

const BEACH_SUPPLIES: SupplyItem[] = [
  { id: 'bs1',  name: 'Passport / ID',              category: 'Documents', checked: false },
  { id: 'bs2',  name: 'Travel insurance',           category: 'Documents', checked: false },
  { id: 'bs3',  name: 'Sunscreen SPF50+',           category: 'Gear',     checked: false },
  { id: 'bs4',  name: 'Swimwear',                   category: 'Gear',     checked: false },
  { id: 'bs5',  name: 'Beach towel',                category: 'Gear',     checked: false },
  { id: 'bs6',  name: 'Sunglasses',                 category: 'Gear',     checked: false },
  { id: 'bs7',  name: 'Flip flops',                 category: 'Gear',     checked: false },
  { id: 'bs8',  name: 'Waterproof phone case',      category: 'Gear',     checked: false },
  { id: 'bs9',  name: 'Power bank',                 category: 'Gear',     checked: false },
  { id: 'bs10', name: 'After-sun lotion',           category: 'Medical',  checked: false },
  { id: 'bs11', name: 'First aid kit',              category: 'Medical',  checked: false },
  { id: 'bs12', name: 'Reusable water bottle',      category: 'Water',    checked: false },
  { id: 'bs13', name: 'Snacks',                     category: 'Food',     checked: false },
];

const NATURE_SUPPLIES: SupplyItem[] = [
  { id: 'ns1',  name: 'Passport / ID',              category: 'Documents', checked: false },
  { id: 'ns2',  name: 'Park / trail permits',       category: 'Documents', checked: false },
  { id: 'ns3',  name: 'Water (2L/person)',           category: 'Water',    checked: false },
  { id: 'ns4',  name: 'Electrolytes',               category: 'Food',     checked: false },
  { id: 'ns5',  name: 'Trail snacks',               category: 'Food',     checked: false },
  { id: 'ns6',  name: 'Hiking boots',               category: 'Gear',     checked: false },
  { id: 'ns7',  name: 'Rain jacket',                category: 'Gear',     checked: false },
  { id: 'ns8',  name: 'Headlamp + batteries',       category: 'Gear',     checked: false },
  { id: 'ns9',  name: 'Sunscreen SPF50+',           category: 'Gear',     checked: false },
  { id: 'ns10', name: 'Offline maps downloaded',    category: 'Gear',     checked: false },
  { id: 'ns11', name: 'Power bank',                 category: 'Gear',     checked: false },
  { id: 'ns12', name: 'First aid kit',              category: 'Medical',  checked: false },
  { id: 'ns13', name: 'Emergency blanket',          category: 'Gear',     checked: false },
];

export function getThemeSupplies(theme: TripTheme): SupplyItem[] {
  switch (theme) {
    case 'city':    return CITY_SUPPLIES;
    case 'beach':   return BEACH_SUPPLIES;
    case 'nature':  return NATURE_SUPPLIES;
    case 'mountain':
    case 'snow':    return NATURE_SUPPLIES;
    default:        return MOCK_SUPPLIES;
  }
}

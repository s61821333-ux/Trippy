export type Category =
  // Core
  | 'food' | 'cafe' | 'attraction' | 'hotel' | 'rest' | 'transport' | 'flight' | 'concert'
  | 'theme_park' | 'sport' | 'beach' | 'other'
  // Extended
  | 'museum' | 'hiking' | 'nightlife' | 'shopping' | 'spa' | 'nature_walk' | 'cycling'
  | 'boat' | 'cooking' | 'theater' | 'photography' | 'winery' | 'safari' | 'festival'
  | 'water_sports' | 'golf' | 'guided_tour' | 'national_park' | 'ski' | 'wellness'
  | 'cultural' | 'religious' | 'market' | 'picnic' | 'hot_springs' | 'aerial' | 'cruise'
  | 'farm' | 'art' | 'cinema';

export interface Participant {
  id: number;
  name: string;
  initials: string;
  color: string;
}

export interface DayMeta {
  region: string;
  emoji: string;
  lat: number;
  lng: number;
  desc: string;
}

export interface TripEvent {
  id: string;
  time: string;       // "HH:MM"
  duration: number;   // minutes
  name: string;
  category: Category;
  location?: string;
  lat?: number;
  lng?: number;
  timezone?: string;  // IANA timezone of event location, e.g. "Europe/Rome"
  notes?: string;
  addedBy: string;
  cost?: number;                          // estimated cost in local currency
  votes?: Record<string, 'up' | 'down'>; // key = participant nickname
  tags?: string[];                        // custom labels e.g. ["Cash only", "Modest dress"]
}

export interface Gap {
  start: number;  // minutes from midnight
  end: number;
  duration: number;
}

export interface AiSuggestion {
  id: string;
  name: string;
  category: Category;
  description: string;
  duration: number;
  time: string;
  distance: string;
  open: boolean;
  cost?: number;
  location?: string;
  rating?: number;
  ratingCount?: number;
  priceLevel?: number;  // 1–4 from Google Places (1=$, 4=$$$$)
  mapsUrl?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: 'Water' | 'Food' | 'Gear' | 'Medical' | 'Documents' | 'Other';
  checked: boolean;
  assignee?: string;   // e.g. "Mom", "Timmy", "Mark"
  critical?: boolean;  // blocks progress bar from turning green
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitCount: number; // number of people splitting this
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'medical' | 'embassy' | 'personal' | 'insurance';
}

export type TripTheme = 'desert' | 'nature' | 'city' | 'beach' | 'mountain' | 'lake' | 'snow' | 'space' | 'sunset';

export interface TripInvitation {
  id: string;
  tripId: string;
  tripName: string;
  tripTheme: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface HotelStay {
  id: string;
  name?: string;
  location?: string;
  lat?: number;
  lng?: number;
  checkInDay: number;   // 1-indexed day number (inclusive)
  checkOutDay: number;  // 1-indexed day number (exclusive — don't show banner on this day)
}

export interface WishlistItem {
  id: string;
  name: string;
  category: Category;
  notes?: string;
  duration?: number;   // estimated minutes
  cost?: number;
  location?: string;
  lat?: number;
  lng?: number;
  addedBy: string;
}

export interface Trip {
  name: string;
  days: number;
  startDate: string;
  countries?: string[];
  participants: Participant[];
  dayMeta: DayMeta[];
  events: Record<number, TripEvent[]>;
  theme?: TripTheme;
  tripNotes?: string[];
  expenses?: Expense[];
  emergencyContacts?: EmergencyContact[];
  hotels?: HotelStay[];
  wishlist?: WishlistItem[];
  createdBy?: string;
  budget?: number;       // optional total budget limit for alerts
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export type Screen = 'splash' | 'welcome' | 'home' | 'dashboard' | 'day' | 'supplies' | 'settings' | 'notes' | 'map' | 'crew';

// ── AI Recommendation Engine ─────────────────────────────────────────────────

export type PersonaStyle =
  | 'food' | 'coffee' | 'bars' | 'nightlife'
  | 'culture' | 'museum' | 'art'
  | 'nature' | 'beach' | 'views'
  | 'shopping' | 'adventure' | 'wellness'
  | 'kids' | 'quiet' | 'other';
export type DurationBucket = 'short' | 'half_day' | 'full_day';
export type BudgetTier = 'low' | 'mid' | 'high' | 'any';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface QueryContext {
  country?: string;
  region?: string;
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
  radius_km: number;
  style: string;
  styles?: string[];
  style_detail?: string;
  duration_bucket: DurationBucket;
  budget_tier: BudgetTier;
  season: Season;
  // runtime-only fields (not stored in cache)
  dayNumber: number;
  tripName: string;
  locale: string;
  exclude?: string[];
}

export interface RecCacheEntry {
  rec_id: string;
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
  style: string;
  duration_bucket: string;
  budget_tier: string;
  season: string;
  title: string;
  short_description?: string;
  source_site?: string;
  source_url?: string;
  google_place_id?: string;
  google_rating?: number;
  avg_duration_min?: number;
  price_level?: number;
  popularity_count: number;
}

export type Category = 'food' | 'cafe' | 'attraction' | 'hotel' | 'rest' | 'transport' | 'flight' | 'other';

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
  notes?: string;
  addedBy: string;
  cost?: number;                          // estimated cost in local currency
  votes?: Record<string, 'up' | 'down'>; // key = participant nickname
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
}

export interface SupplyItem {
  id: string;
  name: string;
  category: 'Water' | 'Food' | 'Gear' | 'Medical' | 'Documents' | 'Other';
  checked: boolean;
}

export type TripTheme = 'desert' | 'nature' | 'city' | 'beach' | 'mountain' | 'lake' | 'snow' | 'space' | 'sunset';

export interface Trip {
  name: string;
  days: number;
  startDate: string;
  code?: string;
  participants: Participant[];
  dayMeta: DayMeta[];
  events: Record<number, TripEvent[]>;
  theme?: TripTheme;
  tripNotes?: string[]; // travel vault: freeform notes (confirmations, visa info, etc.)
}

export type Screen = 'login' | 'dashboard' | 'day' | 'supplies' | 'settings' | 'notes';

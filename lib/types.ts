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

export interface Trip {
  name: string;
  days: number;
  startDate: string;
  code?: string;
  participants: Participant[];
  dayMeta: DayMeta[];
  events: Record<number, TripEvent[]>;
  theme?: TripTheme;
  tripNotes?: string[];
  expenses?: Expense[];
  emergencyContacts?: EmergencyContact[];
}

export type Screen = 'login' | 'dashboard' | 'day' | 'supplies' | 'settings' | 'notes';

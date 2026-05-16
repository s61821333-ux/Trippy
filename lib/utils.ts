import { Category, Gap, Trip, TripEvent } from './types';

// ── Sunrise / sunset approximation (civil twilight) ─────────────────
export function getSunTimes(lat: number, dateStr: string): { sunrise: number; sunset: number } {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  const decl = 0.409 * Math.sin((2 * Math.PI / 365) * dayOfYear - 1.39);
  const latRad = (lat * Math.PI) / 180;
  const cosH = -Math.tan(latRad) * Math.tan(decl);
  if (cosH < -1 || cosH > 1) return { sunrise: 6 * 60, sunset: 18 * 60 };
  const h = (Math.acos(cosH) * 180) / Math.PI;
  return { sunrise: Math.round((12 - h / 15) * 60), sunset: Math.round((12 + h / 15) * 60) };
}

// Returns 'sunrise' | 'sunset' if event overlaps golden hour window, else null
export function getGoldenHourType(
  eventTimeMins: number,
  durationMins: number,
  lat: number,
  dateStr: string,
): 'sunrise' | 'sunset' | null {
  const { sunrise, sunset } = getSunTimes(lat, dateStr);
  const end = eventTimeMins + durationMins;
  const window = 50;
  if (eventTimeMins < sunset + 15 && end > sunset - window) return 'sunset';
  if (eventTimeMins < sunrise + window && end > sunrise - 15) return 'sunrise';
  return null;
}

// ── Conflict detection ───────────────────────────────────────────────
export function getConflicts(events: TripEvent[]): Set<string> {
  const sorted = [...events].sort((a, b) => toMins(a.time) - toMins(b.time));
  const conflicting = new Set<string>();
  for (let i = 0; i < sorted.length - 1; i++) {
    const aEnd = toMins(sorted[i].time) + sorted[i].duration;
    if (aEnd > toMins(sorted[i + 1].time)) {
      conflicting.add(sorted[i].id);
      conflicting.add(sorted[i + 1].id);
    }
  }
  return conflicting;
}

// ── Budget helpers ───────────────────────────────────────────────────
export function getDayBudget(events: TripEvent[]): number {
  return events.reduce((sum, e) => sum + (e.cost ?? 0), 0);
}

export function getTripBudget(trip: Trip): number {
  const eventsBudget = Object.values(trip.events).reduce((sum, evs) => sum + getDayBudget(evs), 0);
  const expensesBudget = (trip.expenses ?? []).reduce((sum, exp) => sum + exp.amount, 0);
  return eventsBudget + expensesBudget;
}

export const toMins = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export const toTime = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const fmtDate = (base: string, offset: number, locale = 'en-US'): string => {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
};

// dayEndMins: default 23*60; pass 27*60 for nightlife (3 AM next day)
export const getGaps = (evs: TripEvent[], dayEndMins = 23 * 60): Gap[] => {
  if (!evs?.length) return [];
  const sorted = [...evs].sort((a, b) => toMins(a.time) - toMins(b.time));
  const gaps: Gap[] = [];
  const dayStart = 7 * 60;
  let cur = dayStart;
  for (const e of sorted) {
    const st = toMins(e.time);
    if (st - cur >= 45) gaps.push({ start: cur, end: st, duration: st - cur });
    cur = Math.max(cur, st + e.duration);
  }
  if (dayEndMins - cur >= 45) gaps.push({ start: cur, end: dayEndMins, duration: dayEndMins - cur });
  return gaps;
};

export const CAT_META: Record<Category, { icon: string; label: string; color: string; bg: string }> = {
  food:       { icon: '🍽️', label: 'Food',      color: 'oklch(58% 0.16 55)',  bg: 'rgba(200,120,30,0.12)' },
  cafe:       { icon: '☕',  label: 'Café',      color: 'oklch(52% 0.14 65)',  bg: 'rgba(160,100,30,0.12)' },
  attraction: { icon: '📍', label: 'Sight',     color: 'oklch(52% 0.16 195)', bg: 'rgba(30,145,175,0.12)'  },
  hotel:      { icon: '🏨', label: 'Hotel',     color: 'oklch(52% 0.14 310)', bg: 'rgba(160,60,180,0.11)'  },
  rest:       { icon: '⛺', label: 'Rest',      color: 'oklch(52% 0.15 148)', bg: 'rgba(40,160,90,0.11)'   },
  transport:  { icon: '🚗', label: 'Drive',     color: 'oklch(50% 0.13 255)', bg: 'rgba(60,100,200,0.11)'  },
  flight:     { icon: '✈️', label: 'Flight',    color: 'oklch(46% 0.15 230)', bg: 'rgba(20,70,180,0.12)'   },
  other:      { icon: '✦',  label: 'Other',     color: 'oklch(52% 0.10 30)',  bg: 'rgba(180,90,50,0.10)'   },
};

export const fmtDuration = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// ── Smart day icon based on event keywords ──────────────────────────

const KEYWORD_ICONS: [RegExp, string][] = [
  [/music|concert|festival|show|theater|theatre|opera|gig|band/i,        '🎵'],
  [/museum|gallery|exhibit|art\b|culture/i,                               '🏛️'],
  [/hike|hiking|trail|trek|climb|peak|summit|canyon/i,                   '🥾'],
  [/beach|swim|snorkel|surf/i,                                            '🏄'],
  [/restaurant|dinner|lunch|breakfast|brunch|bistro/i,                    '🍽️'],
  [/cafe|coffee|bakery|pastry|espresso/i,                                 '☕'],
  [/flight|airport|landing|takeoff|take.?off|boarding|terminal|runway|plane|check.?in/i, '✈️'],
  [/jeep|train|ferry/i,                                                   '🚗'],
  [/camp|tent|bonfire|stargazing/i,                                       '⛺'],
  [/park|garden|forest|wildlife|zoo|safari|reserve/i,                     '🌲'],
  [/market|souk|bazaar|shopping|mall/i,                                   '🛍️'],
  [/spa|massage|wellness|yoga|meditat/i,                                  '🧘'],
  [/ruin|castle|temple|fort|ancient|nabatean|histor/i,                   '🏰'],
  [/kayak|canoe|sail|rafting/i,                                           '🚣'],
  [/ski|snowboard/i,                                                      '⛷️'],
  [/sunset|sunrise|viewpoint|vista|lookout|panorama/i,                   '🌅'],
  [/stadium|football|soccer|basketball|tennis/i,                         '⚽'],
  [/winery|brewery|cocktail bar/i,                                        '🍷'],
  [/balloon|skydiv|paraglid|zip.?line/i,                                 '🪂'],
  [/photo session|photo shoot/i,                                          '📸'],
  [/volcano|crater|lava/i,                                                '🌋'],
  [/cycling|bicycle/i,                                                    '🚴'],
  [/picnic/i,                                                             '🧺'],
  [/meditation|prayer|church|mosque|synagogue/i,                         '🙏'],
  [/river|waterfall|lake/i,                                               '🏞️'],
  [/city|downtown|old town|street/i,                                      '🏙️'],
  [/snow|ice/i,                                                           '❄️'],
  [/farm|ranch|vineyard/i,                                                '🌾'],
];

const CAT_FALLBACK: Record<Category, string> = {
  food: '🍽️', cafe: '☕', attraction: '🗺️', hotel: '🏨', rest: '⛺', transport: '🚗', flight: '✈️', other: '✨',
};

export function getDayIcon(events: TripEvent[], fallback = '🏔️'): string {
  if (!events?.length) return fallback;
  const sorted = [...events].sort((a, b) => b.duration - a.duration);
  for (const ev of sorted) {
    for (const [re, icon] of KEYWORD_ICONS) {
      if (re.test(ev.name)) return icon;
    }
  }
  return CAT_FALLBACK[sorted[0].category] ?? fallback;
}

// ── Next upcoming event across the whole trip ───────────────────────

export function getNextEvent(trip: Trip): { event: TripEvent; dayNum: number } | null {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  let currentDayNum = 1;
  if (trip.startDate) {
    const start = new Date(trip.startDate);
    start.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    currentDayNum = diffDays + 1;
  }

  // Find next upcoming event from today onward
  for (let d = Math.max(1, currentDayNum); d <= trip.days; d++) {
    const evs = [...(trip.events[d] ?? [])].sort((a, b) => toMins(a.time) - toMins(b.time));
    for (const ev of evs) {
      if (d > currentDayNum || toMins(ev.time) > currentMins) {
        return { event: ev, dayNum: d };
      }
    }
  }

  // Fallback: trip in future, trip ended, or all today's events passed — show first event
  for (let d = 1; d <= trip.days; d++) {
    const evs = [...(trip.events[d] ?? [])].sort((a, b) => toMins(a.time) - toMins(b.time));
    if (evs.length > 0) return { event: evs[0], dayNum: d };
  }

  return null;
}

// ── Carbon footprint estimate ───────────────────────────────────────
// Rough kg CO₂ per event based on category + duration
export function estimateCarbonKg(trip: Trip): number {
  let total = 0;
  for (const evs of Object.values(trip.events)) {
    for (const e of evs) {
      const mins = e.duration;
      if (e.category === 'flight')     total += mins * 1.53;  // ~800km/h, 115g/km/pax
      else if (e.category === 'transport') total += mins * 0.10; // ~60km/h, 100g/km
      else if (e.category === 'food' || e.category === 'cafe') total += 1.5; // avg meal
    }
  }
  return Math.round(total * 10) / 10;
}

// ── Smart trip insights ─────────────────────────────────────────────

export interface TripInsight {
  icon: string;
  title: string;
  description: string;
  type: 'gap' | 'tip' | 'balance' | 'ready' | 'eco' | 'pacing' | 'relax';
}

export function generateInsights(
  trip: Trip,
  packedCount: number,
  totalSupplies: number,
  t: (k: string) => string
): TripInsight[] {
  const insights: TripInsight[] = [];

  // Scheduling conflicts
  const conflictDays: number[] = [];
  for (let d = 1; d <= trip.days; d++) {
    if (getConflicts(trip.events[d] ?? []).size > 0) conflictDays.push(d);
  }
  if (conflictDays.length > 0) {
    insights.push({
      icon: '⚠️',
      title: conflictDays.length === 1 ? t('oneDayConflict').replace('{day}', conflictDays[0].toString()) : t('manyDaysConflict').replace('{count}', conflictDays.length.toString()),
      description: t('conflictDesc'),
      type: 'gap',
    });
  }

  // Pacing: days with 5+ events and no break >= 30 min
  const tiredDays: number[] = [];
  for (let d = 1; d <= trip.days; d++) {
    const evs = trip.events[d] ?? [];
    if (evs.length >= 5) {
      const sorted = [...evs].sort((a, b) => toMins(a.time) - toMins(b.time));
      let maxBreak = 0;
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = toMins(sorted[i + 1].time) - (toMins(sorted[i].time) + sorted[i].duration);
        if (gap > maxBreak) maxBreak = gap;
      }
      if (maxBreak < 30) tiredDays.push(d);
    }
  }
  if (tiredDays.length > 0 && insights.length < 3) {
    insights.push({
      icon: '😮‍💨',
      title: tiredDays.length === 1 ? t('oneDayPacked').replace('{day}', tiredDays[0].toString()) : t('manyDaysPacked').replace('{count}', tiredDays.length.toString()),
      description: t('packedDesc'),
      type: 'pacing',
    });
  }

  // Eco: trip has flights with no train/transit alternative flagged
  const flightCount = Object.values(trip.events).reduce(
    (acc, evs) => acc + evs.filter(e => e.category === 'flight').length, 0
  );
  if (flightCount > 0 && insights.length < 3) {
    const carbonKg = estimateCarbonKg(trip);
    insights.push({
      icon: '🌍',
      title: t('ecoTitle').replace('{carbon}', carbonKg.toString()),
      description: t('ecoDesc').replace('{count}', flightCount.toString()),
      type: 'eco',
    });
  }

  // Largest gap day
  let worstDay = -1;
  let worstHours = 0;
  for (let d = 1; d <= trip.days; d++) {
    const evs = trip.events[d] ?? [];
    if (!evs.length) continue;
    const totalGapMins = getGaps(evs).reduce((acc, g) => acc + g.duration, 0);
    if (totalGapMins / 60 > worstHours) {
      worstHours = totalGapMins / 60;
      worstDay = d;
    }
  }
  if (worstDay > 0 && worstHours >= 2 && insights.length < 3) {
    // For luxury/beach themes, celebrate the gap as relaxation time
    const isRelaxTheme = trip.theme === 'beach' || trip.theme === 'lake' || trip.theme === 'sunset';
    insights.push(isRelaxTheme ? {
      icon: '🌴',
      title: t('relaxTitle').replace('{day}', worstDay.toString()),
      description: t('relaxDesc').replace('{hours}', Math.round(worstHours).toString()),
      type: 'relax',
    } : {
      icon: '⚡',
      title: t('gapTitle').replace('{day}', worstDay.toString()),
      description: t('gapDesc').replace('{hours}', Math.round(worstHours).toString()),
      type: 'gap',
    });
  }

  // Days without food
  const noFoodDays: number[] = [];
  for (let d = 1; d <= trip.days; d++) {
    const evs = trip.events[d] ?? [];
    if (evs.length > 0 && !evs.some(e => e.category === 'food' || e.category === 'cafe')) {
      noFoodDays.push(d);
    }
  }
  if (noFoodDays.length > 0 && insights.length < 3) {
    const label = noFoodDays.length === 1
      ? `Day ${noFoodDays[0]}`
      : `Days ${noFoodDays.slice(0, 2).join(' & ')}`;
    insights.push({
      icon: '🍽️',
      title: t('foodTitle'),
      description: t('foodDesc').replace('{days}', label),
      type: 'balance',
    });
  }

  // Packing status
  if (totalSupplies > 0 && insights.length < 3) {
    const pct = Math.round((packedCount / totalSupplies) * 100);
    if (pct < 70) {
      insights.push({
        icon: '🎒',
        title: t('packedTitle').replace('{pct}', pct.toString()),
        description: t('packedDesc2').replace('{count}', (totalSupplies - packedCount).toString()),
        type: 'ready',
      });
    }
  }

  // Completely empty days
  const emptyDays = Array.from({ length: trip.days }, (_, i) => i + 1)
    .filter(d => !(trip.events[d]?.length));
  if (emptyDays.length > 0 && insights.length < 3) {
    insights.push({
      icon: '🗺️',
      title: emptyDays.length === 1 ? t('oneDayEmpty') : t('manyDaysEmpty').replace('{count}', emptyDays.length.toString()),
      description: emptyDays.length === 1 ? t('oneDayEmptyDesc').replace('{day}', emptyDays[0].toString()) : t('manyDaysEmptyDesc'),
      type: 'tip',
    });
  }

  // All good fallback
  const totalEvents = Object.values(trip.events).reduce((acc, evs) => acc + evs.length, 0);
  if (insights.length === 0 && totalEvents > 0) {
    insights.push({
      icon: '✅',
      title: t('trackTitle'),
      description: t('trackDesc').replace('{events}', totalEvents.toString()).replace('{days}', trip.days.toString()),
      type: 'ready',
    });
  }

  return insights.slice(0, 3);
}

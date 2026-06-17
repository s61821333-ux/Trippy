# Trippy — תיעוד מלא של הפרויקט

<div dir="rtl">

---

## תקציר

**Trippy** הוא אפליקציית ווב מבוססת דפדפן לתכנון טיולים אישיים וקבוצתיים בזמן אמת, ונועדה להיות **One Stop Shop** — כלי יחיד שמחליף את כל שיטות התכנון המסורבלות: שיחות WhatsApp, גיליונות Google Sheets ידניים ומסמכי Word פרטיים. האפליקציה פעילה ב-[letsexploring.com](https://letsexploring.com), פרוסה על Vercel, ונבנתה כולה בתהליך _Vibe Coding_ אינטנסיבי של כחודשיים תוך שימוש ב-Claude Code כ-co-pilot ראשי.

**הפרויקט** מביא ביחד:
- **Next.js** (App Router) עם SSR, ISR ו-Edge caching
- **Supabase** (Postgres + Auth + Realtime + Row Level Security) כשכבת נתונים
- **Claude (Anthropic)** — שמונה endpoints שונים של AI משולבים כחלק אינטגרלי ממהלך העבודה
- **PWA** עם Service Worker, offline support וחווית install
- מערכת עיצוב ייעודית **Liquid Glass** עם Design Tokens, אנימציות Framer Motion ותמיכה מלאה ב-RTL/LTR

---

## 1. הבעיה — למה Trippy קיים

תכנון טיול בארץ או בחו"ל מתבצע כיום באמצעות שילוב של כלים שלא נבנו לכך:

| כלי מקביל | מה הוא עושה | החיסרון המרכזי | הבידול של Trippy |
|-----------|------------|----------------|-----------------|
| WhatsApp | שיחה קבוצתית | אין מבנה; מידע קבור בהודעות | מסלול מובנה, מפה חיה, תקציב |
| Google Sheets | טבלה משותפת | ידני לחלוטין; אין חישוב תקציב; לא מתאים למובייל | ממשק מוצרי וחישוב הסדרי חובות אוטומטי |
| TripIt | ניהול נסיעות עסקיות | ממוקד טיסות/מלונות; לא קבוצתי; לא חינמי | חינמי, ממוקד קבוצה, מסלול יומי גמיש |
| Google Maps | מפות ומקומות | אין תכנון קבוצתי או תקציב; השירות הופסק | שילוב מפה + מסלול + תקציב + ציוד בכלי אחד |
| Word/Notion/נייר | מסמך אישי | אין שיתוף בזמן אמת; אין חישובים אוטומטיים | שיתוף חי ועוזר AI שבונה מסלול בשניות |

**קהל היעד:** קבוצות של 1–5 חברים או בני משפחה, בגילאי 20–45, המתכננים טיול באורך 2–14 ימים.

**הבידול המרכזי של Trippy:** ריכוז כל שכבות התכנון — מסלול, מפה, תקציב, ציוד והחלטות קבוצתיות — בכלי דפדפן אחד וחינמי, עם עוזר AI שמסוגל לתת עשרות הצעות ורעיונות ממקורות אמינים תוך שניות ולא רק לשמש כ-chatbot נלווה.

---

## 2. עיצוב וחוויית משתמש (UI/UX)

### מערכת עיצוב: "Liquid Glass"

הפרויקט נבנה לפי שפת עיצוב ייעודית בשם **Liquid Glass** (בהשראת OS26 של Apple), המיוצגת ב-Design Tokens מרכזיים:

```css
/* app/globals.css — משתני CSS */

/* שטחים — זכוכית מטושטשת */
--surface:        rgba(255, 255, 255, 0.72);
--surface-strong: rgba(255, 255, 255, 0.88);
--glass-blur:     blur(36px) saturate(1.8);
--glass-rim:      radial-gradient(ellipse 120% 50% at 50% 0%, rgba(255,255,255,.45) 0%, transparent 60%);

/* פלטה בפורמט oklch (גוון אדמתי וחם) */
--bg:           oklch(98% 0.010 75);   /* נייר לבן-חם */
--text:         oklch(13% 0.012 55);   /* דיו כהה */
--brand:        oklch(45% 0.150 152);  /* ירוק יער */
--terra:        oklch(65% 0.198 42);   /* טרה-קוטה */
--sand:         oklch(72% 0.162 73);   /* חול זהוב */

/* עומק — צללים מרובדים */
--shadow-sm: 0 2px 8px oklch(13% .012 55 / 5%), 0 1px 2px oklch(13% .012 55 / 4%);
--shadow-lg: 0 12px 40px oklch(13% .012 55 / 10%), 0 4px 12px oklch(13% .012 55 / 6%);
--shadow-xl: 0 24px 64px oklch(13% .012 55 / 12%), 0 8px 24px oklch(13% .012 55 / 7%);

/* רדיוסים */
--radius-sm: 16px;
--radius-md: 20px;
--radius-lg: 24px;   /* כרטיסים, containers לפי Jelly Glass spec */
```

הצבעים **לא כתובים כ-hardcoded hex** בשום מקום בקומפוננטות — הכל עובר דרך הטוקנים, מה שמאפשר מעבר חלק בין Light Mode ל-Dark Mode.

### Dark Mode

מימוש Dark Mode מתבצע באמצעות `data-dark="true"` על תגית `<html>` (ולא class), שמאפשר לוגיקת CSS נקייה:

```css
/* globals.css */
html[data-dark="true"] {
  --bg:      oklch(12% 0.010 55);
  --surface: rgba(255,255,255,0.06);
  --text:    oklch(94% 0.008 75);
}
```

הגדרת המצב נשמרת ב-`useUIStore` (Zustand), מוחזרת ל-localStorage, ומוחלת בעת טעינה ראשונה כדי למנוע רצד.

### טיפוגרפיה

| גופן | שימוש |
|------|-------|
| **DM Sans** (variable) | גוף, כפתורים, תוויות — Clear + Modern |
| **Instrument Serif** | כותרות גיבור וטקסטים מודגשים — חמימות |
| **JetBrains Mono** | נתוני כסף, שעות, timestamps |
| **Assistant** | עברית + לטינית שיחתית; Friendly |

### אנימציות

כל המעברים בין מסכים ואנימציות הכניסה/יציאה מבוצעות עם **Framer Motion**:

```tsx
// lib/motion.ts — preset אנימציות
export const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.18 } },
};

export const cardSpring = { type: 'spring', stiffness: 380, damping: 30 };
export const gentleBounce = { type: 'spring', stiffness: 220, damping: 18 };
```

### תכונות UX מרכזיות

- **Floating NavBar** — כפתור צף בתחתית המסך עם 5 tabs, badge עם count; מוסתר בזמן scroll ומופיע בעצירה
- **Skeleton Loaders** בכל מסך — תוכן מדומה בזמן טעינה; מונע תחושת "מסך ריק"
- **Toast Notifications** — ספריית toast ייעודית (`components/ui/Toast.tsx`) עם 4 סוגים: success/error/info/warning
- **TourOverlay** — tutorial אנימטיבי שמוצג למשתמש חדש בפעם הראשונה
- **TripEntryAnimation** — אנימציית כניסה מרשימה עם particles וחשיפת טקסט בטעינת הטיול
- **Error Boundary** — מונע קריסה כוללת של האפליקציה; מציג fallback UI
- **Haptic Feedback** (`lib/haptics.ts`) — רטט מגע (Vibration API) בפעולות מפתח
- **Gestures** (`lib/gestures.ts`) — swipe לניווט, pull-to-refresh

### תמיכה ב-RTL/LTR

כל ממשק המשתמש תומך מלא בעברית (RTL) ואנגלית (LTR), כולל:
- החלפה חלקה בין שפות ללא שבירת הפריסה
- עיצוב Mobile-first שנבדק מ-viewport של 390px ועד desktop
- מספרים ומטבעות מפורמטים לפי locale (`he-IL` / `en-US`)

---

## 3. מסכים ותזרים ראשי

### ארכיטקטורת מסכים

האפליקציה פועלת כ-SPA (Single Page Application) בתוך `AppShell.tsx`, שמנהל את ה-screen state דרך Zustand. המסכים:

```
/             → דף נחיתה (SSG, ללא auth)
/app          → AppShell (SSR + Client Shell)
/app/join/[token]  → קבלת הזמנה לטיול דרך לינק ציבורי
/auth/callback     → Google OAuth callback (server exchange)
/account/cancel-delete  → ביטול בקשת מחיקת חשבון
/account/confirm-delete → אישור מחיקת חשבון עם token
```

### תזרים מרכזי (מקצה לקצה)

```
1. משתמש מגיע → /   (דף נחיתה)
   ↓
2. לוחץ "Sign In with Google" → OAuth redirect → /auth/callback
   ↓
3. AppShell בודק session → checkAuth() → מציג מסך Welcome
   ↓
4. יצירת טיול חדש (שם, תאריכים, מדינות, נושא ויזואלי)
   → AI ממלא מטא-דאטה לכל יום אוטומטית
   ↓
5. Dashboard — סיכום תקציב, מזג אוויר, אירועים קרובים
   ↓
6. DayDetail — ציר זמן יומי עם 40+ קטגוריות, עריכה inline
   → לחיצה אחת → AI מציע אירועים לפעארים בלוח הזמנים
   ↓
7. Map — מפת Leaflet אינטרקטיבית עם markers לכל אירוע
   ↓
8. Budget — כל חבר מוסיף הוצאות; חישוב הסדרי חובות אוטומטי
   ↓
9. Packing — רשימת ציוד משותפת עם status וסיווג קריטיות
   ↓
10. הזמנת חברים — קישור הזמנה, קוד קצר, או מייל
```

---

## 4. פיצ'רים עיקריים — עומק טכני

### 4.1 מסלול יומי

**`components/screens/DayDetail_V2.tsx`** ו-**`components/DayTimelineView.tsx`**

- ציר זמן עם דיוק לדקה (24 שעות)
- 40+ קטגוריות אירוע, כל אחת עם emoji stamp + צבע token ייעודי (ראה `lib/categoryStamp.ts`, `lib/categoryTokens.ts`)
- גרירה וסידור מחדש (drag-and-drop)
- עריכה inline בלי לצאת מהמסך
- שעון עולמי לכל אירוע (`components/ui/WorldClock.tsx`) — מציג את הזמן המקומי ביעד לפי IANA timezone
- **זיהוי פעארים אוטומטי**: המערכת מחשבת פרקי זמן פנויים ומציעה "לחץ כאן לקבל הצעות AI"

### 4.2 מפה אינטרקטיבית

**`components/screens/Map_V2.tsx`** עם Leaflet.js

- Markers לכל אירוע עם צבע קטגוריה
- קווי מסלול בין אירועים ביום
- מיקומי מלון
- לחיצה על marker פותחת popup עם פרטי אירוע ולינק ישיר ל-Google Maps
- אוטוmaticant-fit למפה לפי גבולות כל האירועים של הטיול

### 4.3 תקציב ושיתוף הוצאות

- כל חבר מוסיף הוצאות עם תיאור, סכום ומספר משלמים
- **חישוב הסדרי חובות אוטומטי** (`lib/settlement.ts`) — מחשב מי חייב למי כמה, תוך מינימיזציה של מספר העברות
- תמיכה בריבוי מטבעות עם המרה בזמן אמת (Exchange Rates API)
- Dashboard מציג: תקציב כולל, כמה הוצא, כמה נשאר, ואחוז ניצול (gauge אנימטיבי)
- **התראות חכמות**: alert ב-80% וב-100% מהתקציב

```typescript
// lib/settlement.ts — עיקרון החישוב
export function calcSettlements(expenses: Expense[], participants: string[]): Settlement[] {
  // 1. מחשב net balance לכל משתתף
  // 2. ממיין לחייבים ולנושים
  // 3. מתאם העברות בקפידה (greedy algorithm)
  // 4. מחזיר מינימום העברות לסגירה
}
```

### 4.4 רשימת ציוד (Packing)

**`components/screens/Packing_V2.tsx`**

- קטגוריות: Water, Food, Gear, Medical, Documents, Other
- Toggle "packed" בלחיצה
- סיווג "קריטי" עם badge ויזואלי
- הקצאת אחראי לפריט
- **AI packing** — מייצר רשימה חכמה המותאמת ליעד, עונה ואורך הטיול (ראה סעיף AI)

### 4.5 הזמנת חברים ושיתוף פעולה

- **לינק הזמנה ציבורי** — token ייחודי, תוקף 7 ימים; `/app/join/[token]` לא דורש login מראש
- **הזמנה במייל** — שליחת מייל עם Supabase Auth Invite
- **קוד קצר** — 6 ספרות לשיתוף מהיר
- **Real-time collaboration** — כל שינוי מופיע אצל כל החברים תוך שניות (Supabase Realtime)

### 4.6 מזג אוויר

- **Open-Meteo API** (חינמי) — תחזית לטיול מהיום ועד 16 ימים קדימה
- **Google Weather API** (fallback) — לטיולים רחוקים בזמן מחשב climate estimate
- מוצג ב-Dashboard כסטריפ עם אייקון תנאי + טמפרטורה לכל יום

### 4.7 דוח חירום

- **`emergency_contacts`** בבסיס הנתונים — אנשי קשר לשעת חירום: רפואי, שגרירות, אישי, ביטוח
- גישה מהירה מ-DayDetail בלחיצה אחת
- מוצגים ב-widget צף עם מספרי טלפון להתקשרות ישירה

---

## 5. בינה מלאכותית (AI) — 8 Endpoints

זהו הלב הטכנולוגי של Trippy. ה-AI **אינו** chatbot נלווה — הוא חלק אינטגרלי בשמונה נקודות שונות במוצר.

### 5.1 תשתית AI

כל endpoints עובדים עם **Claude Haiku** (`claude-haiku-4-5-20251001`) דרך `@anthropic-ai/sdk`:
- Rate limiting מבוסס Supabase RPC דו-שכבתי: in-memory (מהיר) + DB (עמיד)
- Token budget דינמי — מחושב לפי אורך הטיול
- Prefilling של תשובת המסייע (האות `{` או `[`) למניעת prose/markdown wrapper
- גרייסי degradation — timeout → fallback לarray ריק, לא קריסה

```typescript
// דוגמה לפרייפיל ב-/api/ai/suggestions/route.ts
const msg = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 1400,
  messages: [
    { role: 'user', content: systemPrompt },
    { role: 'assistant', content: '[' }, // ← prefill — מבטיח JSON array
  ],
});
```

### 5.2 תיאור כל Endpoint

#### 🗓️ `/api/ai/plan-trip` — תכנון מסלול מלא (Streaming)

**Rate Limit:** 5 בקשות/שעה/משתמש  
**קלט:** יעד, ימים, מספר מטיילים, קצב (רגוע/מאוזן/אינטנסיבי), תחומי עניין, תקציב  
**פלט:** JSON מלא עם ימים, אירועים, רשימת ציוד, טיפים, אזורים  
**Token Budget:** 1,000–6,000 טוקנים בהתאם לאורך הטיול  
**Streaming:** `ReadableStream` לחווית טיפינג חלקה

```typescript
// /api/ai/plan-trip/route.ts
const tokenBudget = Math.min(6000, Math.max(1000, days * 420));

const stream = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: tokenBudget,
  stream: true,
  messages: [{
    role: 'user',
    content: `Plan a ${days}-day trip to ${destination} for ${travelers} traveler(s).
    Pace: ${pace}. Interests: ${interests.join(', ')}. Budget: ${budget}/person.
    Return ONLY valid JSON with structure: { days: [...], packing: [...], tips: [...] }`
  }, {
    role: 'assistant',
    content: '{' // ← prefill
  }]
});
```

#### 💡 `/api/ai/suggestions` — הצעות חכמות לפעארים

**Rate Limit:** 10 בקשות/שעה/משתמש  
**קלט:** עיר, סגנון, עונה, תקציב, משך, locale  
**מנגנון Cache:** קודם מחפש ב-`rec_cache` (לפי city+style+season+budget) — אם יש >3 תוצאות, מחזיר אותן ישירות ללא קריאה ל-AI. אחרת, קורא ל-Claude, שומר ב-cache, ומעשיר עם Google Places (דירוג, שעות פתיחה).

```typescript
// /api/ai/suggestions/route.ts — לוגיקת cache
const cached = await supabase
  .from('rec_cache')
  .select('*')
  .eq('city', city).eq('style', style).eq('season', season)
  .gt('last_served_at', cutoff);

if (cached.data && cached.data.length >= 3) {
  return NextResponse.json({ suggestions: cached.data, fromCache: true });
}
// אחרת → Claude → Google Places enrichment → save to rec_cache
```

#### 💰 `/api/ai/budget-coach` — ייעוץ תקציבי

**Rate Limit:** 20 בקשות/שעה/משתמש  
**קלט:** שם טיול, מטבע, תקציב, הוצאה עד כה, ימים, יום נוכחי, עלויות אירועים קרובים, % ציוד ארוז, top categories  
**פלט:** 2–3 משפטים של עצה actionable  

הייחוד: ה-AI מקבל את **הנתונים האמיתיים** מהתקציב של המשתמש, לא ייעוץ גנרי.

#### 🧾 `/api/ai/scan-receipt` — סריקת קבלה

**Rate Limit:** 15 בקשות/שעה/משתמש  
**קלט:** תמונה ב-base64 (JPEG/PNG/WebP/GIF)  
**Claude Vision API:** מחלץ שם בית עסק, סכום כולל, קטגוריה  
**Graceful degradation:** אם "unreadable" — מחזיר `{ merchant: null, amount: null, category: 'Other' }` במקום שגיאה

#### 🌍 `/api/ai/destination-intel` — מידע מקדים על יעד

**Rate Limit:** 10 בקשות/שעה/IP  
**Cache דו-שכבתי:**
1. **In-memory** (24 שעות) — מיידי
2. **`destination_guides` DB table** (30 יום) — שמור לכל instances

**פלט:** מטבע, שיטת tipping, מנהגים, בטיחות, מתאמי חשמל, מספרי חירום

#### 🎒 `/api/ai/packing` — רשימת ציוד חכמה

**Rate Limit:** 10 בקשות/שעה/משתמש  
**שיקולים:** יעד, עונה (נגזר מתאריך ההתחלה), פעילויות מתוכננות, פריטים קיימים כבר  
**מוּדע ליעד:** מתח חשמל, קוד לבוש, סיכוני בריאות מקומיים

#### 🤖 `/api/ai/chat` — Haiko Chatbot

**מודל:** claude-haiku (הכי מהיר; 700 טוקנים per response)  
**Rate Limit:** 40 בקשות/שעה/IP  
**Context:** קולט שם הטיול, מדינות, ימים, יום נוכחי, עיר  
**Multi-turn:** שומר עד 14 סיבובי שיחה  
**Locale-aware:** מגיב בעברית אם `locale=he`; בלשון חברותית ותמציתית

```typescript
// /api/ai/chat/route.ts — system prompt
const systemPrompt = locale === 'he'
  ? `אתה הייקו, עוזר טיולים ידידותי...`
  : `You are Haiko, a friendly travel assistant...`;
```

#### 📍 `/api/ai/recommend` — המלצות מוצרניות

דומה ל-suggestions, אך persona-aware — לוקח בחשבון את הגדרות הפרסונה של הטיול (סגנון, תחומי עניין, העדפות תקציב).

---

## 6. ניהול מצב — Zustand

### ארכיטקטורת Store

האפליקציה משתמשת ב-**Zustand** עם 4 stores שעוברים refactor הדרגתי:

| Store | קובץ | תפקיד |
|-------|------|--------|
| `useAppStore` | `lib/store.ts` (1100+ שורות) | Store מרכזי — כולל הכל |
| `useUIStore` | `lib/stores/uiStore.ts` | מצב UI בלבד (מסך, theme, accessibility) |
| `useUserStore` | `lib/stores/userStore.ts` | identity, auth actions |
| `useTripStore` | `lib/stores/tripStore.ts` | mutations ספציפיות לטיול |
| `useSessionStore` | `lib/stores/sessionStore.ts` | session identity |

### מה נשמר ב-localStorage

```typescript
// lib/store.ts — Zustand persist config
persist(
  (set, get) => ({ ... }),
  {
    name: 'trippy-store',
    partialize: (state) => ({
      nickname:          state.nickname,
      activeDay:         state.activeDay,
      themeMode:         state.themeMode,
      highContrast:      state.highContrast,
      reducedMotion:     state.reducedMotion,
      currencyByTrip:    state.currencyByTrip,
      userId:            state.userId,
      tripDbId:          state.tripDbId,
      termsAccepted:     state.termsAccepted,
      pendingChanges:    state.pendingChanges,  // offline queue
      lastSessionAt:     state.lastSessionAt,
      // לא נשמר: trip, supplies, screen (תמיד מתחיל מ-splash)
    }),
  }
)
```

### Offline Support

```typescript
// תור שינויים offline
interface OfflineChange {
  type: 'addEvent' | 'editEvent' | 'deleteEvent' | 'addExpense' | ...;
  payload: unknown;
  timestamp: number;
}

// flushPendingChanges — מופעל בחזרה לאונליין
flushPendingChanges: async () => {
  const changes = get().pendingChanges;
  for (const change of changes) {
    await applyChange(change); // retry לפי type
  }
  set({ pendingChanges: [] });
}
```

### Real-time Subscriptions

```typescript
// AppShell.tsx — Supabase Realtime
const channel = supabase.channel(`trip-full:${tripId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `trip_id=eq.${tripId}` }, 
    debounce(() => loadTripById(tripId), 150)
  )
  // + expenses, supplies, day_meta, hotels, trips
  .subscribe();

// fallback polling (WebSocket timeout)
const pollInterval = setInterval(() => loadTripById(tripId), 30_000);
```

---

## 7. Backend ו-API Routes

### 33 API Routes

**Auth & Account:**
- `POST /api/account/delete/request` — יצירת בקשת מחיקה + שליחת מייל עם token
- `POST /api/account/delete/confirm?token=X` — מחיקה סופית של משתמש + כל נתוניו
- `POST /api/account/delete/cancel` — ביטול בקשת מחיקה
- `GET /api/auth/callback` — exchange OAuth code לסשן

**Trip Management:**
- `POST /api/trips/create` — יצירת טיול עם days + metadata
- `GET /api/trips` — רשימת הטיולים של המשתמש
- `GET /api/trips/[tripId]` — טעינת טיול מלא (server-side, עוקף RLS לבדיקת גישה)
- `PATCH /api/trips/[tripId]` — עדכון פרטי טיול

**Trip Sub-resources (events, expenses, supplies, hotels, emergency-contacts, wishlist, day-meta, invite-link):**

כל endpoint משתמש ב-`service role key` ב-server (שאינו חשוף ל-client) לפעולות הרגישות:

```typescript
// pattern אחיד בכל API route
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = createServiceClient(); // service role — עוקף RLS
  const { userId } = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // rate limiting
  const limited = await checkRateLimit(`create:${userId}`, 5, 3600);
  if (limited) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  
  // Zod validation
  const body = createEventSchema.parse(await req.json());
  
  // DB operation
  const { data, error } = await supabase.from('events').insert(body).select().single();
  // ...
}
```

**External Data:**
- `GET /api/weather` — Google Weather + Open-Meteo fallback; cache: 1h
- `GET /api/exchange-rates` — open.er-api.com; cache: 1h via `unstable_cache`
- `GET /api/places` — Google Places autocomplete; rate-limited; proxied
- `GET /api/places/details` — דירוג, שעות פתיחה
- `GET /api/route-time` — זמן נסיעה בין מיקומים; cache: 7 ימים
- `GET /api/timezone` — IANA timezone לקואורדינטות

---

## 8. בסיס הנתונים (Supabase / Postgres)

### ERD — טבלאות מרכזיות

| טבלה | תפקיד | קשר |
|------|--------|-----|
| `trips` | פרטי טיול, תקציב, participants, day_meta (JSONB) | root |
| `trip_participants` | שיוך משתמשים לטיול + תפקיד (owner/member) | → trips, → auth.users |
| `events` | אירועי המסלול: יום, שעה, משך, מיקום, עלות, קטגוריה, tags | → trips |
| `expenses` | הוצאות הטיול: מי שילם, כמה, לכמה מחולקת | → trips |
| `supplies` | רשימת ציוד: קטגוריה, checked, critical, assignee | → trips |
| `emergency_contacts` | אנשי קשר לחירום: רפואי/שגרירות/אישי/ביטוח | → trips |
| `hotels` | מלונות עם check-in/out days וקואורדינטות | → trips |
| `wishlist` | רשימת מאווים — פריטים שניתן לתזמן כאירועים | → trips |
| `trip_invitations` | הזמנות במייל + status (pending/accepted/rejected) | → trips, → auth.users |
| `destination_guides` | Cache AI של מידע על יעדים (30 יום) | — |
| `rec_cache` | Cache המלצות AI לפי city+style+season+budget | — |
| `rate_limits` | Rate limiting עמיד ב-DB (key, count, reset_at) | — |
| `privacy_consents` | תיעוד הסכמת תנאי שימוש (GDPR) | → auth.users |

### Row Level Security (RLS)

**כל** טבלה מוגנת ב-RLS — משתמש רואה רק נתוני טיולים שהוא משתתף בהם:

```sql
-- דוגמה: מדיניות RLS לטבלת events
CREATE POLICY "Participants can read events"
ON events FOR SELECT
USING (
  trip_id IN (
    SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Participants can insert events"
ON events FOR INSERT
WITH CHECK (
  trip_id IN (
    SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
  )
);
```

### Rate Limiting דו-שכבתי

```typescript
// lib/rateLimit.ts
export async function checkRateLimit(key: string, limit: number, windowSecs: number): Promise<boolean> {
  // שכבה 1: in-memory map (מהיר, לא עמיד בין instances)
  const memEntry = memoryLimits.get(key);
  if (memEntry && memEntry.count >= limit && memEntry.reset > Date.now()) return true;

  // שכבה 2: Supabase DB RPC (עמיד, מסונכרן בין כל instances)
  const { data } = await supabase.rpc('upsert_rate_limit', {
    p_key: key, p_limit: limit, p_window_secs: windowSecs, p_now: new Date().toISOString()
  });
  return data?.limited ?? false;
}
```

---

## 9. אימות ואבטחה

### שיטות כניסה

1. **Google OAuth** — `supabase.auth.signInWithOAuth({ provider: 'google' })` → redirect → `/auth/callback` → `exchangeCodeForSession(code)`

2. **WebView Workaround** — זיהוי Instagram/Facebook/WhatsApp browser ב-user agent → פתיחה ב-browser מערכת

3. **Passkey** (WebAuthn) — דרך Supabase MFA, מוגן ב-Cloudflare Turnstile

4. **TOTP MFA** — QR code + ויריפיקציה; מנוהל ב-`SecuritySettings.tsx`

### אבטחת API Keys

**שום** מפתח API לא חשוף ל-client:

```typescript
// lib/env.ts — server-only
export function getAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY missing');
  return key;
}

// next.config.ts — מגדיר שhאילו env vars ציבוריים
env: {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY — לא NEXT_PUBLIC!
}
```

### Trip Code Hashing

```typescript
// קודי הצטרפות לטיול עברו hash SHA-256
const hashCode = async (code: string): Promise<string> => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};
```

### Account Deletion Flow (GDPR-Compliant)

```
1. POST /api/account/delete/request
   → רושם deletion record עם token ב-DB
   → שולח מייל עם לינק מאובטח
   
2. GET /account/confirm-delete?token=X
   → הצגת מסך אישור
   
3. POST /api/account/delete/confirm
   → מחיקת כל trip_participants → trips → expenses → events → supplies
   → מחיקת auth.users (service role)
   
4. אפשרות ביטול: POST /api/account/delete/cancel (לפני תפוגה)
```

---

## 10. PWA (Progressive Web App)

### Manifest

```json
// public/manifest.json
{
  "name": "Trippy — Free Group Trip Planner",
  "short_name": "Trippy",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#1A1410",
  "background_color": "#1A1410",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/dashboard.png", "form_factor": "narrow" },
    { "src": "/screenshots/day-planner.png", "form_factor": "narrow" },
    { "src": "/screenshots/packing.png", "form_factor": "narrow" }
  ]
}
```

### Service Worker — אסטרטגיות Caching

```javascript
// public/sw.js
const CACHE_STRATEGIES = {
  // נכסים סטטיים — לנצח (hashed filenames)
  '/_next/static/': 'cache-first-forever',
  
  // מזג אוויר — עדכן ברקע, הצג cached
  '/api/weather': 'stale-while-revalidate:3600',
  
  // שערי מטבע — cache-first, רענן כל שעה
  '/api/exchange-rates': 'cache-first:3600',
  
  // זמני נסיעה — cache ארוך
  '/api/route-time': 'cache-first:604800', // 7 ימים
  
  // נתוני טיול — network-first, fallback לcache
  '/api/trips/': 'network-first',
  
  // AI — אף פעם לא cache
  '/api/ai/': 'network-only',
};
```

---

## 11. בדיקות (Tests)

### סוויטות Playwright — 6 קבצים

```
tests/
├── fast_test.spec.ts        ← בדיקות עשן מהירות
├── deep_test.spec.ts        ← תזרים טיול מלא
├── extended_test.spec.ts    ← edge cases + טיפול בשגיאות
├── persona_test.spec.ts     ← תצורת פרסונה AI
├── appearance_test.spec.ts  ← בדיקות ויזואליות (light/dark/a11y)
└── wide_test.spec.ts        ← desktop layout (24,800+ שורות)
```

### הרצה

```bash
npm run test:fast       # smoke tests — ≈30 שניות
npm run test:deep       # full workflow — ≈3 דקות
npm run test:extended   # edge cases — ≈5 דקות
npm run test:all        # הכל
npm run test:report     # HTML report
```

### הגדרות Playwright

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    // ברירת מחדל: iPhone 17 Chrome (מכשיר הניסוי העיקרי)
    ...devices['iPhone 17 Pro'],
  },
  projects: [
    { name: 'mobile-chrome', use: { ...devices['iPhone 17 Pro'] } },
    { name: 'desktop-chrome', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
```

### מה הבדיקות מכסות

**`fast_test.spec.ts`** — הנמהיר:
- לחיצה על demo → רואים טיול לדוגמה
- יצירת טיול → בדיקת navigation לdashboard
- הוספת אירוע → מופיע בציר הזמן

**`appearance_test.spec.ts`** — ויזואלי:
- Toggle dark/light mode → בדיקת CSS variables
- High contrast mode
- Reduced motion mode
- RTL layout ב-עברית

**`deep_test.spec.ts`** — תזרים מלא:
- יצירת טיול מ-A עד Z
- הזמנת חבר + קבלת ההזמנה
- שיתוף עריכה בין שני משתמשים

---

## 12. i18n ו-RTL

### מימוש

```typescript
// lib/i18n.tsx

type Locale = 'en' | 'he';
type Dict = typeof en;

const en = {
  'nav.home': 'Home',
  'nav.day': 'Schedule',
  'budget.remaining': '{{amount}} remaining',
  // ...אלפי מפתחות
};

const he = {
  'nav.home': 'בית',
  'nav.day': 'לוח שעות',
  'budget.remaining': 'נשאר {{amount}}',
  // ...
};

// Hook שימוש
const { t, locale, formatCurrency } = useI18n();
t('budget.remaining', { amount: formatCurrency(250, 'USD') }); // → "$250 remaining"
```

### Cookie-based Persistence

```typescript
// שמירת locale ב-cookie (SSR-compatible)
document.cookie = `Trippy-locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
```

### RTL CSS

```css
/* globals.css */
html[dir="rtl"] {
  --text-align-start: right;
  --flex-direction: row-reverse;
}

/* כל הcomponents משתמשים ב-logical properties */
margin-inline-start: 1rem;  /* ← עובד ב-RTL ו-LTR */
padding-inline-end: 0.5rem;
```

---

## 13. ביצועים ופריסה

### Vercel — CI/CD

```yaml
# כל push ל-main → auto deploy
- Build: next build (ESLint + TypeScript check)
- Functions: /api/* → serverless (timeout: 30s; AI routes: 45s)
- Edge: middleware.ts → Edge Runtime
- ISR: דפי נחיתה ← revalidate: 3600
```

### ביצועי Frontend

- **ISR** + **edge caching** לדפים סטטיים
- **Code splitting** אוטומטי של Next.js לכל route
- **Lazy loading** לcomponents כבדים (Leaflet map, AI sheets)
- **Image optimization** דרך `next/image`
- **Skeleton Loaders** — מפחיתים תחושת זמן טעינה

### מניעת Bottlenecks

```typescript
// app/layout.tsx — preconnect לdomains חיוניים
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://api.anthropic.com" />
<link rel="preconnect" href="https://[project-id].supabase.co" />
```

---

## 14. אינטגרציות חיצוניות

| שירות | סוג | תפקיד במוצר | Caching |
|-------|-----|-------------|---------|
| Supabase Auth | Auth | Google OAuth, Passkeys, TOTP MFA | Session cookie |
| Supabase Database | DB | כל נתוני הטיולים + RLS | Realtime |
| Anthropic Claude | AI API | 8 endpoints AI | DB + in-memory |
| Google Places API | Maps | Autocomplete מקומות, דירוגים | Per-request |
| Google Maps | Maps | Tiles למפה, Google Maps link | SW cache |
| Google Weather API | Weather | תחזית עד 16 ימים | 1h Next.js |
| Open-Meteo | Weather | Fallback חינמי + climate estimate | 1h |
| open.er-api.com | Currency | שערי מטבע בזמן אמת | 1h unstable_cache |
| Cloudflare Turnstile | CAPTCHA | הגנה על כניסה מבוטים | Browser |
| Vercel Analytics | Analytics | מדידת שימוש אנונימית | — |

---

## 15. תהליך הפיתוח — Vibe Coding עם Claude Code

### מה זה Vibe Coding

הפרויקט נבנה בגישה של _Vibe Coding_ — שיתוף פעולה אינטנסיבי בין מפתח לAI-copilot, כאשר ה-AI (Claude Code) אחראי על:

1. **הצעת ארכיטקטורה** — בניית stores ו-API routes structure
2. **כתיבת קוד** — קומפוננטות, utilities, DB schemas
3. **איתור ותיקון bugs** — בייחוד ב-RLS, Zustand persistence, Realtime edge cases
4. **Security audit** — זיהוי חשיפות (trip codes, env vars) → hash + server-only
5. **Design system** — פיתוח שפת Liquid Glass, tokens, animations
6. **Refactoring** — פיצול store מונוליתי ל-4 stores ספציפיים
7. **Testing** — כתיבת סוויטות Playwright, edge cases

### תהליך עבודה טיפוסי

```
Developer: "אני רוצה שהצעות AI יהיו cache-backed כדי לחסוך API calls"
Claude Code:
  1. מציע סכמת rec_cache table
  2. כותב את מדיניות RLS
  3. ממש את לוגיקת cache-first ב-API route
  4. מוסיף Google Places enrichment
  5. מאתר edge case (cache miss race condition)
  6. מתקן עם optimistic lock
```

### שיפורים לאורך הזמן

| גרסה | שיפור מרכזי |
|------|-------------|
| V1 "Desert Glass" | מסלול בסיסי + תקציב + ציוד; ניווט floating pill |
| V2 "Wanderlust Dark" | Hero כהה, day cards אופקיות, ambient orb background |
| V3 2027-era | Blur-fade animations, film grain, scroll-aware NavBar, token system |
| Liquid Glass | --lg-* tokens, hero-mesh, morphing nav, event accordions, Heebo font |
| 2026 Redesign | DM Sans heroes, two-tone statements, hairline rows, gauge dashboard |
| Current | Vivid palette + saturate 1.8 glass, AI mood-first flow, desktop dashboard |

---

## 16. מבנה הפרויקט

```
trippy/
├── app/
│   ├── page.tsx                    # דף נחיתה (SSG)
│   ├── layout.tsx                  # Root layout + metadata + fonts
│   ├── globals.css                 # Design tokens + CSS variables
│   ├── app/
│   │   └── page.tsx                # AppShell entry point
│   ├── auth/callback/route.ts      # OAuth callback
│   ├── join/[token]/page.tsx       # קבלת הזמנה
│   ├── account/
│   │   ├── cancel-delete/page.tsx
│   │   └── confirm-delete/page.tsx
│   └── api/
│       ├── ai/
│       │   ├── chat/route.ts       # Haiko chatbot
│       │   ├── plan-trip/route.ts  # Full itinerary (streaming)
│       │   ├── suggestions/route.ts
│       │   ├── recommend/route.ts
│       │   ├── destination-intel/route.ts
│       │   ├── packing/route.ts
│       │   ├── scan-receipt/route.ts
│       │   └── budget-coach/route.ts
│       ├── trips/
│       │   ├── create/route.ts
│       │   ├── route.ts
│       │   └── [tripId]/
│       │       ├── route.ts
│       │       ├── events/route.ts
│       │       ├── expenses/route.ts
│       │       ├── supplies/route.ts
│       │       ├── hotels/route.ts
│       │       ├── emergency-contacts/route.ts
│       │       ├── wishlist/route.ts
│       │       ├── day-meta/route.ts
│       │       └── invite-link/route.ts
│       ├── invitations/
│       │   ├── route.ts
│       │   ├── send/route.ts
│       │   └── accept/route.ts
│       ├── invite/[token]/route.ts
│       ├── places/route.ts
│       ├── places/details/route.ts
│       ├── weather/route.ts
│       ├── exchange-rates/route.ts
│       ├── route-time/route.ts
│       ├── timezone/route.ts
│       └── account/delete/
│           ├── request/route.ts
│           ├── confirm/route.ts
│           └── cancel/route.ts
├── components/
│   ├── AppShell.tsx                # Main wrapper + auth guard
│   ├── NavBar_V2.tsx              # Bottom navigation
│   ├── screens/
│   │   ├── Home_V2.tsx
│   │   ├── Dashboard_V2.tsx
│   │   ├── DayDetail_V2.tsx
│   │   ├── Map_V2.tsx
│   │   ├── Packing_V2.tsx
│   │   ├── Settings_V2.tsx
│   │   ├── HaikoChat.tsx
│   │   ├── AIMenuSheet.tsx
│   │   ├── PlanWithAISheet.tsx
│   │   ├── WishlistSheet.tsx
│   │   ├── SecuritySettings.tsx
│   │   └── MFAChallenge.tsx
│   └── ui/                        # 20+ primitives
│       ├── Btn.tsx, Chip.tsx, Sheet.tsx, Toast.tsx
│       ├── Glass.tsx, Icon.tsx, ErrorBoundary.tsx
│       ├── CurrencyAmount.tsx, WorldClock.tsx
│       ├── AvatarStack.tsx, CodeCircles.tsx
│       ├── ProgressThin.tsx, SegmentedPill.tsx
│       └── TripLoaders.tsx
├── lib/
│   ├── store.ts                   # Main Zustand store (1100+ lines)
│   ├── stores/                    # Split stores (refactor in progress)
│   ├── types.ts                   # TypeScript interfaces
│   ├── schemas.ts                 # Zod validation schemas
│   ├── db.ts                      # DB access layer (400+ lines)
│   ├── i18n.tsx                   # Internationalization
│   ├── rateLimit.ts               # Dual-layer rate limiting
│   ├── settlement.ts              # Expense split calculations
│   ├── motion.ts                  # Framer Motion presets
│   └── [30+ utility files]
├── utils/supabase/
│   ├── client.ts                  # Browser client
│   └── server.ts                  # Server component client
├── public/
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service Worker
├── tests/
│   ├── fast_test.spec.ts
│   ├── deep_test.spec.ts
│   ├── extended_test.spec.ts
│   ├── persona_test.spec.ts
│   ├── appearance_test.spec.ts
│   └── wide_test.spec.ts
└── CLAUDE.md / AGENTS.md          # הנחיות לAI copilot
```

---

## 17. סיכום טכנולוגי

| שכבה | טכנולוגיה |
|------|----------|
| **Framework** | Next.js (App Router, SSR + ISR + Edge) |
| **Language** | TypeScript (strict mode) |
| **State** | Zustand (4 stores + localStorage persistence) |
| **Styling** | Tailwind CSS 4 + CSS Custom Properties (oklch) |
| **Animations** | Framer Motion |
| **Maps** | Leaflet.js |
| **Database** | Supabase (Postgres + RLS + Realtime) |
| **Auth** | Supabase Auth (Google OAuth + Passkeys + TOTP MFA) |
| **AI** | Anthropic Claude Haiku (8 endpoints) |
| **Validation** | Zod |
| **Testing** | Playwright (6 suites, iPhone 17 Chrome default) |
| **Hosting** | Vercel (auto-deploy, Edge Functions, Analytics) |
| **PWA** | Service Worker + Web Manifest |
| **i18n** | Custom (en + he, RTL/LTR, Intl API) |

---

## 18. משתני סביבה

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]        # ציבורי — מוגן ב-RLS
SUPABASE_SERVICE_ROLE_KEY=[service-key]          # סרבר בלבד!

# AI
ANTHROPIC_API_KEY=[key]                          # סרבר בלבד!

# Maps & Weather
GOOGLE_PLACES_API_KEY=[key]                      # סרבר בלבד!
GOOGLE_WEATHER_API_KEY=[key]                     # סרבר בלבד!

# CAPTCHA
NEXT_PUBLIC_TURNSTILE_SITE_KEY=[key]             # ציבורי
CLOUDFLARE_TURNSTILE_SECRET_KEY=[key]            # סרבר בלבד!

# App
NEXT_PUBLIC_APP_URL=https://letsexploring.com
```

---

## 19. הרצה מקומית

```bash
# 1. Clone
git clone https://github.com/[user]/trippy.git
cd trippy

# 2. Dependencies
npm install

# 3. Environment
cp .env.example .env.local
# ← מלא את כל המשתנים

# 4. Run
npm run dev          # http://localhost:3000

# 5. Tests (requires running dev server)
npm run test:fast    # smoke
npm run test:all     # הכל
```

---

## 20. סיכום

**Trippy** מציג מוצר שלם מקצה לקצה: בעיה אמיתית עם בידול תחרותי ברור, חוויית משתמש עקבית ב-RTL וב-LTR, זרימה מרכזית פועלת מהרשמה ועד תקציב משותף, מודל נתונים מתוכנן היטב עם הגנת RLS, אינטגרציות חיות עם הסתרת מפתחות נכונה, ופריסה יציבה וזמינה.

שילוב ה-AI לאורך **שמונה endpoints** שונים — מתכנון מסלול מלא, דרך ייעוץ תקציבי, זיהוי קבלות, רשימת ציוד מותאמת ועד chatbot עם context מלא של הטיול — מדגים שימוש מוצרי ועמוק בכלי AI ולא שימוש שטחי.

תיעוד תהליך הפיתוח עם Claude Code, כולל security audit שהוביל להטמעת hashing ל-trip codes, ממחיש שימוש בשל ואחראי ב-Vibe Coding ככלי פיתוח מקצועי.

</div>

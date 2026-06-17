# פרויקט גמר — Trippy
**קורס פיתוח מוצר מבוסס AI**

---

## פרטי מגיש
| שדה | ערך |
|---|---|
| שם מלא | (הכנס שמך) |
| מספר ת״ז | (הכנס ת״ז) |

---

## קישורי הגשה

| רכיב | קישור |
|---|---|
| פרויקט חי (Vercel) | https://letsexploring.com |
| ריפו GitHub | https://github.com/s61821333-ux/Trippy |
| ERD — תרשים מודל נתונים | ראה סעיף 4 בהמשך (Mermaid) |
| רשימת שירותים חיצוניים | ראה סעיף 5 בהמשך |

---

## 1. הגדרת המוצר והערך — 15 נק׳

### הבעיה שהמוצר פותר

כל מי שניסה לתכנן טיול קבוצתי יודע: זה כאוס. השיחה בווטסאפ מוצפת בהצעות סותרות, הגוגל שיטס עם ה״מסלול״ לא מסונכרן לאף אחד, מי שילם על ה״איירבי״ לא יודע מה לגבות מכל אחד, ואף אחד לא זוכר מה ארזנו. הכלים הקיימים — בנויים ליחיד, לא לקבוצה.

**הכאב הקונקרטי**: אין כלי אחד שמאפשר לכמה חברים לתכנן טיול משותף בזמן אמת — עם מסלול יומי, מפה, תקציב משותף, ורשימת ציוד — מבלי לדרוש התקנת אפליקציה.

### קהל היעד

- **ראשי**: קבוצות חברים/משפחות (3–10 אנשים) בגיל 20–45 שמתכננים טיול של 2–14 ימים
- **מצב שימוש**: ישיבת תכנון ביחד ("בוא נתכנן את הטיול"), ובמהלך הטיול עצמו לסנכרון שוטף

### מתחרים ובידול

| מתחר | מה הם עושים | החיסרון שלהם | איך Trippy שונה |
|---|---|---|---|
| **WhatsApp** | שיחה קבוצתית | אין מבנה, מידע קבור בהודעות | מסלול מובנה, מפה חיה, תקציב |
| **Google Sheets** | טבלה משותפת | ידני לחלוטין, אין חישובי תקציב אוטומטיים, לא מתאים למובייל | ממשק מוצרי, חישוב הסדרי חובות אוטומטי |
| **TripIt** | ניהול נסיעות (בעיקר טיסות/מלונות) | ממוקד על נסיעות עסקיות, לא קבוצתי, לא חינמי | חינמי לחלוטין, ממוקד קבוצה, מסלול יומי גמיש |
| **Google Trips / Maps** | מפות ומקומות | אין תכנון קבוצתי, אין תקציב, הופסק | משלב מפה + מסלול + תקציב + ציוד בכלי אחד |
| **לעשות ידנית** | Word / Notion / נייר | אין שיתוף בזמן אמת, אין חישובים | שיתוף חי, AI שמציע רעיונות ומחשב |

**הבידול של Trippy**: כלי אחד, חינמי, שפועל דרך הדפדפן, שמאפשר לכל חבר בקבוצה להוסיף אירועים, לראות את המפה, ולעקוב אחרי ההוצאות — עם עוזר AI שיכול לבנות מסלול שלם תוך שניות.

---

## 2. עיצוב וחוויית משתמש — 15 נק׳

### גישת העיצוב

Trippy בנוי עם מערכת עיצוב "Liquid Glass" — ממשק עם שכבות זכוכית מטושטשות, פלטת צבעים ארצית חמה, ואנימציות עדינות שמרגישות טבעיות. כל הרכיבים נבנו from scratch עם Tailwind CSS 4 ו-Framer Motion.

### מאפיינים עיצוביים עיקריים

- **RTL + LTR מלא**: כל הממשק תומך בשתי הכיוונים — עברית (RTL) ואנגלית (LTR) — עם החלפה חלקה ללא שבירת פריסה
- **Responsive / Mobile-first**: פותח ונבדק על iPhone (viewport 390px), עם breakpoints לדסקטופ
- **PWA**: ניתן להתקין כאפליקציה על מסך הבית, פועל עם service worker לתגובה מיידית
- **ניווט**: NavBar צף עם pill floating — ניווט בלחיצה אחת לכל מסך
- **מצב כהה/בהיר**: הממשק מזהה העדפת מערכת ומאחסן בעוגייה כדי שהשרת ירנדר את הנושא הנכון מהפעלה ראשונה (ללא ריצוד)
- **Skeleton loaders**: כל המסכים מציגים placeholders בזמן טעינה — אין "מסך ריק"
- **טיפוגרפיה**: DM Sans (כותרות), Instrument Serif (אלמנטי הדגשה), JetBrains Mono (ניוד קטן), Assistant (עברית)
- **אנימציות**: blur-fade על כניסה/יציאה, page transitions חלקות, haptic feedback עם Framer Motion

### ציור מסכי ליבה

```
מסך בית  →  יצירת טיול / בחירת טיול קיים
   ↓
Dashboard  →  כרטיס טיול עם תקציב, מזג אוויר, וניווט
   ↓
מסך יום  →  ציר זמן אירועים, הוספה/עריכה, AI suggestions
   ↓
מסך מפה  →  כל האירועים על מפת Leaflet עם markers
   ↓
מסך תקציב  →  הוצאות, פיצול, הסדרי חובות
   ↓
מסך ציוד  →  רשימה משותפת עם תיוג בוקריי
```

---

## 3. פונקציונליות ופרונט-אנד — 20 נק׳

### הזרימה המרכזית (מקצה לקצה)

1. **התחברות** — Google OAuth או Passkey (WebAuthn Face ID / Touch ID) עם TOTP MFA אופציונלי
2. **יצירת טיול** — שם, תאריכים, מדינות, נושא ויזואלי — AI ממלא מיד meta לכל יום
3. **תכנון** — הוספת אירועים יומיים עם שעה, קטגוריה, מיקום, עלות ותגיות
4. **AI assist** — לחיצה אחת → Claude מציע אירועים לפי פערים בלו"ז, סגנון ותקציב
5. **הזמנת חברים** — קישור invite / קוד קצר / הזמנה במייל
6. **תקציב** — כל חבר מוסיף הוצאות, הסדרי חובות מחושבים אוטומטית
7. **ציוד** — רשימה משותפת, סימון completed, תיוג לאחראי
8. **במהלך הטיול** — World Clock לכל אירוע בטיימזון שלו, כפתור Google Maps לניווט, קשרי חירום

### רשימת פיצ׳רים עובדים

| פיצ׳ר | תיאור |
|---|---|
| מסלול יומי | ציר זמן עם 40+ קטגוריות, drag-reorder, עריכה inline |
| מפה אינטראקטיבית | Leaflet עם markers לכל האירועים, route lines |
| תקציב קבוצתי | הוצאות + פיצול + הסדרי חובות (Settlement algorithm) |
| AI — תכנון מסלול | Claude מייצר מסלול JSON מלא (עד 21 ימים) בשניות |
| AI — הצעות חכמות | מזהה פערים בלו"ז ומציע אירועים מותאמים לסגנון |
| AI — Budget Coach | Claude מנתח הוצאות ומציע חיסכון |
| AI — סריקת קבלה | צילום קבלה → Claude מחלץ סכום ומוסיף להוצאות |
| AI — Intel יעד | מידע מקדים על יעד הטיול (מזג אוויר, תרבות, טיפים) |
| AI — רשימת ציוד | Claude מייצר רשימה מותאמת ליעד ומשך הטיול |
| AI — Chat | שיחה חופשית עם עוזר טיול |
| רשימת ציוד | עם קטגוריות, סימון critical, הקצאה לחבר |
| מלונות | ניהול לינה עם עלות שנכנסת לתקציב |
| Wishlist | שמירת רעיונות ללא הוספה למסלול |
| קשרי חירום | שמירת אנשי קשר רפואיים/שגרירות/אישיים |
| הזמנות | קישור, קוד, מייל — קבלה/דחיה |
| RTL/עברית | כל הממשק מותאם לעברית |
| PWA | התקנה כאפליקציה, service worker |
| World Clock | טיימזון לכל אירוע |
| מזג אוויר | תחזית לפי יעד הטיול |
| שערי מטבע | המרת מטבע בזמן אמת |

### מבנה קומפוננטים

```
app/components/
  screens/          # מסכים מלאים (AIMenuSheet, WishlistSheet, ...)
  ui/               # פרימיטיבים: Btn, Sheet, Glass, Field, Toast, ...
  NavBar_V2.tsx     # ניווט צף
  DayTimelineView   # ציר זמן יומי
lib/stores/
  tripStore.ts      # מצב הטיול (Zustand)
  userStore.ts      # מצב משתמש
  uiStore.ts        # מצב ממשק
  sessionStore.ts   # סשן auth
```

### טיפול במצבי קצה

- קלט ריק / שגיאת רשת: Toast עם הודעה ברורה
- Rate limiting: כל endpoint AI מוגבל ב-requests לדקה (Supabase-backed)
- Loading states: Skeleton + spinners בכל תרחיש טעינה
- Error boundary: React Error Boundary מונע קריסת כל האפליקציה

---

## 4. בקאנד, מודל נתונים ו-ERD — 20 נק׳

### ארכיטקטורת בקאנד

- **Supabase** כ-Database + Auth + RLS
- **Next.js API Routes** כשכבת middleware (מסתיר מפתחות, מוסיף rate limiting, מאמת session)
- אין שרת נפרד — הכל serverless על Vercel Edge / Node.js runtime

### טבלאות מסד הנתונים

#### `trips`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה ייחודי |
| name | text | שם הטיול |
| days | integer | מספר ימי הטיול |
| start_date | date | תאריך תחילת הטיול |
| theme | text | נושא ויזואלי (desert/city/beach/...) |
| countries | text[] | מדינות הטיול |
| invite_token | uuid | טוקן להצטרפות עם קישור |
| trip_notes | text[] | הערות כלליות לטיול |
| hotels | jsonb | מערך לינות |
| budget | numeric | תקציב כולל אופציונלי |
| created_by | uuid FK→auth.users | יוצר הטיול |
| created_at | timestamptz | זמן יצירה |

#### `trip_participants`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה |
| trip_id | uuid FK→trips | הטיול |
| user_id | uuid FK→auth.users | המשתמש |
| initials | text | ראשי תיבות לתצוגה |
| color | text | צבע avatar |
| role | text | 'owner' / 'member' |
| joined_at | timestamptz | זמן הצטרפות |

#### `events`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה |
| trip_id | uuid FK→trips | הטיול |
| day_index | integer | יום (0-based) |
| time | text | שעה "HH:MM" |
| duration | integer | דקות |
| name | text | שם האירוע |
| category | text | קטגוריה (food/attraction/...) |
| location | text | שם המיקום |
| lat / lng | float8 | קואורדינטות |
| notes | text | הערות |
| cost | numeric | עלות משוערת |
| tags | text[] | תגיות חופשיות |
| votes | jsonb | הצבעות חברים { userId: 'up'/'down' } |
| added_by | uuid FK→auth.users | מי הוסיף |
| wishlist | boolean | true = פריט ב-Wishlist |

#### `expenses`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה |
| trip_id | uuid FK→trips | הטיול |
| description | text | תיאור ההוצאה |
| amount | numeric | סכום |
| paid_by | uuid FK→auth.users | מי שילם |
| split_count | integer | מספר אנשים שמתחלקים |
| tags | text[] | קטגוריות (Food/Transport/...) |

#### `supplies`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה |
| trip_id | uuid FK→trips | הטיול |
| name | text | שם הפריט |
| category | text | Water/Food/Gear/Medical/Documents/Other |
| checked | boolean | סומן כארוז |
| critical | boolean | חסימת progress bar |
| assignee | text | שם האחראי |

#### `emergency_contacts`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה |
| trip_id | uuid FK→trips | הטיול |
| name | text | שם |
| phone | text | טלפון |
| type | text | medical/embassy/personal/insurance |

#### `trip_invitations`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה |
| trip_id | uuid FK→trips | הטיול |
| invited_email | text | מייל המוזמן |
| status | text | pending/accepted/rejected |
| created_at | timestamptz | זמן שליחה |

#### `day_meta`
| עמודה | טיפוס | תיאור |
|---|---|---|
| id | uuid PK | מזהה |
| trip_id | uuid FK→trips | הטיול |
| day_index | integer | יום (0-based) |
| region | text | שם האזור ביום זה |
| emoji | text | אמוג׳י ייצוגי |
| lat / lng | float8 | מיקום מרכזי של היום |
| description | text | תיאור קצר |

#### `privacy_consents`
| עמודה | טיפוס | תיאור |
|---|---|---|
| user_id | uuid PK FK→auth.users | המשתמש |
| accepted_at | timestamptz | זמן אישור |
| content_hash | text | גרסת תנאי השימוש |
| content | text | טקסט מלא שאושר |

#### `rec_cache`
| עמודה | טיפוס | תיאור |
|---|---|---|
| rec_id | uuid PK | מזהה |
| city | text | עיר |
| area / lat / lng | text / float8 | מיקום |
| style | text | סגנון (food/culture/...) |
| duration_bucket | text | short/half_day/full_day |
| budget_tier | text | low/mid/high |
| season | text | spring/summer/autumn/winter |
| title | text | שם ההמלצה |
| google_place_id | text | מזהה Google Places |
| google_rating | float8 | דירוג |
| popularity_count | integer | כמה פעמים הומלץ |

---

### תרשים ERD (Mermaid)

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
    }

    trips {
        uuid id PK
        text name
        integer days
        date start_date
        text theme
        text[] countries
        uuid invite_token
        text[] trip_notes
        jsonb hotels
        numeric budget
        uuid created_by FK
        timestamptz created_at
    }

    trip_participants {
        uuid id PK
        uuid trip_id FK
        uuid user_id FK
        text initials
        text color
        text role
        timestamptz joined_at
    }

    events {
        uuid id PK
        uuid trip_id FK
        integer day_index
        text time
        integer duration
        text name
        text category
        text location
        float8 lat
        float8 lng
        text notes
        numeric cost
        text[] tags
        jsonb votes
        uuid added_by FK
        boolean wishlist
    }

    expenses {
        uuid id PK
        uuid trip_id FK
        text description
        numeric amount
        uuid paid_by FK
        integer split_count
        text[] tags
    }

    supplies {
        uuid id PK
        uuid trip_id FK
        text name
        text category
        boolean checked
        boolean critical
        text assignee
    }

    emergency_contacts {
        uuid id PK
        uuid trip_id FK
        text name
        text phone
        text type
    }

    trip_invitations {
        uuid id PK
        uuid trip_id FK
        text invited_email
        text status
        timestamptz created_at
    }

    day_meta {
        uuid id PK
        uuid trip_id FK
        integer day_index
        text region
        text emoji
        float8 lat
        float8 lng
        text description
    }

    privacy_consents {
        uuid user_id PK FK
        timestamptz accepted_at
        text content_hash
        text content
    }

    rec_cache {
        uuid rec_id PK
        text city
        text style
        text duration_bucket
        text budget_tier
        text season
        text title
        text google_place_id
        float8 google_rating
        integer popularity_count
    }

    auth_users ||--o{ trips : "creates"
    auth_users ||--o{ trip_participants : "joins"
    auth_users ||--o{ events : "adds"
    auth_users ||--o{ expenses : "pays"
    auth_users ||--|| privacy_consents : "consents"

    trips ||--o{ trip_participants : "has"
    trips ||--o{ events : "contains"
    trips ||--o{ expenses : "tracks"
    trips ||--o{ supplies : "needs"
    trips ||--o{ emergency_contacts : "stores"
    trips ||--o{ trip_invitations : "sends"
    trips ||--o{ day_meta : "describes"
```

### אבטחה ו-RLS

- כל טבלה מוגנת עם Row Level Security — משתמש רואה רק נתוני טיולים שהוא משתתף בהם
- קריאות API רגישות (יצירת טיול, מחיקת חשבון) עוברות דרך Next.js API Route עם service role key — המפתח לא נחשף לצד הלקוח
- Passkey sign-in מוגן עם Cloudflare Turnstile captcha
- TOTP MFA זמין למשתמשים שרוצים שכבת אבטחה נוספת

---

## 5. אינטגרציות ושירותים חיצוניים — 15 נק׳

| # | שירות | סוג | תפקיד במוצר | מיקום המפתח |
|---|---|---|---|---|
| 1 | **Supabase Auth** | אוטנטיקציה | ניהול משתמשים, סשן, Google OAuth, Passkeys, TOTP MFA | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ציבורי — מוגן ב-RLS) |
| 2 | **Supabase Database** | DB (Postgres) | אחסון כל נתוני הטיולים, RLS, real-time | `SUPABASE_SERVICE_ROLE_KEY` — **שרת בלבד** |
| 3 | **Anthropic Claude** (`claude-sonnet-4-6`) | קריאת API — AI | 7 endpoints: תכנון מסלול, הצעות, budget coach, סריקת קבלה, intel יעד, רשימת ציוד, chat | `ANTHROPIC_API_KEY` — **שרת בלבד** (Next.js API Route) |
| 4 | **Google Places API** | קריאת API | autocomplete מיקומים, enrichment של הצעות AI עם דירוג/שעות פתיחה | `NEXT_PUBLIC_GOOGLE_PLACES_KEY` + שרת |
| 5 | **Cloudflare Turnstile** | CAPTCHA | הגנה על sign-in עם Passkey מפני bots | `CLOUDFLARE_TURNSTILE_SECRET` — **שרת בלבד** |
| 6 | **Open-Meteo** (חינמי) | קריאת API | תחזית מזג אוויר לפי קואורדינטות יעד הטיול | ללא מפתח — API פתוח |
| 7 | **Exchange Rates API** | קריאת API | שערי מטבע בזמן אמת להמרת הוצאות | שרת בלבד |
| 8 | **Route Time API** | קריאת API | הערכת זמן נסיעה בין אירועים ביום | שרת בלבד |
| 9 | **Timezone API** | קריאת API | קביעת timezone נכון לכל אירוע לפי קואורדינטות | שרת בלבד |
| 10 | **Vercel Analytics** | Analytics | מדידת שימוש ללא PII | `@vercel/analytics` — ציבורי (אנונימי) |

### הסתרת מפתחות

כל המפתחות הרגישים חיים ב-`.env.local` ונקראים רק ב-Next.js API Routes (שרת). הלקוח לא מקבל גישה אליהם אף פעם. ה-`ANTHROPIC_API_KEY` לדוגמה נקרא רק ב-`app/api/ai/*/route.ts` — קוד שרץ על Vercel Edge, לא בדפדפן.

---

## 6. דיפלוימנט ויציבות — 10 נק׳

- **URL**: https://letsexploring.com — פעיל 24/7 על Vercel
- **Deploy**: Push ל-`main` מפעיל auto-deploy דרך Vercel CI
- **בדיקה ממכשיר אחר**: האתר פועל ללא כל הגדרה מקומית — נגיש מכל דפדפן/מכשיר
- **משתמש דמו**: ניתן להירשם עם Google ב-10 שניות, אין צורך בנתוני דמו מוכנים מראש
- **Console errors**: אין שגיאות חוסמות; טעויות רשת נתפסות ומוצגות כ-Toast
- **Performance**: Next.js ISR + edge caching, skeleton loaders מונעים תחושת "מסך ריק"
- **PWA**: Service Worker מאפשר shell מיידי גם על חיבור איטי

---

## 7. תיעוד (README) — 5 נק׳

קובץ ה-README.md בריפו כולל:

- **סקירה כללית** — מה המוצר עושה במשפט אחד
- **הבעיה** — הכאב הקונקרטי שהמוצר פותר
- **קהל היעד** — מי משתמש ובאיזה מצב
- **מתחרים ובידול** — טבלה מול WhatsApp/Sheets/TripIt
- **Stack** — טבלה מלאה של הטכנולוגיות
- **רשימת פיצ׳רים** — כל הפיצ׳רים הפועלים
- **הוראות הרצה** — `npm install` + env vars + `npm run dev`
- **משתני סביבה** — רשימה מלאה של כל ה-keys הנדרשים
- **בדיקות** — כל הפקודות עם הסבר
- **מבנה פרויקט** — עץ תיקיות מוסבר

---

## 8. בונוס — עד 5 נק׳

### שימוש מתוחכם ב-AI

Trippy לא משתמש ב-AI כ"צ׳אטבוט" — כל endpoint AI הוא חלק אינטגרלי מהמוצר:

1. **`/api/ai/plan-trip`** — Claude מקבל יעד, ימים, קצב, תחומי עניין ותקציב ומחזיר JSON מבנה מלא (אירועים, שעות, עלויות, רשימת ציוד) שנכנס ישירות למסד הנתונים
2. **`/api/ai/suggestions`** — מזהה פערים בלו"ז (gaps) ומציע אירועים ממולצים מ-Google Places + Claude, מותאמים לסגנון האישי של המשתמש (14 סגנונות: food/culture/nature/shopping/...)
3. **`/api/ai/budget-coach`** — מנתח את כל ההוצאות ומחזיר המלצות חיסכון ספציפיות
4. **`/api/ai/scan-receipt`** — Claude Vision מחלץ סכום מצילום קבלה
5. **`/api/ai/destination-intel`** — briefing מקדים על יעד: מזג אוויר, תרבות, טיפים, מה לארוז
6. **`/api/ai/packing`** — רשימת ציוד מותאמת ליעד + עונה + מספר ימים
7. **`/api/ai/chat`** — שיחה חופשית עם context מלא של הטיול (יעד, ימים, אירועים קיימים)

**Token budgeting**: כל endpoint מחשב budget דינמי לפי מספר הימים (`days * 280` tokens, capped at 6000) כדי לא לחתוך תגובות ב-mid-JSON.

**Rate limiting**: כל endpoint מוגן עם rate limit מבוסס Supabase (לא in-memory) — פועל נכון גם עם Vercel serverless (אין shared memory).

### Vibe Coding — תיעוד תהליך הפיתוח

הפרויקט נבנה ב-100% עם **Claude Code** (Anthropic CLI) כ-co-pilot:

- **ארכיטקטורה**: Claude הציע את מבנה ה-Zustand stores, חלוקת ה-API routes, ואת האסטרטגיה להסתרת מפתחות
- **עיצוב**: כל מערכת העיצוב (Liquid Glass tokens, animation variants, skeleton loaders) נכתבה עם Claude
- **Debug**: Claude זיהה ותיקן 3 bugs קריטיים — WebView OAuth redirect, Turnstile captcha 400020, ו-countries column parsing (PostgreSQL array literal vs JSON string)
- **אבטחה**: Claude ביצע security audit ומצא ש-trip codes נחשפים ב-plain text → הוטמע SHA-256 hashing
- **תיעוד**: README + SUBMISSION.md נכתבו עם Claude
- **iterations**: כל feature עבר מחזור plan → implement → verify בדפדפן → fix עם Claude

---

## צ׳קליסט הגשה סופי

- [x] האתר עולה ב-Vercel: https://letsexploring.com
- [x] פועל מדפדפן/מכשיר אחר ללא הגדרה מקומית
- [x] הזרימה המרכזית עובדת מקצה לקצה (הרשמה → יצירת טיול → הוספת אירועים → הזמנת חבר → תקציב)
- [x] ריפו ציבורי: https://github.com/s61821333-ux/Trippy
- [x] README כולל: סקירה, בעיה, קהל, מתחרים, בידול, env vars, הוראות הרצה
- [x] ERD מצורף (Mermaid + טבלאות מפורטות בסעיף 4)
- [x] רשימת שירותים חיצוניים מפורטת (סעיף 5) עם הסבר על הסתרת מפתחות
- [x] אין נתוני דמו נדרשים — הרשמה עם Google מספיקה

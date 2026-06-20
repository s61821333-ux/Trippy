<div dir="rtl">

# Trippy — מתכנן טיולים קבוצתי חופשי

**פרויקט חי:** [letsexploring.com](https://letsexploring.com) | **GitHub:** (https://github.com/s61821333-ux/Trippy)

---

## סקירה כללית

**Trippy** היא אפליקציית Web (PWA) לתכנון טיולים קבוצתיים — לוח זמנים משותף, מפה אינטראקטיבית, תקציב קבוצתי ורשימת ציוד, הכל במקום אחד.  
מזמינים חברים בלחיצה אחת, ומתכננים ביחד בזמן אמת — ללא הורדת אפליקציה.

---

## הבעיה שהפרויקט פותר

כל מי שניסה לתכנן טיול עם קבוצה יכיר את הכאב:  
שיחות ווטסאפ שמתפצלות לתת-שרשורים, קובץ גוגל-שיטס לתקציב, מסמך גוגל-דוקס ללוח זמנים, ושמונה טאבים פתוחים ב-Booking.  
**אין מקום אחד שמחזיק את הכל יחד.**

כשמתכוננים לטיול, כל חבר קבוצה שם רעיונות במקום אחר, אף אחד לא יודע מה עלויות אמיתיות, ולוח הזמנים תמיד מפוצל בין כמה קבצים.  
Trippy פותר בדיוק את זה: מקום אחד, לכולם, עם AI שעוזר למלא את החסרים.

---

## קהל היעד

**מי:** קבוצות חברים (1-5 אנשים) שמתכננים טיול משותף — חופשת קיץ, טיול לחו"ל, נסיעת סיום.

**מתי משתמשים:** בשלב התכנון (שבועות לפני הנסיעה) ובמהלך הטיול עצמו — כשצריך לדעת מה הפעילות הבאה, כמה כסף נשאר, ומה לא לאבד.

**רמת מומחיות:** לא נדרש ידע טכני — ממשק עם ה-UX של אפליקציה נייטיבית, כניסה ביומטרית (Passkey), והצטרפות ללא הרשמה.

---

## מתחרים ובידול

| פתרון קיים | מה חסר בו |
|---|---|
| **ווטסאפ + גוגל-שיטס** | אין ויזואליזציה, אין מפה, אין חישוב חכם — פוזיציה בין 4 כלים |
| **TripIt / Sygic** | קורא אימיילים, לא לתכנון קבוצתי חי, ממשק מסורבל |
| **Wanderlog** | אנגלית בלבד, ממשק desktop-first, אין AI שמייצר מסלול שלם |
| **Google Trips (הופסק)** | כבר לא קיים |

**מה Trippy עושה אחרת:**

- **RTL + עברית מלאה** — היחיד שתוכנן מהתחלה לעברית וחוויה ימין-לשמאל
- **AI ברמת שאלות שטח** — Haiko עונה "מה לאכול בנאפולי ב-20 שקל" בהקשר הטיול הספציפי
- **PWA מותקנת** — אפליקציה ללא חנות אפליקציות, עובדת גם אופליין

---

## הרצה מקומית

```bash
git clone <repo-url>
cd trippy
npm install
cp .env.example .env.local   # מלאו את מפתחות Supabase + Anthropic
npm run dev
# → http://localhost:3000
```

### משתני סביבה ואינטגרציות חיצוניות

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI ASSISTANT
ANTHROPIC_API_KEY=

# GOOGLE CLOUDE FOR MAPS & SEARCH
NEXT_PUBLIC_GOOGLE_PLACES_KEY=

# LIVE DOMAIN
CLOUDFLARE_TURNSTILE_SECRET=
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=
```

---

## תרשים ERD — מודל הנתונים

```mermaid
  erDiagram
	direction TB
	AUTH_USERS {
		uuid id PK ""  
	}

	PROFILES {
		uuid id PK ""  
		text nickname  ""  
	}

	TRIPS {
		uuid id PK ""  
		text name  ""  
		int days  ""  
		date start_date  ""  
		text theme  ""  
		text code UK ""  
		jsonb trip_notes  ""  
		timestamptz created_at  ""  
		text countries  ""  
		uuid invite_token UK ""  
		uuid user_id  ""  
		uuid created_by  ""  
	}

	EVENTS {
		uuid id PK ""  
		uuid trip_id FK ""  
		int day_index  ""  
		text time  ""  
		int duration  ""  
		text name  ""  
		text category  ""  
		text location  ""  
		float lat  ""  
		float lng  ""  
		text notes  ""  
		uuid added_by FK ""  
		numeric cost  ""  
		jsonb tags  ""  
		jsonb votes  ""  
		boolean wishlist  ""  
	}

	DAY_META {
		uuid id PK ""  
		uuid trip_id FK ""  
		int day_index  ""  
		text region  ""  
		text emoji  ""  
		float lat  ""  
		float lng  ""  
		text description  ""  
	}

	EMERGENCY_CONTACTS {
		uuid id PK ""  
		uuid trip_id FK ""  
		text name  ""  
		text phone  ""  
		text type  ""  
	}

	EXPENSES {
		uuid id PK ""  
		uuid trip_id FK ""  
		text description  ""  
		numeric amount  ""  
		uuid paid_by FK ""  
		int split_count  ""  
		jsonb tags  ""  
	}

	SUPPLIES {
		uuid id PK ""  
		uuid trip_id FK ""  
		text name  ""  
		text category  ""  
		boolean checked  ""  
		uuid assignee FK ""  
		boolean critical  ""  
	}

	TRIP_PARTICIPANTS {
		uuid trip_id PK,FK ""  
		uuid user_id PK,FK ""  
		text initials  ""  
		text color  ""  
	}

	EVENTS_VOTES {
		uuid id PK ""  
		uuid event_id FK ""  
		uuid user_id FK ""  
		text vote_type  ""  
		timestamptz created_at  ""  
	}

	TRIP_INVITATIONS {
		uuid id PK ""  
		uuid trip_id FK ""  
		text invited_by  ""  
		text invited_email  ""  
		text status  ""  
		timestamptz created_at  ""  
		timestamptz expires_at  ""  
	}

	TRIP_INVITE_LINKS {
		uuid id PK ""  
		uuid trip_id FK ""  
		text token UK ""  
		uuid created_by FK ""  
		timestamptz created_at  ""  
		timestamptz expires_at  ""  
		int max_uses  ""  
		int use_count  ""  
	}

	PRIVACY_CONSENTS {
		uuid user_id PK,FK ""  
		timestamptz accepted_at  ""  
		text content_hash  ""  
		text content  ""  
	}

	ACCOUNT_DELETIONS {
		uuid id PK ""  
		uuid user_id FK ""  
		timestamptz requested_at  ""  
		timestamptz scheduled_for  ""  
		timestamptz confirmed_at  ""  
		timestamptz cancelled_at  ""  
		text confirmation_token UK ""  
	}

	REC_CACHE {
		uuid rec_id PK ""  
		text country  ""  
		text region  ""  
		text city  ""  
		text area  ""  
		float lat  ""  
		float lng  ""  
		text style  ""  
		text style_detail  ""  
		text duration_bucket  ""  
		text budget_tier  ""  
		text season  ""  
		text title  ""  
		text short_description  ""  
		text source_site  ""  
		text source_url  ""  
		text google_place_id  ""  
		float google_rating  ""  
		int avg_duration_min  ""  
		int price_level  ""  
		timestamptz created_at  ""  
		timestamptz last_served_at  ""  
		int popularity_count  ""  
		text locale  ""  
	}

	RATE_LIMITS {
		text key PK ""  
		int count  ""  
		timestamptz reset_at  ""  
	}

	DESTINATION_GUIDES {
		text country PK ""  
		text locale PK ""  
		jsonb data  ""  
		timestamptz updated_at  ""  
	}

	PROFILES||--o{TRIPS:"profiles.id = trips.user_id (FK)"
	AUTH_USERS||--o{PROFILES:"auth.users.id = profiles.id (FK)"
	TRIPS||--o{EVENTS:"trips.id = events.trip_id"
	TRIPS||--o{DAY_META:"trips.id = day_meta.trip_id"
	TRIPS||--o{EMERGENCY_CONTACTS:"trips.id = emergency_contacts.trip_id"
	TRIPS||--o{EXPENSES:"trips.id = expenses.trip_id"
	TRIPS||--o{SUPPLIES:"trips.id = supplies.trip_id"
	TRIPS||--o{TRIP_PARTICIPANTS:"trips.id = trip_participants.trip_id"
	TRIPS||--o{TRIP_INVITATIONS:"trips.id = trip_invitations.trip_id"
	TRIPS||--o{TRIP_INVITE_LINKS:"trips.id = trip_invite_links.trip_id"
	PROFILES||--o{EVENTS:"profiles.id = events.added_by"
	PROFILES||--o{EXPENSES:"profiles.id = expenses.paid_by"
	PROFILES||--o{SUPPLIES:"profiles.id = supplies.assignee"
	PROFILES||--o{EVENTS_VOTES:"profiles.id = event_votes.user_id"
	TRIP_PARTICIPANTS}o--||AUTH_USERS:"auth.users.id = trip_participants.user_id"
	EVENTS||--o{EVENTS_VOTES:"events.id = event_votes.event_id"
	AUTH_USERS||--o{TRIPS:"auth.users.id = trips.user_id"
	AUTH_USERS||--o{TRIPS:"auth.users.id = trips.created_by"
	AUTH_USERS||--o{TRIP_INVITE_LINKS:"auth.users.id = trip_invite_links.created_by"
	AUTH_USERS||--o{TRIP_PARTICIPANTS:"auth.users.id = trip_participants.user_id"
	AUTH_USERS||--o{PRIVACY_CONSENTS:"auth.users.id = privacy_consents.user_id"
	AUTH_USERS||--o{ACCOUNT_DELETIONS:"auth.users.id = account_deletions.user_id"
```

> **הסבר קצר על הארכיטקטורה:**  
> `trips` הוא הישות המרכזית — הכל נקשר אליה. `profiles` מרחיב את `auth.users` של Supabase עם כינוי ואווטאר. `events` מחזיק גם פעילויות רגילות וגם פריטי Wishlist (דרך דגל `wishlist`). `rec_cache` ו-`destination_guides` הם טבלאות Cache לתשובות AI כדי לחסוך קריאות API חוזרות.

---

## שירותים חיצוניים ואינטגרציות

| שירות | סוג | תפקיד במוצר |
|---|---|---|
| **Supabase** | Backend-as-a-Service | Postgres DB, Auth (Passkeys/JWT), RLS, Storage |
| **Anthropic Claude** | AI API | יצירת מסלול, צ'אט Haiko, הצעות גאפ-פילר, סריקת קבלות, מאמן תקציב, מידע יעד |
| **Google CLOUDE API** |  API | להצגת מפות ולכניסה דרך גוגל  Autocomplete לחיפוש מיקומים בהוספת אירוע |
| **Cloudflare Turnstile** | CAPTCHA | הגנת Bot בכניסה עם Passkey |
| **Weather API** | מזג אוויר | תחזית לכל ימי הטיול לפי מיקום |
| **Exchange Rates API** | פיננסי | המרת מטבע בזמן אמת לתקציב |
| **Vercel** | Deploy | אחסון ו-Edge Functions |

---

## פיצ'רים עיקריים

| פיצ'ר | תיאור |
|---|---|
| **לוח זמנים יומי** | ציר זמן לכל יום עם גרירה, קטגוריות, זמן נסיעה |
| **Haiko AI** | צאטבוט + גילוי מקומות חדשים ע"י סריקה במדריכי טיולים פופולארים באינטרנט |
| **תקציב קבוצתי** | מעקב הוצאות, תגיות, המרת מטבע, מחשבון התחשבנות |
| **מפה** | כל הנקודות ממוקמות עם מסלול ואומדן זמן נסיעה |
| **Wishlist** | שמירת רעיונות לפני הכנסתם ללוח הזמנים |
| **ציוד (Packing)** | רשימה קבוצתית עם שיוך לחברים |
| **מלונות** | לינה לכל יום, מחיר נכנס לתקציב |
| **הצטרפות מהירה** | לינק ייחודי + קוד סודי (SHA-256), ללא הרשמה לצפייה |
| **RTL + עברית** | תמיכה מלאה, כולל ריבוי חכם |

---

## סטאק טכנולוגי

| שכבה | טכנולוגיה |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Auth + DB | Supabase (Postgres, RLS, Passkeys) |
| AI | Anthropic Claude |
| Maps | Leaflet + React Leaflet |
| State | Zustand |
| Validation | Zod |
| Testing | Playwright |
| Deploy | Vercel |

</div>

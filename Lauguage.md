# 🗺️ Travel App — Content Audit & Rewrite Agent Instructions

> **Mission:** Scan every piece of text in the app, identify generic/broken content, and rewrite it with brand voice — in both Hebrew and English.

---

## Phase 1: Content Discovery

### Step 1 — Map All Content Sources

Scan the entire codebase for text content. Target these locations:

```
- i18n / localization files        (e.g. en.json, he.json, translations/)
- String constants files           (e.g. strings.ts, constants.js)
- Hardcoded JSX/HTML strings       (look for text between tags)
- Markdown / MDX content files
- CMS data / mock data files       (e.g. mockData.ts, data/)
- Screen/component files           (scan for visible user-facing strings)
- Onboarding / tutorial content
- Error messages & empty states
- Push notification templates
- Email templates (if any)
```

**Command (example for JS/TS project):**
```bash
# Find all translation files
find . -name "*.json" | xargs grep -l "\"en\"\|\"he\"\|\"translation\""

# Find hardcoded Hebrew strings
grep -r "[\u0590-\u05FF]" src/ --include="*.tsx" --include="*.ts" -l

# Find hardcoded English strings (naive scan)
grep -rn '"[A-Z][a-z]' src/ --include="*.tsx" -l
```

### Step 2 — Build a Content Inventory

Create a spreadsheet-style audit table:

| ID | File | Key/Location | Language | Current Text | Issues Found | Rewritten Text | Status |
|----|------|-------------|----------|-------------|--------------|----------------|--------|

---

## Phase 2: Content Audit — What to Flag

### 🚩 Generic AI Patterns to Detect

**English — flag these phrases:**
- "embark on a journey / adventure"
- "breathtaking / stunning / awe-inspiring"
- "hidden gems" / "off the beaten path"
- "unforgettable experience" / "memories that last a lifetime"
- "seamlessly" / "effortlessly" / "hassle-free"
- "your dream trip" / "your perfect getaway"
- Excessive exclamation marks!!!
- Passive voice: "trips can be found", "locations are offered"

**Hebrew — flag these phrases:**
```
- "חוויה בלתי נשכחת" / "הרפתקה מרתקת"
- "ביעילות ובנוחות" / "ללא מאמץ"
- "הטיול המושלם שלך" / "חלום שהפך למציאות"
- "ניתן למצוא" / "מוצע" (passive — avoid in Hebrew UI)
- "לאור האמור לעיל" / "כמפורט להלן" (over-formal)
- "על מנת ל..." (replace with "כדי ל...")
```

### 🚩 Grammar & Language Errors to Fix

**Hebrew Grammar Checklist:**
- [ ] **זכר/נקבה** — verb and adjective agreement with noun gender
  - ❌ "הטיול הייתה נהדרת" → ✅ "הטיול היה נהדר"
- [ ] **יחיד/רבים** — singular/plural consistency
- [ ] **גוף הפנייה** — decide: אתה/את/אתם and stay consistent per screen
- [ ] **ניקוד שמות** — correct definite article ה usage
  - ❌ "ב-הבית" → ✅ "בבית"
- [ ] **פועל בזמן נכון** — verb tense consistency (don't mix past/present/future)
- [ ] **אותיות שורש** — correct root letters in verbs
- [ ] **מיקום תואר** — adjective after noun in Hebrew, not before
  - ❌ "נהדר מסלול" → ✅ "מסלול נהדר"

**English Grammar Checklist:**
- [ ] Subject-verb agreement
- [ ] Article usage (a/an/the)
- [ ] Consistent tense (don't mix past/present in same section)
- [ ] Consistent US or UK spelling (pick one, stay with it)
- [ ] Sentence fragments in UI copy
- [ ] Comma splices

---

## Phase 3: Rewriting — Brand Voice Guidelines

### 🎙️ Voice Persona

The brand voice is:
- **A knowledgeable local friend** — not a tour operator, not a robot
- **Warm and direct** — says what it means, no filler
- **Slightly playful** — light humor is OK, but never cringe
- **Practical** — always gives useful info, not just vibes

### ✅ English Rewriting Rules

| Instead of... | Use... |
|--------------|--------|
| "Embark on an unforgettable journey" | "Start your trip" / "Go explore" |
| "Breathtaking scenery awaits" | "The views are worth it" |
| "Seamlessly plan your adventure" | "Plan your trip in minutes" |
| "Discover hidden gems" | "Find places most tourists miss" |
| "Your dream getaway" | "Your next trip" |
| Passive voice | Active voice always |
| 3-sentence intro paragraphs | 1 punchy sentence |

**Tone examples:**

```
❌ "Embark on a breathtaking adventure and discover the hidden gems 
    of this magnificent destination with our seamless platform."

✅ "Find the best spots, book what you need, and actually enjoy your trip."
```

```
❌ "An unforgettable experience awaits you."

✅ "You'll want to come back."
```

### ✅ Hebrew Rewriting Rules

**פנייה למשתמש:**
- השתמש בגוף שני — "אתה/את" (בהתאם לפלטפורמה)
- עדיף סגנון ישיר וקצר
- הימנע מפסיביות: "ניתן לבחור" → "בחר"

**טון:**
- ידידותי אבל לא ילדותי
- ישראלי — לא תרגום מאנגלית
- קצר ומדויק — לא "ביעילות ובאפקטיביות", פשוט "בקלות"

**דוגמאות:**

```
❌ "מצאו את ההרפתקה הבאה שלכם ביעילות ובנוחות עם הפלטפורמה שלנו"

✅ "תכננו את הטיול הבא שלכם — בלי סיבוכים."
```

```
❌ "חוויה בלתי נשכחת מחכה לכם ביעד המדהים הזה"

✅ "מקום שאי אפשר לפספס."
```

```
❌ "על מנת להמשיך, אנא הכניסו את פרטיכם"

✅ "הכניסו את הפרטים שלכם כדי להמשיך"
```

---

## Phase 4: Rewriting Process — Step by Step

For each content item in the inventory:

### Step A — Classify the content type
- **UI label** (button, tab, header) → ultra-short, action-oriented
- **Body copy** (description, about) → conversational, 1–3 sentences max
- **Empty state** (no results, loading) → friendly, helpful
- **Error message** → clear, non-blaming, with next action
- **Onboarding** → exciting but not cheesy
- **Notification / push** → personal, direct, useful

### Step B — Apply the correct voice for the type

| Type | English Example | Hebrew Example |
|------|----------------|----------------|
| Button | "Start Planning" | "בואו נתכנן" |
| Empty state | "Nothing here yet — try searching nearby." | "עדיין אין כלום כאן. נסו לחפש באזור." |
| Error | "Can't load trips. Check your connection and try again." | "לא הצלחנו לטעון. בדקו את החיבור ונסו שוב." |
| Onboarding | "Your next trip starts here." | "הטיול הבא שלכם מתחיל כאן." |
| Push notification | "Prices just dropped for your saved trip 👀" | "המחירים ירדו לטיול שמרתם 👀" |

### Step C — Validate after rewriting

Run this checklist on every rewritten string:

**Hebrew validation:**
- [ ] Grammar gender matches (פועל ↔ שם עצם)
- [ ] No generic AI phrases
- [ ] Feels like something a real Israeli would say
- [ ] Passes the "would Waze say this?" test — direct, casual, clear

**English validation:**
- [ ] Under 10 words for labels/buttons
- [ ] No forbidden phrases from the list above
- [ ] Active voice
- [ ] Native English speaker would say this naturally

---

## Phase 5: Output Format

### Per-file diff format:
```
FILE: src/locales/he.json
KEY: home.hero.subtitle

BEFORE: "גלו את ההרפתקה הבאה שלכם ביעילות ובנוחות"
ISSUES: generic AI phrase, unnecessary adverbs, unnatural Hebrew
AFTER:  "תכננו את הטיול הבא שלכם — פשוט ומהיר."
```

### Summary report at the end:
```
## Content Audit Summary

- Total strings reviewed: X
- Strings with issues: X (XX%)
- Rewritten: X
- Grammar errors fixed: X
- Generic AI phrases removed: X

### Top Issues Found:
1. [Issue type] — X occurrences
2. ...
```

---

## Tools to Use

| Task | Tool |
|------|------|
| Scan codebase | `bash` — grep, find |
| Check Hebrew grammar | Claude API — prompt with Hebrew grammar rules |
| Batch rewrite | Claude API — with this prompt template below |
| Validate output | Claude API — critic pass |

### Rewrite Prompt Template (for Claude API calls):

```
System: You are a Hebrew/English copy editor for a travel app. 
Brand voice: warm, direct, local friend — NOT a tour operator.
Rules: no generic AI phrases, active voice, natural {LANGUAGE}, 
max {MAX_LENGTH} words for this content type ({TYPE}).

User: Rewrite this {LANGUAGE} string.
Content type: {TYPE}
Original: "{TEXT}"

Respond with ONLY the rewritten text. No explanation.
```

### Critic Pass Prompt Template:

```
System: You are a strict copy editor. 
Flag: generic AI phrases, grammar errors, passive voice, unnatural phrasing.
Be specific about what's wrong and why.

User: Review this {LANGUAGE} travel app string:
"{TEXT}"

Format:
PASS/FAIL: 
Issues: (list or "none")
```

---

## Priority Order

Work through content in this order (highest user visibility first):

1. 🔴 **Onboarding screens** — first impression
2. 🔴 **Home screen / hero text**
3. 🟠 **Main navigation labels**
4. 🟠 **Search & filter UI**
5. 🟡 **Trip/destination descriptions**
6. 🟡 **Empty states & errors**
7. 🟢 **Settings & profile screens**
8. 🟢 **Legal / about text** (lower priority)

---

## ⚠️ Do NOT

- Don't over-translate — Hebrew UI should be written **in** Hebrew, not translated from English
- Don't add emojis unless the existing design already uses them
- Don't change technical strings (API keys, IDs, variable names)
- Don't shorten legal/privacy text without approval
- Don't rewrite content marked with `// do-not-translate` or similar annotations

---

*Agent: complete the full inventory before starting rewrites. Work screen by screen. Output diffs to a `/content-audit/` folder.*
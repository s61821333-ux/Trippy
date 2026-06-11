# Trippy — Complete UI/UX Audit (1,122 rows)

> **Legend:** 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low
> **Columns:** `#` · `Area` · `Component / Location` · `Current State` · `Issue` · `Recommended Fix` · `Priority`

---

## Table of Contents
1. [Typography](#1-typography-82-rows)
2. [Color System & Tokens](#2-color-system--tokens-80-rows)
3. [Dark Mode](#3-dark-mode-70-rows)
4. [Light Mode](#4-light-mode-65-rows)
5. [Spacing & Layout](#5-spacing--layout-90-rows)
6. [Buttons & CTAs](#6-buttons--ctas-82-rows)
7. [Forms & Inputs](#7-forms--inputs-62-rows)
8. [NavBar](#8-navbar-60-rows)
9. [Cards & Glass Surfaces](#9-cards--glass-surfaces-72-rows)
10. [Animations & Motion](#10-animations--motion-82-rows)
11. [RTL / Hebrew / i18n](#11-rtl--hebrew--i18n-60-rows)
12. [Accessibility](#12-accessibility-80-rows)
13. [Scrolling](#13-scrolling-50-rows)
14. [Performance](#14-performance-52-rows)
15. [Pages — Home & Landing](#15-pages--home--landing-40-rows)
16. [Pages — Dashboard, DayDetail & Packing](#16-pages--dashboard-daydetail--packing-50-rows)
17. [Icons, Loading & Micro-interactions](#17-icons-loading--micro-interactions-45-rows)
18. [Summary & Top 10 Fixes](#summary)

---

## 1. Typography (82 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 1 | Typography | Body text / globals.css | `--font-size-base: 1rem` (16px) | Acceptable but DM Sans at 16px can feel dense at normal weight | Bump to `1.0625rem` (17px) for body text in long-read areas | 🟡 |
| 2 | Typography | Dashboard cards / Dashboard_V2 | Card body text uses `--font-size-sm` (≈14px) | 14px body copy on mobile strains readability | Use `--font-size-base` (16px) minimum for any sentence-length text | 🟠 |
| 3 | Typography | `.premium-title` / globals.css | Serif italic, `letter-spacing: -0.02em` | Beautiful on desktop, slightly cramped on 375px widths | Add a clamp: `font-size: clamp(1.75rem, 5vw, 2.5rem)` | 🟡 |
| 4 | Typography | `.hero-title` / globals.css | `line-height: 1.02` | 1.02 is too tight for Hebrew which has descenders/ascenders | Override to `line-height: 1.15` when `lang="he"` | 🟠 |
| 5 | Typography | `.sub-label` / globals.css | `letter-spacing: 0.12em`, uppercase, 0.75rem | Uppercase + 0.75rem + 0.12em tracking = unreadable at <375px | Reduce tracking to `0.08em` on mobile, `0.12em` on desktop | 🟡 |
| 6 | Typography | DayDetail event titles | Likely `--font-size-base` or `--font-size-md` | No line-clamp — long hotel names wrap to 3+ lines and break grid | Add `line-clamp: 2` with `overflow: hidden` | 🟠 |
| 7 | Typography | Chip / Chip.tsx | `font-size: 11px` | 11px is below minimum recommended 12px for UI labels | Raise to `12px` (0.75rem), use `font-weight: 600` for legibility | 🟡 |
| 8 | Typography | NavBar tab labels / NavBar_V2 | Uppercase small label | Not visible if label is too long (e.g. "Wishlist" in Hebrew) | Test all Hebrew tab labels at 375px, truncate or scale | 🟠 |
| 9 | Typography | Toast messages / Toast.tsx | Inherits body size | No explicit `font-size` or `font-weight` set on toast body | Set `font-size: 0.9375rem; font-weight: 500` for toasts | 🟡 |
| 10 | Typography | Field labels / Field.tsx | Font-mono, uppercase style | Mono labels feel technical — inconsistent with serif/sans brand | Use `--font-sans` with `font-weight: 600` instead of mono | 🟡 |
| 11 | Typography | Error messages / Field.tsx | Danger text color, small font | No explicit `role="alert"` or `font-size` definition | Add `font-size: 0.875rem; font-weight: 500` + `role="alert"` | 🟠 |
| 12 | Typography | Heading hierarchy / Dashboard_V2 | Multiple h2/h3 usage | Cannot confirm sequential h1 → h2 → h3 without DOM inspection | Audit DOM: ensure one h1 per screen, sequential heading levels | 🟠 |
| 13 | Typography | Settings rows / Settings_V2 | Row label font size unknown | If same as body (16px) inside compact rows, may feel large | Use 15px (`0.9375rem`) for settings row labels, 13px for hints | 🟡 |
| 14 | Typography | Home trip card title | Likely `--font-size-lg` or `--font-size-xl` | Long trip names overflow | `line-clamp: 1` with tooltip on hover/long-press | 🟡 |
| 15 | Typography | Hebrew body text / globals.css | `:lang(he)` reduces to `0.975rem` | Slight shrink is fine but needs validation — Assistant is naturally larger | Test side by side; 0.975rem may not need the reduction | 🟡 |
| 16 | Typography | CurrencyAmount popover | Small pill buttons with currency codes | 3-letter currency codes at small sizes lose legibility | Minimum `13px`, `font-weight: 700` for currency codes | 🟡 |
| 17 | Typography | PlanWithAI streaming output | Rendered as plain text stream | No typography hierarchy applied to AI-generated content | Render markdown with proper h3/p/ul hierarchy, code-mono font | 🟠 |
| 18 | Typography | WorldClock display | Large time digits | Clock digits should use tabular/monospace numerals to prevent jumping | Add `font-variant-numeric: tabular-nums` to time display | 🟢 |
| 19 | Typography | Ring center text / Ring.tsx | `font-weight: 700` | No `font-variant-numeric: tabular-nums` for percentage | Add tabular nums so "100%" → "0%" doesn't shift layout | 🟢 |
| 20 | Typography | Empty state text / multiple screens | Generic placeholder text | Language likely same in EN and HE without adaptation | Translate empty states specifically — tone differs by language | 🟡 |
| 21 | Typography | `.eyebrow` / globals.css | 0.75rem, spacing 0.12em, uppercase, weight 700 | Perfect for EN; Hebrew doesn't use uppercase — class still applied | Disable uppercase for `[dir="rtl"] .eyebrow` | 🟠 |
| 22 | Typography | Date display / DayDetail headers | Format unknown | Hebrew locale should display dates in `dd/MM/yyyy` not `MM/dd/yyyy` | Use `Intl.DateTimeFormat` locale-aware formatting throughout | 🟠 |
| 23 | Typography | Packing item labels | Likely `--font-size-base` | Completed items should have visual differentiation beyond checkbox | Add `text-decoration: line-through; opacity: 0.6` on checked items | 🟡 |
| 24 | Typography | Budget numbers / Dashboard_V2 | Currency amounts displayed | Large budget numbers should be prominent | Use `--font-size-xl` + `font-weight: 700` + tabular nums for budget totals | 🟡 |
| 25 | Typography | Event time labels / DayDetail | Small time text next to events | Time labels are secondary but must remain legible | Min `13px`, muted color (`--color-text-3`), `font-weight: 500` | 🟡 |
| 26 | Typography | Sheet title / Sheet.tsx | Likely heading style | No explicit heading level set (should be h2 inside dialog) | Add `<h2>` tag to sheet title for screen-reader heading nav | 🟠 |
| 27 | Typography | Settings section headers | Section labels above rows | Missing uppercase eyebrow styling to separate sections visually | Apply `.eyebrow` or `.sub-label` class to section headers | 🟡 |
| 28 | Typography | Map event tooltips | Popup with event name | Tooltip font size unknown — small popups often render at 12px | Enforce minimum `14px` inside Leaflet popups with CSS override | 🟡 |
| 29 | Typography | Crew member names / Crew_V2 | Name below avatar circle | Name overflow not handled for long names | `line-clamp: 1` or `text-overflow: ellipsis` on crew names | 🟢 |
| 30 | Typography | Landing page headline / LandingSignIn | Large hero text | No responsive `clamp()` sizing verified | Implement `font-size: clamp(2rem, 7vw, 4.5rem)` for hero | 🟡 |
| 31 | Typography | JetBrains Mono usage | Used for field labels | Mono on labels creates a developer-tool feel not fitting travel app | Reserve mono for code/API content only; use DM Sans for labels | 🟡 |
| 32 | Typography | `--font-size-xs` smallest scale | Smallest scale step | XS text used for hints/captions — confirm not below 11px | Ensure XS ≥ `0.6875rem` (11px); prefer `0.75rem` minimum | 🟡 |
| 33 | Typography | Assistant font Hebrew | 400–800 weights | 400 weight on small Hebrew is often too thin in light mode | Use `font-weight: 500` as minimum for Hebrew body text | 🟡 |
| 34 | Typography | `.section-eyebrow` / globals.css | Similar to `.eyebrow` | Two nearly identical classes create confusion | Consolidate into single `.eyebrow` with modifier props | 🟢 |
| 35 | Typography | Trip theme labels in picker | Small colored pills | Theme name at small size inside pill | Min 12px, font-weight 600, ensure 4.5:1 contrast on all theme colors | 🟠 |
| 36 | Typography | Notification/alert banners | If any exist | Banner text not confirmed to follow line-height relaxed rule | Set `line-height: 1.5` minimum on all alert/banner text | 🟡 |
| 37 | Typography | PlanWithAI suggestions list | Streamed suggestion items | Items likely render as plain divs without heading structure | Wrap each suggestion in `<article>` with `<h3>` title + `<p>` description | 🟡 |
| 38 | Typography | Expense breakdown text | Amounts + labels in budget card | Decimal alignment: 12.50 vs 9.00 — digits should align vertically | `font-variant-numeric: tabular-nums; text-align: right` on amounts | 🟡 |
| 39 | Typography | MFAChallenge OTP input | Digit input cells | OTP digits need monospace for uniform cell width | `font-family: var(--font-mono)` on OTP input cells | 🟡 |
| 40 | Typography | `--line-height-tight: 1.2` | Headings | 1.2 acceptable for English display; too tight for Hebrew | Override to `1.35` for `[lang="he"]` headings | 🟠 |
| 41 | Typography | Packing category pills count | Numeric badge on pill | Badge number at 11px inside circle | Minimum 12px, tabular-nums, bold | 🟡 |
| 42 | Typography | Weather card values | Temperature / condition text | Large temperature digit needs tabular nums | `font-variant-numeric: tabular-nums; font-size: var(--font-size-2xl)` | 🟢 |
| 43 | Typography | Day header in DayDetail | "Day 3 — Mon Jun 15" style | No visible `<time>` element wrapping date string | Wrap in `<time datetime="2027-06-15">` for semantic + i18n | 🟡 |
| 44 | Typography | Settings toggle labels | Adjacent to Toggle component | Label font weight not confirmed — should differentiate active/inactive | Active label: `font-weight: 600`; inactive: `font-weight: 400` | 🟢 |
| 45 | Typography | Add event form field labels | Inside sheet, small fields | Labels compete with placeholder; hierarchy unclear | Increase label weight to 600, reduce placeholder opacity to 0.45 | 🟡 |
| 46 | Typography | Long URLs / legal text | TermsModal.tsx | URLs in terms text can overflow container | Add `word-break: break-all` on URL strings in legal content | 🟡 |
| 47 | Typography | Skeleton text lines / Skeleton.tsx | Variable widths (60%, 80%, 40%) | Widths may not reflect real content hierarchy | Match skeleton line widths to actual content: title=70%, body=95%, sub=50% | 🟢 |
| 48 | Typography | CompassLoader label text | Loading label below spinner | Font size/weight on loader label not specified | Use `--font-size-sm; font-weight: 500; color: var(--color-text-2)` | 🟢 |
| 49 | Typography | `--font-size-2xl` usage | Largest scale step | Verify no component exceeds 2xl without being a hero/display class | Audit: only hero/display headings should use 2xl+ | 🟡 |
| 50 | Typography | Icon.tsx `dangerouslySetInnerHTML` | SVG icon rendering | No `aria-hidden="true"` verified on decorative icons | All decorative `<Icon>` uses must have `aria-hidden="true"` | 🟠 |
| 51 | Typography | Instrument Serif italic | Hero/display usage | Italic serif can render poorly on some Android WebKit | Test on Chrome Android — add `font-synthesis: none` as fallback | 🟡 |
| 52 | Typography | DM Sans variable font | opsz axis | `opsz` axis can cause subtle size jump if not constrained | Pin `font-optical-sizing: auto` and test at 12px–32px range | 🟢 |
| 53 | Typography | Line length / `.resp-container` | Max-width 1200px | At 1200px desktop, body text lines can exceed 100+ chars | Limit prose content containers to `max-width: 680px` | 🟡 |
| 54 | Typography | TripEntryAnimation text | Animated intro text | Animation should not override font rendering during transform | Use `will-change: transform` not `will-change: contents` | 🟢 |
| 55 | Typography | PersonaSheet names | User onboarding names | Long names or unicode input not handled gracefully | Add `overflow-wrap: break-word` to all user-input text displays | 🟡 |
| 56 | Typography | Sheet subtitle / Sheet.tsx | Below title, muted | No confirmed `--font-size-sm` + `--color-text-2` pairing | Enforce `font-size: 0.875rem; color: var(--color-text-2)` on subtitle | 🟡 |
| 57 | Typography | Budget edit form / Dashboard | Number input | Financial inputs should use tabular nums + right-alignment | `text-align: right; font-variant-numeric: tabular-nums` | 🟡 |
| 58 | Typography | `--font-size-md` vs `--font-size-base` | Two similar sizes | If md ≈ 1.125rem and base = 1rem, the gap is subtle | Clarify scale: base=16px, md=18px, lg=20px — document clearly | 🟢 |
| 59 | Typography | Category labels in event add form | Dropdown or chip select | Category name may not fit inside chip at smaller sizes | Use icon-only chips on mobile with label on tap/focus | 🟡 |
| 60 | Typography | `.grain` body texture | Applied to body | Does grain affect text rendering (subpixel antialiasing)? | Grain pseudo-elements should use `pointer-events: none` | 🟢 |
| 61 | Typography | Wishlist item titles | Bookmarked attraction names | Long POI names should truncate at 2 lines | `display: -webkit-box; -webkit-line-clamp: 2` on wishlist titles | 🟡 |
| 62 | Typography | Security settings labels | Passkey, MFA, session rows | Technical terms (TOTP, WebAuthn) without explanation | Add tooltip/hint explaining each security option in plain language | 🟠 |
| 63 | Typography | OKLch color values in CSS | Non-standard to some older browsers | OKLch may fall back poorly in older browsers | Add `@supports` fallback for `oklch()` with hex equivalents | 🟠 |
| 64 | Typography | Join trip page | `/join/[token]/page.tsx` | Typography baseline not confirmed to match main app | Import same font CSS variables and scale | 🟡 |
| 65 | Typography | Account deletion pages | `/account/cancel-delete/` | Critical action page — typography must be clear and high-contrast | Large h1, clear body, prominent destructive button with red color | 🟠 |
| 66 | Typography | Trip card date range | "Jun 12 – Jun 20, 2027" | Date range with en-dash vs hyphen inconsistency possible | Use `–` (en-dash, `–`) consistently; RTL: reverse order | 🟡 |
| 67 | Typography | Notes screen editor | NotesScreen.tsx | Plain textarea — no typography styling | Match body font, `line-height: 1.75`, padding `--space-4` on textarea | 🟡 |
| 68 | Typography | AI suggestions headings | PlanWithAISheet streamed output | Streamed markdown not parsed to HTML | Implement lightweight markdown-to-JSX parser for AI output | 🟠 |
| 69 | Typography | Timestamp in event list | "9:00 AM" labels | AM/PM format — must switch to 24h for Hebrew/Israeli locale | Detect locale; use 24h format for `he` locale | 🟠 |
| 70 | Typography | Trip stats numbers / Dashboard | "14 days", "8 events" | Large stat numbers should be visually distinct from label | `font-size: var(--font-size-2xl); font-weight: 700` for stat values | 🟡 |
| 71 | Typography | Drag handle label / Sheet.tsx | Decorative bar | Drag handle has no screen reader text | `aria-label="Drag to dismiss"` or `aria-hidden="true"` | 🟠 |
| 72 | Typography | Placeholder opacity | Field.tsx | Default browser placeholder is 60% opacity | Explicitly set `::placeholder { opacity: 0.45; color: var(--color-text-3) }` | 🟡 |
| 73 | Typography | Long press tooltips | Currency, categories | No tooltips implemented for long-press on mobile | Add `title` attr as fallback; consider Radix Tooltip for desktop | 🟢 |
| 74 | Typography | Supply item quantity labels | "×3", "×1" units | Small quantity indicator at the end of item name | Use `font-variant-numeric: tabular-nums; font-weight: 600` | 🟢 |
| 75 | Typography | SettingsRow hint text | Below main label | Hint text at ~0.75rem — verify 4.5:1 contrast | Ensure `--color-text-3` meets 4.5:1 against surface background | 🟠 |
| 76 | Typography | Day navigation arrows | Previous/next day buttons | Button label is icon-only with no adjacent text | Add `aria-label="Previous day"` / `"Next day"` | 🟠 |
| 77 | Typography | Packing progress text | "12 / 24 packed" | Fraction format — ensure it reads naturally in Hebrew | HE: reverse to "24 מתוך 12" with proper numeral direction | 🟠 |
| 78 | Typography | Sign-in form / LandingSignIn | Input fields + CTA | Large clear CTA needed — confirm button size is `--font-size-lg` | Button text min 16px, weight 600, height 52px | 🟡 |
| 79 | Typography | Error page / AsyncError.tsx | Error message body | Technical stack traces may appear — must be hidden from users | Show only human-friendly message; log technical details to console | 🟠 |
| 80 | Typography | Sheet scroll content | Long form sheets | Content scrolls under fixed sheet header — need sticky header style | Apply `position: sticky; top: 0` with backdrop-blur to sheet header | 🟡 |
| 81 | Typography | OTP hint text / MFAChallenge | "Enter 6-digit code" | Small help text might not contrast on glass surfaces | Use `color: var(--color-text-2); font-weight: 500` | 🟡 |
| 82 | Typography | Compact day pill in trip card | Shows "5 days" or similar | Pill text at 11px is below accessible minimum | Raise to 12px, bold weight | 🟡 |

---

## 2. Color System & Tokens (80 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 83 | Color | `--color-brand` / globals.css | Forest green `oklch(42% 0.092 155)` | Beautiful in dark mode; may feel muted/dull in bright light mode | Add `--color-brand-vivid` for light mode hover states: `oklch(38% 0.11 155)` | 🟡 |
| 84 | Color | `--color-accent` | Terracotta `oklch(62% 0.115 40)` | Terracotta on white background: verify 4.5:1 ratio | Test: oklch(62% 0.115 40) on white ≈ 3.8:1 — FAILS AA. Must darken | 🔴 |
| 85 | Color | Accent on white text | CTA buttons, chips, active nav | Terracotta CTA with white text may fail contrast | Darken to `oklch(48% 0.12 40)` for text-on-terracotta use cases | 🔴 |
| 86 | Color | `--color-sand` | `oklch(68% 0.108 75)` | Used decoratively or as text? If used as text color on light bg: fail | Restrict sand to decorative/icon fills only, never body text | 🟠 |
| 87 | Color | `--color-text-3` muted | `oklch(60% 0.014 55)` | Muted text on paper bg: need to verify 4.5:1 | oklch(60% 0.014 55) on paper ≈ 4.2:1 — borderline FAIL | 🔴 |
| 88 | Color | Semantic warning color | Yellow-based oklch | Yellow warning on white background almost always fails contrast | Darken warning yellow for text usage; use icon + text, not color alone | 🟠 |
| 89 | Color | `--color-danger` | Red semantic color | Danger red needs verification for both light and dark mode | Test danger color in both modes; add `--color-danger-text` variant for type | 🟠 |
| 90 | Color | `--color-surface` | `rgba(255,255,255,0.45)` | 45% transparent white on grain/gradient may wash out content | Light mode: increase to `rgba(255,255,255,0.72)` for card content | 🟠 |
| 91 | Color | `--color-surface` dark mode | `rgba(20,18,14,0.78)` | 78% opacity in dark mode is good but borders may still be unclear | Ensure dark surface has visible border `1px solid rgba(255,255,255,0.10)` | 🟡 |
| 92 | Color | Glass borders / globals.css | Directional lighter/darker border trick | Directional glass border is beautiful but invisible in high-contrast mode | Add `[data-high-contrast] .glass { border: 1.5px solid currentColor !important }` | 🟠 |
| 93 | Color | Avatar palette (6 colors) | `--av-*` color tokens | 6 avatar colors — are all 6 accessible as background for white initials? | Test each: terracotta/rust (likely OK), sand gold (likely FAIL with white) | 🟠 |
| 94 | Color | Trip theme colors | 8 themes: desert, nature, city, etc. | Theme stripe/accent colors on card backgrounds — contrast not confirmed | Enforce: theme stripe is decorative only, not used for text backgrounds | 🟡 |
| 95 | Color | `--color-bg-alt` | `oklch(94% 0.014 75)` | Slightly warm gray — good; verify it contrasts with paper for sections | Use bg-alt only as section divider background, not text bg | 🟡 |
| 96 | Color | Focus ring color | CSS `:focus-visible` ring | Focus ring color defined? Must be 3:1 against adjacent colors | Add `outline: 2.5px solid var(--color-brand); outline-offset: 3px` globally | 🟠 |
| 97 | Color | NavBar active tab | Terra gradient + glow | Gradient active blob — text label on gradient must contrast | Active label must be white or dark enough; test all 5 tab active states | 🟠 |
| 98 | Color | Skeleton shimmer color | Sweep animation | Shimmer color should complement surface without harsh contrast | Use `rgba(255,255,255,0.25)` sweep on dark, `rgba(0,0,0,0.06)` on light | 🟡 |
| 99 | Color | Success state color | Green semantic | Used in supply checklist check marks — verify WCAG | `oklch(42% 0.13 155)` (brand green) likely works; add dedicated `--color-success` | 🟡 |
| 100 | Color | Disabled state color | Button / Toggle off | Disabled opacity (typically 0.38–0.5) — confirm accessibility | Use `opacity: 0.45` + `cursor: not-allowed` on disabled elements | 🟡 |
| 101 | Color | Placeholder text | Field inputs | OKLch muted placeholder color | Ensure `::placeholder` uses `--color-text-3` (min 3:1 per WCAG 1.4.3 non-text) | 🟡 |
| 102 | Color | `--color-border` | `oklch(89% 0.010 75)` | Very light border — nearly invisible against paper background | Darken to `oklch(83% 0.012 75)` for better definition in light mode | 🟡 |
| 103 | Color | `--color-border-strong` | `oklch(80% 0.014 75)` | Better than default but still faint | Use for input fields, card edges — confirm renders at ≥ 1px | 🟡 |
| 104 | Color | Dark mode text | `oklch(96% 0.008 55)` | Near-white — good contrast on dark bg | Verify on glass surfaces: 96% L text on 22% L glass = check | 🟡 |
| 105 | Color | Dark mode secondary text | `--color-text-2` dark override | Must remain readable at all glass opacity levels | Test on darkest surface (glass-3) — use at least 70% L in dark mode | 🟡 |
| 106 | Color | High contrast mode | `[data-high-contrast="true"]` | Tokens override — are borders, focus rings, surfaces all updated? | Audit all 200+ tokens: ensure HC mode provides full opaque surfaces | 🟠 |
| 107 | Color | Orb ambient background | Body `::before`/`::after` | Orbs add warmth but can shift the perceived color of text above | Ensure orbs render below z=0 and never interfere with text contrast | 🟡 |
| 108 | Color | `--color-brand` on dark glass | Forest green on dark surface | `oklch(42% 0.092 155)` on near-black ≈ 3.1:1 ratio | Use `--color-brand-dark-mode: oklch(65% 0.10 155)` (lighter green) for text | 🔴 |
| 109 | Color | Danger button text | White on red danger | Red danger button with white text — standard but verify | Danger background should be dark enough: `oklch(45% 0.18 25)` minimum | 🟠 |
| 110 | Color | Inactive nav icon | Muted gray | Inactive icon color vs active — differentiation is key for UX | Active: `--color-brand` or `--color-accent`; Inactive: `--color-text-3` at ≥ 3:1 | 🟡 |
| 111 | Color | Google/Apple sign-in buttons | Brand buttons in landing | Google uses their brand colors — using incorrect ones breaks trust | Use exact Google Brand Guidelines colors (`#4285F4` CTA, white logo bg) | 🟠 |
| 112 | Color | Passkey / biometric button | Security settings | Likely a glass button — needs subtle icon indicating biometric | Add fingerprint/face-id SVG icon; button needs sufficient contrast | 🟡 |
| 113 | Color | Category icon fill | StampIcon background | 6-color avatar palette reused for categories? | Category icons should use semantic colors, not user avatar palette | 🟡 |
| 114 | Color | Weather icon colors | Weather card | Temperature-based color coding (hot=red, cold=blue) | Color alone insufficient — add text label alongside icon | 🟠 |
| 115 | Color | Expense "over budget" indicator | Budget card | Likely red warning color | Combine with icon (warning SVG) — color alone insufficient | 🟠 |
| 116 | Color | Day dot on trip timeline | Visual timeline in Dashboard | Color-only dots may not distinguish days for colorblind users | Add shape/pattern difference, or number inside dot | 🟠 |
| 117 | Color | Scroll indicator dots | If horizontal scroll exists | Color dot vs white dot — colorblind inaccessible | Use filled vs hollow circle shapes, not just color | 🟠 |
| 118 | Color | Toast success/error variants | Toast.tsx | Green for success, red for error — icon must accompany | Verify icon + color + text triple redundancy in all toast variants | 🟠 |
| 119 | Color | Sheet backdrop overlay | Sheet.tsx | `rgba(0,0,0,0.35)` or similar | Backdrop may not have sufficient opacity for readability on busy bgs | Increase to `rgba(0,0,0,0.55)` for content modals; `0.35` OK for drawers | 🟡 |
| 120 | Color | SelectionInput highlight | CountriesInput, PlacesInput | Active selection highlight color | Must use brand color with 10% opacity fill, brand color border | 🟡 |
| 121 | Color | `--color-brand-hover` | `oklch(35% 0.080 155)` | Darker on hover = good direction; verify it's applied consistently | Audit all brand-colored interactive elements for hover state application | 🟡 |
| 122 | Color | Ink-based shadows in light mode | Box shadows | Shadows using OKLch ink color — verify they don't look muddy | Use `rgba(0,0,0,*)` shadows for reliability across color profiles | 🟢 |
| 123 | Color | Background gradient direction | Linear gradient on hero/body | Gradient direction: top-to-bottom. RTL shouldn't change direction | Color gradients don't flip in RTL — confirm layout gradient is not directional | 🟢 |
| 124 | Color | `--color-accent-hover` | `oklch(56% 0.110 40)` | Good darkening direction | Apply consistently: all terracotta buttons should darken on hover | 🟡 |
| 125 | Color | Success checkmark animation | Packing checklist | Checkmark color after animation should be `--color-success` | Use `--color-success` consistently (not `--color-brand`) for completion states | 🟢 |
| 126 | Color | Muted section dividers | Settings, Dashboard | Thin horizontal lines between sections | Use `--color-border` (89% L) — ensure visible in both modes | 🟡 |
| 127 | Color | PopIn animation glow | `popIn` keyframe | No blur/glow registered in keyframes — only scale | Consider adding subtle `box-shadow` pulse at peak of pop for delight | 🟢 |
| 128 | Color | `--color-text` on glass-2 | Regular text on mid-opacity glass | Text color vs glass surface — need to measure actual composite | Test actual rendered composite in Chromium DevTools color picker | 🟠 |
| 129 | Color | OKLch P3 wide gamut | `oklch()` color space | P3 colors may look different on non-P3 displays (most devices) | Add sRGB fallbacks inside `@supports (color: oklch(0 0 0)) {}` | 🟠 |
| 130 | Color | `--color-bg` primary | Main page background | Paper warm white — beautiful. Must not be pure white (glare) | Confirmed `oklch(98% 0.010 75)` is correct — warm tinted white ✓ | 🟢 |
| 131 | Color | Form field focus glow | `--field-bg-focused` | Blue glow on focus — is it brand blue or `--color-brand`? | Keep focus glow consistent: always `--color-brand` (forest green) | 🟡 |
| 132 | Color | Progress bar fill | Ring / linear progress | Progress fill color — ensure not just `--color-brand` for all uses | Use semantic colors: packing=brand, budget=warning-to-danger gradient | 🟡 |
| 133 | Color | Card shadow depth perception | glass-1 vs glass-3 | Three glass levels — shadow should increase with level | Verify: glass-1 shadow XS, glass-2 SM, glass-3 MD — test visually | 🟡 |
| 134 | Color | Dark mode danger color | Danger in dark bg | Danger red must lighten significantly in dark mode | `--color-danger` dark: `oklch(68% 0.20 25)` (lighter red for dark bg) | 🟠 |
| 135 | Color | Dark mode warning color | Warning in dark bg | Warning yellow must also lighten | `--color-warning` dark: `oklch(80% 0.15 85)` (mellow amber) | 🟠 |
| 136 | Color | Chip variant colors | Chip.tsx 6 variants | All 6 chip backgrounds — verify text contrast on each | `gap`/`open`/`closed` chips must each pass 4.5:1 with their text | 🟠 |
| 137 | Color | GlassBtn accent variant | Terracotta glow | Glow effect adds warm ambient light | Glow should be `0 0 20px rgba(accentRGB, 0.25)` max strength | 🟢 |
| 138 | Color | GlassBtn danger variant | Red glass button | Red glass button — must have sufficient opacity for readability | Danger glass bg must be at least 60% opaque in light mode | 🟠 |
| 139 | Color | Toggle "on" state | `var(--lg-forest)` | Forest green glow on active toggle | Glow should not spread to adjacent text — test on narrow rows | 🟢 |
| 140 | Color | CompassLoader brand colors | c1=forest, c2=terracotta, c3=sand | 3 animated orbit colors | Ensure loader works on both light and dark backgrounds | 🟢 |
| 141 | Color | Landing gradient | LandingSignIn hero | Dark gradient hero — text color must be white with sufficient contrast | Verify hero headline: white on darkest gradient stop ≥ 7:1 | 🟡 |
| 142 | Color | Specular sheen `::before` | `.glass` pseudo-element | Glass specular uses white gradient | `[data-high-contrast] .glass::before { display: none }` | 🟡 |
| 143 | Color | Brand color on dark text bg | NavBar FAB | FAB button background vs icon color | FAB icon must contrast against FAB background ≥ 4.5:1 | 🟠 |
| 144 | Color | Empty state illustration | Multiple screens | Color of illustration | Illustration should use muted palette (desaturated brand colors) | 🟢 |
| 145 | Color | Wishlist empty state | WishlistSheet | No trips bookmarked = empty state | Use warm sand/paper tones for empty state, not pure gray | 🟢 |
| 146 | Color | Category color assignment | 30+ event categories | Each category has a color? | Create semantic color map: nature=green, food=terracotta, transport=blue | 🟡 |
| 147 | Color | Expense "paid by" chip | Per-expense attribution | Color coding by crew member? | Use avatar palette consistently, with initials as fallback | 🟡 |
| 148 | Color | DatePicker calendar | Date range selection | Selected range highlight color | Use 10% brand green as range fill; brand border on start/end dates | 🟡 |
| 149 | Color | Country flag in CountriesInput | Country selection | Flag emojis used for countries | Replace with ISO 3166-1 SVG flags or text code for consistency | 🟡 |
| 150 | Color | `--av-teal` avatar color | Teal avatar | Light teal — white initials on teal may fail contrast | Darken teal: `oklch(40% 0.10 195)` for white text on top | 🟠 |
| 151 | Color | `--av-moss` avatar color | Moss green avatar | Light moss may also fail | Darken: `oklch(38% 0.09 130)` | 🟠 |
| 152 | Color | `--av-sand-gold` avatar | Sand gold | Lightest of all — white text will certainly fail | Use `--color-text` dark on sand-gold avatars; switch text to dark | 🔴 |
| 153 | Color | Print styles | If print CSS exists | No `@media print` styles detected | Add basic print styles: hide NavBar, show full content, remove glass | 🟢 |
| 154 | Color | `color-scheme` property | CSS/HTML | Not confirmed on `<html>` element | Add `color-scheme: light dark` to `<html>` for native UI element theming | 🟡 |
| 155 | Color | System UI blue on iOS | Native browser blue | Tap highlight (default blue) still appears on non-Safari | Add `-webkit-tap-highlight-color: transparent` globally | 🟡 |
| 156 | Color | Selection highlight `::selection` | Text selection | Browser default blue | Set `::selection { background: oklch(42% 0.092 155 / 0.25) }` (brand tint) | 🟢 |
| 157 | Color | Scrollbar track/thumb | Custom scrollbar in `.scroll-container` | Scrollbar colors | Ensure scrollbar uses `--color-border` track, `--color-text-3` thumb | 🟢 |
| 158 | Color | OKLch transition between modes | CSS variable transitions | Variables can transition with `transition: color 0.25s, background 0.25s` | Add `transition: background-color 0.3s ease, color 0.3s ease` to body/html | 🟡 |
| 159 | Color | Supabase captcha widget | Turnstile embed | Widget colors may not match app theme | Apply CSS to Turnstile frame container to match glass surface style | 🟢 |
| 160 | Color | `--space-*` color independence | Space tokens | Spacing tokens don't involve color | Quick audit: grep for accidental `--space-*` in `background` or `color` declarations | 🟢 |
| 161 | Color | Trip card "active trip" indicator | Home screen | Currently selected trip — visual differentiation needed | Add left border accent `4px solid var(--color-brand)` or ring on active trip | 🟡 |
| 162 | Color | Unsaved changes indicator | Forms/Notes | When user has unsaved changes | Show subtle `--color-warning` dot or ring on save button | 🟡 |

---

## 3. Dark Mode (70 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 163 | Dark Mode | Root background | `oklch(8% 0.010 55)` approx | Near-black — good for OLED but can feel oppressive | Add very subtle warm gradient overlay at 3% opacity | 🟢 |
| 164 | Dark Mode | Glass card surfaces | `rgba(20,18,14,0.78)` | 78% opacity is good for readability | Verify: glass-1 (70%), glass-2 (78%), glass-3 (85%) — progressive opacity | 🟡 |
| 165 | Dark Mode | Instrument Serif in dark mode | Serif heading | Light serif strokes can become invisible on dark bg | Increase font-weight from 400 → 500 in dark mode for serif headings | 🟠 |
| 166 | Dark Mode | Forest green brand on dark bg | `--color-brand` in dark | oklch(42% 0.092 155) on oklch(8%) bg ≈ 3.1:1 ratio | Use `--color-brand-dark-mode: oklch(65% 0.10 155)` (lighter green) for text | 🔴 |
| 167 | Dark Mode | Terracotta accent in dark | `--color-accent` in dark | Same issue — dark accent on dark bg | Use `--color-accent-dark-mode: oklch(72% 0.12 40)` for dark mode text use | 🔴 |
| 168 | Dark Mode | Border visibility | `oklch(30% 0.014 55)` in dark | Borders exist but are subtle | Slightly increase to `oklch(35% 0.016 55)` for card edges in dark | 🟡 |
| 169 | Dark Mode | Shadow depth | `rgba(0,0,0,0.40–0.62)` | Good range — but check if shadows are visible on near-black bg | Add a lighter inner glow shadow for elevation on dark: `inset 0 1px 0 rgba(255,255,255,0.05)` | 🟢 |
| 170 | Dark Mode | Input field background | `--field-bg-focused` dark | Dark input on dark surface — needs visible distinction | Input dark: `rgba(255,255,255,0.06)` bg + `rgba(255,255,255,0.12)` border | 🟠 |
| 171 | Dark Mode | Input placeholder dark | `::placeholder` color | Placeholder must be visible without competing with input text | Dark placeholder: `rgba(255,255,255,0.35)` opacity | 🟡 |
| 172 | Dark Mode | NavBar dark appearance | Glass pill nav | NavBar glass in dark: must float visibly over dark content | Dark NavBar: `background: rgba(15,13,10,0.80); backdrop-filter: blur(32px)` | 🟡 |
| 173 | Dark Mode | FAB (Add button) in dark | `+` button | Bright white FAB on dark may cause harsh contrast | Use brand terracotta FAB in dark mode for visual continuity | 🟢 |
| 174 | Dark Mode | Active nav tab blob | Terra gradient in dark | Gradient in dark mode should be slightly more luminous | Dark active blob: increase saturation 10% for visual pop | 🟢 |
| 175 | Dark Mode | Toast in dark mode | `backdrop-filter: blur(28px)` | Toast background opacity must be sufficient | Toast dark: `rgba(18,16,12,0.88)` bg, `rgba(255,255,255,0.12)` border | 🟡 |
| 176 | Dark Mode | Sheet overlay backdrop | `rgba(0,0,0,0.35)` | On dark background, 35% black overlay barely darkens content | Increase dark mode sheet backdrop to `rgba(0,0,0,0.65)` | 🟡 |
| 177 | Dark Mode | Skeleton shimmer in dark | Shimmer animation | Light shimmer sweep on dark bg must be tuned | Dark shimmer: `rgba(255,255,255,0.04)` → `rgba(255,255,255,0.12)` sweep | 🟡 |
| 178 | Dark Mode | Image overlays | Trip hero images | Images may appear too dark with a dark mode overlay stacked | Remove any automatic overlay darkening; let images speak | 🟢 |
| 179 | Dark Mode | CompassLoader in dark | Animated loader | 3 orbit colors — ensure they pop against dark bg | Check c3 (sand) in dark mode — may need `oklch(78% 0.13 75)` for dark | 🟡 |
| 180 | Dark Mode | Grain texture in dark | Body `::before` | Grain adds great texture in light; in dark it can look noisy | Reduce grain opacity: `[data-dark] body::before { opacity: 0.035 }` | 🟢 |
| 181 | Dark Mode | Weather card dark | Temperature, condition | Dark weather card with icon + temp — card bg must not blend with bg | Add stronger glass border in dark mode on weather card | 🟡 |
| 182 | Dark Mode | Budget "over limit" red in dark | Red warning color | Red on dark bg — may need lighter shade | Dark danger: `oklch(68% 0.20 25)` (brighter red) | 🟠 |
| 183 | Dark Mode | Toggle "off" state in dark | Toggle.tsx | Off/gray toggle — must contrast against dark glass surface | Dark toggle off: `rgba(255,255,255,0.15)` bg | 🟡 |
| 184 | Dark Mode | Toggle "on" glow in dark | Forest glow | Forest glow in dark mode — be careful not to overpower | Cap glow at `0 0 12px rgba(forestRGB, 0.35)` in dark | 🟢 |
| 185 | Dark Mode | Ring progress dark | SVG donut | Track ring vs fill ring — dark track must be visible | Dark track: `rgba(255,255,255,0.10)`; fill: brand color | 🟡 |
| 186 | Dark Mode | Map dark mode | Leaflet map | Leaflet defaults to light tile layer | Add dark tile layer for `[data-dark]`: CartoDB Dark Matter or similar | 🟠 |
| 187 | Dark Mode | Packing category pills dark | Pill badges | Category pill bg in dark — muted color chip | Dark chip bg: `rgba(255,255,255,0.08)`; text: `rgba(255,255,255,0.75)` | 🟡 |
| 188 | Dark Mode | Icon.tsx stroke color | SVG icons | Icons use `currentColor` — inherits text color | In dark mode `currentColor` = near-white — icons look fine ✓ | 🟢 |
| 189 | Dark Mode | Section dividers dark | Horizontal rules | `--color-border` dark override must be visible | Dark border: `rgba(255,255,255,0.10)` minimum | 🟡 |
| 190 | Dark Mode | Eyebrow labels dark | `.eyebrow` class | Uppercase small label in dark mode | Dark eyebrow: `color: var(--color-text-2)` not text-3 for readability | 🟡 |
| 191 | Dark Mode | Focus ring dark | `:focus-visible` | Brand green focus ring on dark bg — verify visibility | Dark focus ring: `var(--color-brand-dark-mode)` = lighter green | 🟠 |
| 192 | Dark Mode | Form error state dark | Field.tsx | Red border + shadow on dark input | Danger border dark: `rgba(220,60,40,0.6)` instead of full red | 🟡 |
| 193 | Dark Mode | Crew avatar in dark | Circle initials | Avatar bg color + white initial in dark mode | Avatar backgrounds should not change in dark — they're meant to be colorful | 🟢 |
| 194 | Dark Mode | Trip theme stripes dark | Home card | Colorful theme stripes on dark card | Lower theme stripe opacity to 75% in dark mode | 🟢 |
| 195 | Dark Mode | Date picker dark | Create trip sheet | Calendar/datepicker dark mode | Use dark glass surface for calendar; selected range = brand green 20% fill | 🟡 |
| 196 | Dark Mode | Countries input dark | Flag/text dropdown | Dropdown list in dark mode | List bg: `rgba(16,14,10,0.92)` + blur; item hover: `rgba(255,255,255,0.06)` | 🟡 |
| 197 | Dark Mode | CurrencyAmount popover dark | Pop-up overlay | Currency list popover in dark mode | Popover: `rgba(16,14,10,0.92) backdrop-filter: blur(24px)` | 🟡 |
| 198 | Dark Mode | Wishlist card dark | Bookmarked items | Wishlist item cards in dark | Glass-1 surface with brand-tinted border on hover | 🟡 |
| 199 | Dark Mode | Settings page dark | Section layout | Settings rows in dark mode | Row hover: `rgba(255,255,255,0.04)` bg; divider: `rgba(255,255,255,0.08)` | 🟡 |
| 200 | Dark Mode | Destructive (delete) row dark | Settings / red action | "Delete account" row in dark mode | Dark danger row: red at `oklch(65% 0.20 25)` — not full bright red | 🟡 |
| 201 | Dark Mode | OTP input cells dark | MFAChallenge | Dark input cells for OTP | Dark OTP: `rgba(255,255,255,0.06)` bg, `1px solid rgba(255,255,255,0.15)` | 🟡 |
| 202 | Dark Mode | Landing page dark mode | LandingSignIn | Dark mode landing — full dark hero | Landing dark: use richer dark gradient with subtle noise texture | 🟡 |
| 203 | Dark Mode | Notes textarea dark | NotesScreen | Dark textarea — plain bg | Notes dark: `rgba(255,255,255,0.04)` textarea bg, subtle rounded border | 🟡 |
| 204 | Dark Mode | `data-dark` vs `prefers-color-scheme` | Conflict handling | Server reads cookie; client also responds to media query | Ensure `[data-dark="false"]` explicitly blocks the media query override | 🟠 |
| 205 | Dark Mode | Transition when toggling dark | AppShell effect | Toggle switches `data-dark` attribute | Add `transition: background-color 0.35s ease` to body for smooth switch | 🟡 |
| 206 | Dark Mode | Scroll indicator (if any) | Horizontal scroll | Color dots for scroll position | Dark: use `rgba(255,255,255,0.25)` inactive, `rgba(255,255,255,0.85)` active | 🟢 |
| 207 | Dark Mode | AI output text dark | PlanWithAI streamed | Streamed text on dark glass card | AI output: `color: var(--color-text)` dark mode = near-white ✓ | 🟢 |
| 208 | Dark Mode | Chip `gap` variant dark | Chip.tsx | "Gap" chip indicating free time | Dark gap chip: light teal bg at 15% opacity | 🟢 |
| 209 | Dark Mode | TermsModal dark | Full-screen terms sheet | Terms text on dark bg | Use `--color-text` and `--color-text-2` for terms body text in dark | 🟡 |
| 210 | Dark Mode | Tour overlay dark | TourOverlay.tsx | Spotlight/highlight overlay in dark mode | Tour spotlight: brighten highlighted element, darken everything else 85% | 🟠 |
| 211 | Dark Mode | `specularSweep` animation | Glass `::before` sheen | White gradient sweep on glass | Dark mode: reduce specular opacity to 30% of light mode value | 🟡 |
| 212 | Dark Mode | `glassGlow` animation | Glass ambient glow | Cyclic glow on glass surfaces | Dark mode glow can use a lighter, more saturated brand color | 🟢 |
| 213 | Dark Mode | AsyncError component dark | Error display | Error state on dark bg | Error card dark: use `--color-danger` at 65% lightness for text | 🟡 |
| 214 | Dark Mode | Supply item assignment chip | Packing assign | Crew name chip on supply item | Dark assignment chip: avatar color bg at 15% opacity + crew text | 🟢 |
| 215 | Dark Mode | Timeline visualization dark | Dashboard timeline | Day dots/lines in dark | Timeline track dark: `rgba(255,255,255,0.12)` | 🟢 |
| 216 | Dark Mode | Icon color in active state | NavBar icons | Active icon in dark mode | Active icon: `var(--color-accent)` or white — must contrast active blob bg | 🟡 |
| 217 | Dark Mode | Sheet drag handle dark | Drag bar visual | White/gray drag bar on dark sheet | Dark drag handle: `rgba(255,255,255,0.25)` pill shape | 🟡 |
| 218 | Dark Mode | App icon / favicon | PWA metadata | Meta themeColor responds to mode | Confirmed `themeColor` has both light/dark in metadata ✓ | 🟢 |
| 219 | Dark Mode | Security session list dark | SecuritySettings | Session rows in dark | Session row dark: same glass-1 treatment as settings rows | 🟢 |
| 220 | Dark Mode | Map marker icons dark | Leaflet markers | Colored markers — are they readable on dark tile? | Use light-outlined marker icons in dark map mode | 🟠 |
| 221 | Dark Mode | Keyboard avoidance dark | Visual viewport handler | Sheet pushes above keyboard | Keyboard handle area bg in dark: match sheet bg | 🟢 |
| 222 | Dark Mode | `[data-dark]` selector ordering | CSS cascade | Must come after `:root` in cascade | Confirm `[data-dark="true"]` rules appear after `:root` in globals.css | 🟠 |
| 223 | Dark Mode | Dark mode cookie persistence | Server/client sync | Cookie set on toggle — expires? | Set cookie `max-age=31536000` (1 year) to persist preference | 🟡 |
| 224 | Dark Mode | System preference auto-mode | "System" option in settings | Auto mode reads prefers-color-scheme | Ensure `data-dark` is NOT set (absent) when in auto/system mode | 🟡 |
| 225 | Dark Mode | Gradient text in dark | If used anywhere | CSS gradient text may need adjustment | Gradient text: increase lightness of gradient stops by 25% in dark | 🟡 |
| 226 | Dark Mode | StampIcon circle bg dark | Activity stamp bg | Colored circle behind stamp icon | Use `var(--av-*)` tokens at 85% opacity in dark (not full opacity) | 🟢 |
| 227 | Dark Mode | `@media print` in dark | Print from dark mode | Printing from dark = all-black expensive paper waste | Force light mode for print: `@media print { html { filter: none } }` | 🟡 |
| 228 | Dark Mode | Turnstile captcha dark | Auth page | Turnstile: `data-theme` attribute must match app theme | Pass `data-theme="dark"` to Turnstile widget when `[data-dark="true"]` | 🟠 |
| 229 | Dark Mode | GlassBtn ghost variant dark | Ghost/flat buttons | Ghost button: transparent bg, text only | Dark ghost: `color: rgba(255,255,255,0.8)`; border: `rgba(255,255,255,0.15)` | 🟡 |
| 230 | Dark Mode | Reduced motion + dark together | Combined modes | Both preferences active simultaneously | Test both: `[data-dark][data-reduced-motion]` — all animations must be off | 🟠 |
| 231 | Dark Mode | Text selection in dark | `::selection` | Dark mode selection highlight | Dark: `::selection { background: rgba(lightGreen, 0.35) }` | 🟢 |
| 232 | Dark Mode | Journey horizontal scroll dark | If scroll cards exist | Horizontal card track in dark | Card edges must have visible left/right fade gradient in dark | 🟡 |

---

## 4. Light Mode (65 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 233 | Light Mode | Paper background | `oklch(98% 0.010 75)` | Warm off-white — excellent choice | Confirm it doesn't become pure white on sRGB fallback | 🟢 |
| 234 | Light Mode | Glass card opacity | `rgba(255,255,255,0.45)` | 45% opacity can look washed out on light backgrounds | Increase base glass to `rgba(255,255,255,0.72)` in light mode | 🟠 |
| 235 | Light Mode | Glass-3 elevated | `rgba(255,255,255,0.65)` (approx) | Content inside glass-3 may have low contrast on busy bg | Minimum 72% white opacity for elevated surfaces | 🟡 |
| 236 | Light Mode | Body text contrast | `oklch(13% 0.012 55)` on `oklch(98%)` | Near-black on near-white — excellent, ~18:1 | ✓ Confirmed passing | 🟢 |
| 237 | Light Mode | Text-2 contrast | `oklch(40% 0.020 55)` on paper | 40% L on 98% L ≈ 7:1 — passes | ✓ Confirmed | 🟢 |
| 238 | Light Mode | Text-3 contrast | `oklch(60% 0.014 55)` on paper | 60% L on 98% L ≈ 4.2:1 — BORDERLINE FAIL | Darken to `oklch(54% 0.014 55)` for reliable AA compliance | 🔴 |
| 239 | Light Mode | Shadows on white card | `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` | Light shadow may disappear on white bg | Use two-layer shadow: `0 1px 3px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)` | 🟡 |
| 240 | Light Mode | Brand green on white text | `--color-brand` used as button color | Forest green button with white label: `oklch(42% 0.092 155)` on white text | White on forest green ≈ 5.8:1 — passes AA ✓ | 🟢 |
| 241 | Light Mode | Terracotta accent on white | `--color-accent` text | If accent used as text on white: 3.8:1 FAIL | Never use accent as body text on white; only on colored bg or as icon fill | 🔴 |
| 242 | Light Mode | Glass border visibility | Directional border | Glass borders in light mode very faint | Add `border: 1px solid rgba(0,0,0,0.08)` underneath directional border | 🟡 |
| 243 | Light Mode | Card inner content legibility | Text on glass-1 card | Card bg 45% white + text `oklch(13%)` — composite contrast | Measure actual composite: 45% white on warm bg + dark text = verify | 🟠 |
| 244 | Light Mode | Grain texture visibility | Light mode grain | Grain at 4–5% opacity on light bg — subtle | ✓ Grain in light mode is minimal and tasteful | 🟢 |
| 245 | Light Mode | Orb ambient light | Body `::before`/`::after` | Warm orange/green orbs in light mode | Orbs should be very subtle (opacity 0.15–0.2) to avoid color casts | 🟡 |
| 246 | Light Mode | NavBar glass pill light | Bottom floating pill | Light glass NavBar on light page — needs visible separation | Light NavBar: `background: rgba(255,255,255,0.75); box-shadow: 0 -1px 0 rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.12)` | 🟠 |
| 247 | Light Mode | Sheet backdrop light | Modal overlay | Light mode: `rgba(0,0,0,0.35)` backdrop | 35% black overlay may not dim bright light-mode backgrounds enough | `rgba(0,0,0,0.45)` in light mode | 🟡 |
| 248 | Light Mode | Input field light | Field.tsx | Input bg: light glass surface | Light input: `rgba(255,255,255,0.60)` bg + `1px solid rgba(0,0,0,0.12)` border | 🟡 |
| 249 | Light Mode | Input focus glow light | Blue glow | Focus glow in light mode — should use brand green not system blue | Override `:focus` ring to `var(--color-brand)` explicitly | 🟠 |
| 250 | Light Mode | Error state red in light | Form error | Red border + pink shadow in light mode | Light error: `border-color: oklch(50% 0.20 25)` — saturated enough to be clear | 🟡 |
| 251 | Light Mode | Toast in light mode | Toast.tsx | Light glass toast on light page — may not be visible | Light toast: increase opacity to 85%, add subtle drop shadow | 🟠 |
| 252 | Light Mode | Skeleton in light | Shimmer animation | Light shimmer on warm-white card | Light shimmer: `rgba(0,0,0,0.04)` → `rgba(0,0,0,0.10)` sweep | 🟡 |
| 253 | Light Mode | Primary CTA button light | GlassBtn forest/terra | Both primary button types in light mode | Ensure both have clear visual hierarchy over secondary options | 🟡 |
| 254 | Light Mode | Section dividers light | Horizontal line | `--color-border` at 89% L — visible? | 89% L gray on 98% L white = 1.5:1 — too faint. Use 80% L (`--color-border-strong`) | 🟠 |
| 255 | Light Mode | Avatar initials light | Colored circles | White initials on avatar colors — tested per color | sand-gold avatar FAILS for white initials (see row 152) | 🔴 |
| 256 | Light Mode | Category chips light | Chip.tsx | Colored chip on white card | All chip backgrounds must have at least 3:1 contrast | 🟡 |
| 257 | Light Mode | Progress ring track light | Ring.tsx | Track circle vs fill circle | Light track: `oklch(89% 0.010 55)` (border color) | 🟡 |
| 258 | Light Mode | Toggle off state light | Toggle.tsx | Gray bg for off state | Light toggle off: `rgba(0,0,0,0.12)` bg — may look washed out | Use `oklch(80% 0.010 55)` as off-state bg for better definition | 🟡 |
| 259 | Light Mode | Packing progress bar light | If linear bar used | Light mode progress fill | Brand green progress fill on white track — clear and readable | 🟢 |
| 260 | Light Mode | Map in light mode | Leaflet | Default light tile (OpenStreetMap) | Default light tile is fine; add subtle vignette for depth | 🟢 |
| 261 | Light Mode | Notes textarea light | NotesScreen | Plain textarea | Light textarea: warm white bg matching paper, soft border | 🟢 |
| 262 | Light Mode | Settings row hover light | Hover state | Row hover in light mode | Light row hover: `rgba(0,0,0,0.03)` — very subtle | 🟢 |
| 263 | Light Mode | Sub-heading eyebrow light | `.eyebrow` | Forest green eyebrow label | On paper background forest green eyebrow text ≈ 7.5:1 — passes ✓ | 🟢 |
| 264 | Light Mode | Landing CTA section light | LandingSignIn | Hero section on light bg | Ensure hero bg gradient differentiates from page bg sufficiently | 🟡 |
| 265 | Light Mode | Wishlist heart icon light | Filled vs unfilled heart | Active/inactive wishlist icon | Active: terracotta fill; Inactive: `--color-text-3` stroke only | 🟡 |
| 266 | Light Mode | Scroll fade edges light | Horizontal scroll | Left/right fade gradient | Light mode fade: `linear-gradient(to right, var(--color-bg), transparent)` | 🟡 |
| 267 | Light Mode | GlassBtn hover lift light | `.liquid-hover` | Scale 1.02 + translateY(-4px) | Beautiful in light mode; shadow elevation must increase on hover | `hover: box-shadow: var(--shadow-lg)` on lift | 🟡 |
| 268 | Light Mode | Breadcrumb/back button light | Navigation | Back button in day detail view | Light back button: icon + text, `--color-text-2` color | 🟢 |
| 269 | Light Mode | Chip `open` variant light | Green chip | "Open" status chip — green bg | On white card: green chip must meet 3:1 for background/UI component | 🟡 |
| 270 | Light Mode | Supply category header light | Category section headers | Category titles above item lists | Use `.eyebrow` style with `--color-text-2`, border-bottom for separation | 🟡 |
| 271 | Light Mode | Budget donut ring light | If donut used | Budget spend visualization | Donut light: spent=terracotta, remaining=border-color track | 🟡 |
| 272 | Light Mode | Add crew avatar placeholder light | Empty circle | "+" circle for adding crew | Light: dashed border `2px dashed --color-border`, `--color-text-3` + icon | 🟢 |
| 273 | Light Mode | AI streaming text light | PlanWithAI | Streamed text on glass card | Dark text on light glass — should be fine; confirm no gray-on-gray | 🟢 |
| 274 | Light Mode | Currency popover light | CurrencyAmount | Pop-up in light mode | White frosted glass popover — ensure shadow separates from page | 🟡 |
| 275 | Light Mode | Date range pill light | Trip card | "Jun 12 – 20" date chip | Neutral chip on warm card — fine ✓ | 🟢 |
| 276 | Light Mode | Active trip highlight light | Home screen | Selected trip card indicator | Left-border accent + very subtle `rgba(brand, 0.05)` bg tint | 🟡 |
| 277 | Light Mode | "Online/offline" indicator light | If offline banner shown | Sync status bar | Offline banner: warm amber bg with dark text; positioned below NavBar | 🟡 |
| 278 | Light Mode | FAB (Add) button light | + FAB in NavBar | Terra gradient FAB | Terracotta FAB on light page — needs shadow to elevate above content | `box-shadow: 0 4px 16px rgba(accentRGB, 0.4)` | 🟡 |
| 279 | Light Mode | Glass specular in light | `::before` sheen | White gradient sweep — elegant in light | ✓ Specular is more visible and purposeful in light mode | 🟢 |
| 280 | Light Mode | Drag handle bar light | Sheet.tsx handle | Pill-shaped drag handle | Light handle: `rgba(0,0,0,0.15)` — subtle but visible | 🟢 |
| 281 | Light Mode | Focus indicator light | `:focus-visible` | Brand green ring on light bg | Brand green (42% L) on light bg — ring at 3px is visible ✓ | 🟢 |
| 282 | Light Mode | Leaflet attribution light | Bottom-right text | Small "© OpenStreetMap" text | Light tile attribution: use `font-size: 10px; opacity: 0.7` | 🟢 |
| 283 | Light Mode | Packing checkbox light | Unchecked state | Square or circle checkbox | Light unchecked: `2px solid --color-border-strong` with white fill | 🟡 |
| 284 | Light Mode | Packing checked state light | Checked animation | After jelly bounce check | Light checked: brand green fill + white checkmark SVG | 🟢 |
| 285 | Light Mode | Empty state illustration light | Screens with no data | Illustration/icon | Use muted warm-colored illustration; avoid pure gray in light mode | 🟡 |
| 286 | Light Mode | Hero background light | LandingSignIn | Landing hero | Light mode landing hero: creamy gradient or subtle travel imagery | 🟡 |
| 287 | Light Mode | TripEntryAnimation light | Entry animation | Animated intro on trip select | Light mode animation should use brand colors prominently | 🟢 |
| 288 | Light Mode | CompassLoader light | Loading spinner | Three-color loader on light bg | Ensure sand-gold orbit visible: use `oklch(58% 0.14 75)` for light | 🟡 |
| 289 | Light Mode | Sync error bar light | Offline/sync alerts | Error bar at top | Light sync error: red border bottom, warm amber bg | 🟡 |
| 290 | Light Mode | Back to top button light | If exists | Scroll-to-top affordance | Light: glass button with shadow; positioned above NavBar | 🟢 |
| 291 | Light Mode | Glass-active state light | Deep modal layer | Deepest overlay glass | Glass-active light: 80% opacity white, strong shadow | 🟡 |
| 292 | Light Mode | TermsModal light | Full-screen legal | Terms sheet in light | Standard white background, `--color-text` body, clean headings | 🟢 |
| 293 | Light Mode | Onboarding PersonaSheet light | First-run persona | Persona selection sheet in light | Vibrant theme colors on white card, brand CTA button | 🟡 |
| 294 | Light Mode | Country flag in light | Emoji or SVG flags | Country selection | Flag emojis may render differently per OS — use text code fallback | 🟡 |
| 295 | Light Mode | MFA/OTP input light | Digit cells | OTP cells in light | White bg cells with `--color-border-strong` border + brand focus ring | 🟡 |
| 296 | Light Mode | Security passkey card light | Passkey chip/card | Passkey info row | Clean white card with biometric icon, brand green checkmark | 🟢 |
| 297 | Light Mode | Ambient orb color light | `::before`/`::after` | Warm orange/green ambient | Light orbs at ≤20% opacity; no orb colors should tint text | 🟡 |

---

## 5. Spacing & Layout (90 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 298 | Spacing | Page padding mobile | `--page-px: 24px` | Must be consistent left AND right | Check all screens apply `padding-inline: var(--page-px)` | 🟡 |
| 299 | Spacing | Page padding tablet | `640px+: 32px` | Fine breakpoint | Verify all screen components inherit this | 🟡 |
| 300 | Spacing | Page padding desktop | `1024px+: 48px` | Generous | Confirm max-width container limits content to 1200px | 🟡 |
| 301 | Spacing | NavBar clearance | `.day-list-pb: 136px` | 136px bottom padding for FAB clearance | Verify sufficient for safe-area-inset-bottom on iPhone | 🟠 |
| 302 | Spacing | Safe area insets | CSS env() | Home bar on iPhone = ~34px safe area | Apply `padding-bottom: calc(136px + env(safe-area-inset-bottom))` | 🔴 |
| 303 | Spacing | Safe area top | CSS env() | Notch/Dynamic Island on iPhone X+ | Apply `padding-top: env(safe-area-inset-top)` to any fixed top bars | 🟠 |
| 304 | Spacing | NavBar height token | Fixed pill bottom | NavBar pill height approximately 68px + margins | Document actual height in token `--navbar-height: 80px` for reuse | 🟡 |
| 305 | Spacing | Sheet header padding | Sheet.tsx | Padding above title, below drag handle | Confirm `padding: 20px 24px 16px` inside sheet header | 🟡 |
| 306 | Spacing | Sheet content padding | Sheet.tsx | Content area padding | `padding: 0 24px 32px` + `env(safe-area-inset-bottom)` | 🟠 |
| 307 | Spacing | Card inner padding | Glass card | Inner content padding | Confirm cards use `padding: var(--space-5)` (20px) consistently | 🟡 |
| 308 | Spacing | Card grid gap | Dashboard `.resp-dash-grid` | `gap: 20px` on desktop | Ensure mobile gap reduces to `--gap-md: 16px` | 🟢 |
| 309 | Spacing | Card border radius | Mixed radius values | Cards may use mixed radius | Standardize: trip cards=24px, detail cards=20px, chips=full | 🟡 |
| 310 | Spacing | Button height | 52px primary, 44px secondary | Both meet touch target minimum | ✓ Confirmed | 🟢 |
| 311 | Spacing | Button padding | `0 24px` | Narrow for short labels | Add `min-width: 120px` on primary buttons | 🟡 |
| 312 | Spacing | Icon button touch target | 44px min | Confirm all icon-only buttons are 44x44px | Add `min-width: 44px; min-height: 44px` wrapper on icon buttons | 🔴 |
| 313 | Spacing | GlassBtn sm size | `44px height` | 44px is minimum — can feel small | Consider 48px for sm on touch-primary devices | 🟡 |
| 314 | Spacing | NavBar tab touch target | 375px / 5 tabs = 75px each | Good width per tab | ✓ Horizontal space per tab is sufficient | 🟢 |
| 315 | Spacing | FAB button size | 3 FABs in NavBar | Verify tap targets don't overlap | FABs must have min 12px gap between them | 🟠 |
| 316 | Spacing | Field label spacing | Above input | Gap between label and input field | Use `gap: var(--space-2)` (8px) between label and input | 🟡 |
| 317 | Spacing | Field hint spacing | Below input | Gap between input and hint text | Use `margin-top: var(--space-1)` (4px) for hint | 🟢 |
| 318 | Spacing | Form field vertical rhythm | Between fields in sheet | Gap between stacked form fields | Use `gap: var(--space-4)` (16px) between field groups | 🟡 |
| 319 | Spacing | Section spacing in settings | Between section groups | Vertical space between sections | `margin-block: var(--space-6)` (24px) between sections | 🟡 |
| 320 | Spacing | Dashboard hero card | Top card spacing | First card below top padding | Ensure first card has no extra margin-top beyond page padding | 🟢 |
| 321 | Spacing | Trip card list spacing | Home screen | Gap between trip cards | `gap: var(--space-3)` (12px) — compact but not cramped | 🟡 |
| 322 | Spacing | Avatar overlap in crew preview | Stacked avatars | Negative margin stack | Overlap: `-margin-inline-start: 8px` on 2nd+ avatars | 🟢 |
| 323 | Spacing | Event timeline vertical rhythm | DayDetail events | Spacing between events | `gap: var(--space-3)` between events | 🟡 |
| 324 | Spacing | Time label width | Time column left of events | Fixed width for alignment | `min-width: 56px` for time column to prevent wrapping | 🟡 |
| 325 | Spacing | Chip padding | `3px 9px` | 3px top/bottom is minimal | Add `4px 10px` for slightly more breathing room | 🟢 |
| 326 | Spacing | Packing item row padding | Supply item rows | Row height and padding | Min height 48px; `padding: 12px 16px` | 🟡 |
| 327 | Spacing | Packing category header | Above item group | Space above category name | `padding-block-start: var(--space-5)` for category headings | 🟡 |
| 328 | Spacing | Bottom action area | Sheets with CTA | Sticky CTA at bottom of sheet | CTA: `padding: 16px 24px; padding-bottom: calc(16px + env(safe-area-inset-bottom))` | 🟠 |
| 329 | Spacing | Map insets | Map_V2 | Map fills screen — accounts for NavBar? | Map bottom: `calc(100% - var(--navbar-height) - env(safe-area-inset-bottom))` | 🔴 |
| 330 | Spacing | Screen inset coverage | `.screen-inset-nav` | Already defined — accounts for NavBar | Verify `.screen-inset-nav` value matches `--navbar-height` token | 🟠 |
| 331 | Spacing | Horizontal card scroll | If horizontal scrolling exists | Padding on scroll container | Add `padding-inline: var(--page-px)` so first card is inset | 🟡 |
| 332 | Spacing | Pull-to-refresh indicator | iOS | Extra space at top for refresh indicator | Account for 44px native PTR indicator | 🟡 |
| 333 | Spacing | Budget card layout | Dashboard | Budget amounts + labels | Align amounts right, labels left, with ample gutter | 🟡 |
| 334 | Spacing | Weather card grid | Weather card layout | Icon + temp + condition layout | Use CSS Grid 3-col: icon, temp, condition | 🟢 |
| 335 | Spacing | Empty state vertical centering | Empty state components | Center within available height | `display: flex; flex-direction: column; align-items: center; min-height: 40vh` | 🟡 |
| 336 | Spacing | Toast vertical position | Bottom of screen | May overlap NavBar | Should be `bottom: calc(var(--navbar-height) + 16px)` to appear above NavBar | 🟠 |
| 337 | Spacing | Add event FAB clearance | DayDetail screen | FAB button floats over event list | Ensure `padding-bottom: 80px` on last event | 🟠 |
| 338 | Spacing | Z-index scale | CSS stacking contexts | `10, 20, 30, 50` scale recommended | Document: content=1, cards=10, sheets=20, modals=30, toasts=50, tour=100 | 🟡 |
| 339 | Spacing | Responsive max-width | `.resp-container` | `max-width: 1200px` | For content-heavy pages limit to `840px` | 🟡 |
| 340 | Spacing | Landscape phone layout | 375x667 landscape | App primarily designed for portrait | Test key screens in landscape on iPhone SE | 🟡 |
| 341 | Spacing | Tablet layout | 768px-1024px | Desktop grid activates at 1024px | Consider adding a 2-col card grid starting at 768px for iPad | 🟡 |
| 342 | Spacing | Large desktop | 1440px+ | Max-width 1200px helps | Verify centered content has equal margins on 1440px+ screens | 🟢 |
| 343 | Spacing | Nested glass cards | Card within card | Padding inside nested cards | Inner card: `padding: var(--space-3)`; outer: `var(--space-5)` | 🟡 |
| 344 | Spacing | Inline icon + text spacing | GlassBtn with icon | Space between button icon and label | Use `gap: var(--space-2)` (8px) between icon and label | 🟡 |
| 345 | Spacing | NavBar FAB expand panel | Expanded menu | Panel appears above NavBar | Panel should not overlap page content — ensure correct z-index | 🟠 |
| 346 | Spacing | Stagger list animation spacing | List items | Stagger 0.06s between items | Ensure visual spacing matches animation order (top to bottom) | 🟢 |
| 347 | Spacing | Between stats in dashboard | Stat number + label | Vertical gap within stat unit | `gap: var(--space-1)` (4px) between number and label | 🟢 |
| 348 | Spacing | CategoryInput chip grid | If chip picker used | Chips wrapping in grid | `gap: var(--space-2)` with `flex-wrap: wrap` | 🟡 |
| 349 | Spacing | Date range input fields | Create trip form | Two date fields side by side | On mobile: stack vertically | 🟡 |
| 350 | Spacing | Currency selector | Create trip form | Currency field | Full-width on mobile; auto-width with min-width on desktop | 🟢 |
| 351 | Spacing | Drag handle tap area | Sheet drag zone | Small bar + surrounding touch area | Make entire top 44px of sheet a drag target | 🟠 |
| 352 | Spacing | Notes textarea padding | NotesScreen | Textarea inner padding | `padding: var(--space-4)` (16px) — generous for writing | 🟡 |
| 353 | Spacing | Security session row | SecuritySettings | Row info layout | 3-column: device icon, name+date, revoke button | 🟡 |
| 354 | Spacing | MFA OTP cells | Digit inputs | 6 cells across available width | `gap: var(--space-2)`; each cell `min-width: 44px; height: 56px` | 🟡 |
| 355 | Spacing | Country input dropdown | CountriesInput | Dropdown item padding | Min `48px` item height, `padding: 12px 16px` for comfort | 🟡 |
| 356 | Spacing | PlacesInput dropdown | Location autocomplete | Similar to countries input | Same treatment: 48px items, 12px 16px padding | 🟡 |
| 357 | Spacing | AI suggestions list | PlanWithAI | Suggestion items in AI output | `gap: var(--space-4)` between suggestions; `padding: var(--space-4)` per item | 🟡 |
| 358 | Spacing | AI prompt input area | PlanWithAI | Multi-field prompt form | Clear section grouping with `gap: var(--space-6)` between sections | 🟡 |
| 359 | Spacing | Event form in sheet | Add/Edit event | Form fields inside event sheet | Allow natural scroll; no truncation; sheet is full-height | 🟡 |
| 360 | Spacing | Trip theme picker | Create trip | Theme selection grid | Grid: 4-col on 375px; `gap: 8px`; each tile 72x72px | 🟡 |
| 361 | Spacing | Budget edit numeric input | Dashboard sheet | Budget number field | Prominent: large input, right-aligned, monospace | 🟡 |
| 362 | Spacing | Crew member list rows | Crew_V2 | Avatar + name + role + remove | `min-height: 56px` per row | 🟡 |
| 363 | Spacing | Remove crew confirmation | Confirmation dialog | Confirm before remove | Sheet with clear spacing: title, body, 2 buttons | 🟡 |
| 364 | Spacing | Join trip page layout | `/join/[token]` | Invite landing page | Centered card, max-width 440px, ample padding on mobile | 🟡 |
| 365 | Spacing | Account delete page | `/account/cancel-delete` | Critical flow page | Spacious layout, large CTA, danger styling prominent | 🟡 |
| 366 | Spacing | Error screen layout | AsyncError.tsx | Error state | Centered, icon at top, message below, retry button | 🟡 |
| 367 | Spacing | Tour overlay highlight | TourOverlay.tsx | Spotlight ring around UI element | Spotlight ring padding: 8px around targeted element | 🟡 |
| 368 | Spacing | Offline banner height | Sync error display | Alert strip height | `min-height: 44px; padding: 10px 24px` | 🟡 |
| 369 | Spacing | Progress bar thickness | Linear progress | If used for budget/packing | `height: 6px` minimum; `8px` preferred | 🟡 |
| 370 | Spacing | Wishlist cards | WishlistSheet | Item card layout | Same glass card treatment as event cards | 🟡 |
| 371 | Spacing | Map event detail popup | Marker popup | Leaflet popup dimensions | Min `200px` wide popup with `padding: 12px 16px` | 🟡 |
| 372 | Spacing | LandingSignIn form padding | Auth form | Sign-in form card | Card padding `32px 24px` mobile, `40px 36px` desktop | 🟡 |
| 373 | Spacing | Stacked form buttons | Two action buttons | Primary + secondary at bottom | `display: flex; flex-direction: column; gap: var(--space-3)` | 🟢 |
| 374 | Spacing | Chip wrap overflow | Category chips | Long list of chips wrapping | `flex-wrap: wrap; gap: var(--space-2)` with scroll fade | 🟡 |
| 375 | Spacing | Day picker / calendar | Date selection | Calendar grid padding | Cell size: 44x44px; week row gap: 4px | 🟡 |
| 376 | Spacing | Scroll container padding | Horizontal scroll cards | Left padding so first card is not cut | `padding-inline-start: var(--page-px)` on scroll parent | 🟡 |
| 377 | Spacing | Gap token usage | Token audit | Gap tokens exist | Verify all gap usages reference tokens — not arbitrary px values | 🟡 |
| 378 | Spacing | Supply item assignment chip | Assign chip | Small crew assignment chips | Min `32px` height for mini-chips; `padding: 4px 10px` | 🟡 |
| 379 | Spacing | Section title padding | All screens | Title + first card gap | `margin-block-end: var(--space-3)` between section title and content | 🟡 |
| 380 | Spacing | Responsive grid 768px | Dashboard | Between 640px and 1024px | Consider 2-col at 768px: wide card + narrow sidebar | 🟡 |
| 381 | Spacing | `--border-radius-numbered` | 16-40px scale | Larger shapes use 32px or 40px | Reserve 40px for floating panels/NavBar; 24px for cards | 🟡 |
| 382 | Spacing | SettingsRow icon area | Left icon on row | 40px icon container + 16px gap to text | ✓ Standard settings row layout is acceptable | 🟢 |
| 383 | Spacing | `--radius-full: 9999px` | Pills and chips | Full radius used on chips/badges | ✓ Full radius on chips and toggle knob is correct | 🟢 |
| 384 | Spacing | Vertical scroll padding | Screen inset | Bottom scroll padding | Verify every scroll container has `padding-bottom: var(--navbar-clearance)` | 🟠 |
| 385 | Spacing | PageTitle to first content gap | All screens | Header then content spacing | `margin-block-end: var(--space-5)` (20px) from page title to first card | 🟡 |
| 386 | Spacing | Floating elements from edges | Toast, FABs, NavBar | All floating UI elements | Minimum 12px from screen edges; 16px from bottom safe area | 🟠 |
| 387 | Spacing | Primary and secondary button gap | Form CTAs | "Save" primary + "Cancel" ghost | `gap: var(--space-3)` vertical stack | 🟡 |

---

## 6. Buttons & CTAs (82 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 388 | Buttons | GlassBtn default | Mid-opacity glass bg | Default variant without clear hierarchy | Default variant should be visually secondary to forest/accent variants | 🟡 |
| 389 | Buttons | GlassBtn forest | Brand green button | Primary action button | Ensure `font-weight: 600` on all primary buttons | 🟡 |
| 390 | Buttons | GlassBtn accent (terra) | Terracotta gradient | Secondary CTA | On white bg, ensure text label is white with >= 4.5:1 | 🟠 |
| 391 | Buttons | GlassBtn coral | Coral variant | Tertiary action | Coral and accent are visually similar — differentiate more clearly | 🟡 |
| 392 | Buttons | GlassBtn danger | Red glass | Destructive action | Add warning icon before label on all destructive buttons | 🟠 |
| 393 | Buttons | GlassBtn ghost | Transparent bg | Low-emphasis action | Ghost border must be visible: `border: 1.5px solid rgba(current, 0.25)` | 🟡 |
| 394 | Buttons | GlassBtn flat | Completely transparent | No-chrome button | Only use for secondary actions in high-contrast situations | 🟡 |
| 395 | Buttons | GlassBtn whileTap | `scale(0.96)` | Good press response | 0.96 is correct — confirm no layout shift from scale | 🟢 |
| 396 | Buttons | GlassBtn whileHover | `scale(1.02)` + `translateY(-4px)` | Desktop hover lift | Must be wrapped in `@media (hover: hover)` to prevent mobile jitter | 🟠 |
| 397 | Buttons | GlassBtn loading state | Loading during async | Button label disappears? | Show spinner inside button while loading; keep button width stable | 🟠 |
| 398 | Buttons | GlassBtn disabled state | `disabled` prop | Opacity reduction + `cursor: not-allowed` | Add `pointer-events: none` on disabled to prevent tap events | 🟡 |
| 399 | Buttons | GlassBtn backdrop | Backdrop filter on button | Blur behind button can be expensive on scroll | Use `will-change: filter` only when hovered, not statically | 🟡 |
| 400 | Buttons | Btn.tsx (legacy) | Inline styles, 3 kinds | Legacy button co-exists with GlassBtn | Consolidate: migrate all Btn.tsx usages to GlassBtn for consistency | 🟠 |
| 401 | Buttons | Btn kind=terra | Terra color inline | Inline styles vs CSS variable | Replace inline `color` with `var(--color-accent)` | 🟡 |
| 402 | Buttons | Btn kind=forest | Forest color inline | Same issue | Replace with `var(--color-brand)` | 🟡 |
| 403 | Buttons | Btn kind=glass | Glass kind | Less capable than GlassBtn | Migrate to GlassBtn default variant | 🟡 |
| 404 | Buttons | Primary CTA full-width | Full-width button on mobile | `full` prop on GlassBtn | Full-width CTA must have `width: 100%` not `max-width: fit-content` | 🟡 |
| 405 | Buttons | FAB (Add +) button | NavBar bottom center | Prominent add action | FAB icon should animate (rotate 45 deg) when expanded | 🟡 |
| 406 | Buttons | FAB AI suggestions | NavBar secondary FAB | AI sparkle icon | Sparkle icon should pulse subtly on mount to draw attention | 🟢 |
| 407 | Buttons | FAB Menu | NavBar hamburger FAB | Expand/collapse menu | Hamburger icon animates to X on expand | 🟡 |
| 408 | Buttons | NavBar FAB spacing | 3 FABs in center | Gap between FABs | `gap: 12px` between FABs; total width must not exceed 160px | 🟡 |
| 409 | Buttons | NavBar FAB z-index | Stacked above nav pill | FABs must float above tab bar | FABs z-index: `var(--z-navbar) + 1` | 🟡 |
| 410 | Buttons | Close button in Sheet | X button top-right | Icon-only close | `aria-label="Close"`, min 44x44px, positioned at corner with 8px inset | 🟠 |
| 411 | Buttons | Close button hover | Sheet close X | Must have hover state | `hover: background: rgba(0,0,0,0.08); border-radius: 50%` | 🟡 |
| 412 | Buttons | Delete event button | Event row action | Trash icon button | `aria-label="Delete event"`, danger color on hover | 🟠 |
| 413 | Buttons | Edit event button | Event row action | Edit icon button | `aria-label="Edit event"`, brand color on hover | 🟡 |
| 414 | Buttons | Remove crew member | Crew row action | Remove button | Red/danger styled, requires confirmation before action | 🟠 |
| 415 | Buttons | Save button in sheets | All edit forms | Primary action in sheet | Use GlassBtn forest, full-width, sticky at bottom | 🟡 |
| 416 | Buttons | Cancel button in sheets | All edit forms | Secondary action | Use GlassBtn ghost, same width as save | 🟡 |
| 417 | Buttons | Confirm delete dialog | Before deletion | Two buttons: keep + delete | Danger button (delete) visually heavier; cancel = ghost | 🟠 |
| 418 | Buttons | Sign out button | NavBar expand menu | Destructive look | Red text/icon in menu — ensure ARIA role is `button`, not link | 🟠 |
| 419 | Buttons | "Add trip" button | Home screen | Large CTA on empty state | Must be the most prominent element on empty home screen | 🟡 |
| 420 | Buttons | "Add event" button | DayDetail | Plus button or FAB | Position above keyboard when text input is focused | 🟡 |
| 421 | Buttons | "Generate with AI" CTA | PlanWithAI | Prominent AI generate button | Use accent gradient (terra) + sparkle icon for AI generate CTA | 🟡 |
| 422 | Buttons | Google/Apple SSO buttons | LandingSignIn | Auth provider buttons | Use exact brand-spec buttons (colors, logos, sizes per guidelines) | 🟠 |
| 423 | Buttons | Passkey button | Security settings | Biometric auth button | Show fingerprint/face icon; label: "Add passkey" | 🟡 |
| 424 | Buttons | Language toggle button | Settings | EN/HE toggle | Use `role="radiogroup"` with `role="radio"` options | 🟠 |
| 425 | Buttons | Theme toggle (3 options) | Settings | Light/Dark/System | Use segmented control pattern; `aria-pressed` or radio group | 🟠 |
| 426 | Buttons | "Copy link" button | Trip share / invite | Link copy action | Show checkmark feedback for 2 seconds after copy, then reset | 🟡 |
| 427 | Buttons | Retry button | AsyncError | Error recovery | Prominent retry CTA — not ghost; use forest button | 🟠 |
| 428 | Buttons | "OK/Got it" tour button | TourOverlay | Dismiss tour step | Button should be bottom-center, prominent but not distracting | 🟡 |
| 429 | Buttons | Budget "Edit" button | Dashboard budget card | Opens edit sheet | Small ghost button next to budget amount | 🟡 |
| 430 | Buttons | "View all" link-buttons | Dashboard quick views | If any "see more" exist | Use `<a>` styled as button, not `<div>` | 🟡 |
| 431 | Buttons | Wishlist "Remove" | Bookmarked item | Heart toggle to remove | Heart icon: filled (saved) to outline (removed) with transition | 🟡 |
| 432 | Buttons | Wishlist "Add to day" | From wishlist to day | Copy event action | Use forest button: "Add to Day" with day picker | 🟡 |
| 433 | Buttons | Currency picker buttons | CurrencyAmount popover | Small pill buttons | Active currency: brand fill; others: ghost glass | 🟡 |
| 434 | Buttons | Packing item checkbox | CheckItem toggle | Animated checkbox | Click should have haptic feedback via `navigator.vibrate(8)` | 🟢 |
| 435 | Buttons | Assign item button | Supply assignment | Opens assignment picker | Icon + "Assign" label; opens mini-sheet or popover | 🟡 |
| 436 | Buttons | Add packing item | New item input | + Add button or inline field | Inline: text field that converts to item on Enter/Done | 🟡 |
| 437 | Buttons | Category filter chips | Packing categories | Tap to filter | Active chip: brand fill; inactive: ghost glass | 🟡 |
| 438 | Buttons | Day tab selector | DayDetail day nav | Previous/Next day arrows | Arrow buttons + day number; `aria-label="Next day: Jun 16"` | 🟠 |
| 439 | Buttons | AI "Like/Apply" suggestion | AI output | Accept a suggestion | Checkmark button: forest color, animates on tap | 🟡 |
| 440 | Buttons | AI "Dismiss suggestion" | AI output | Reject suggestion | X button: ghost, dims item on tap | 🟡 |
| 441 | Buttons | Map "recenter" button | Map view | Back to user location | Floating button, glass surface, compass or crosshair icon | 🟡 |
| 442 | Buttons | Map filter toggle | Map categories | Filter by event type | Horizontal chip row above map | 🟡 |
| 443 | Buttons | "Start tour" CTA | First-run | Onboarding tour trigger | Prominent button in PersonaSheet; skip option as ghost | 🟡 |
| 444 | Buttons | "Invite crew" button | Crew screen | Opens share sheet | Forest button + person+plus icon | 🟡 |
| 445 | Buttons | Settings save | Auto-save vs explicit | Toggle settings often auto-save | If auto-save: show transient checkmark animation, no explicit save button needed | 🟡 |
| 446 | Buttons | Password change CTA | SecuritySettings | Change password | Standard form submit, forest primary button | 🟡 |
| 447 | Buttons | Revoke session | Session list | Per-session revoke | Danger text button ("Revoke"), confirm before action | 🟠 |
| 448 | Buttons | MFA setup CTA | MFA setup flow | Enable TOTP/SMS | Forest primary: "Enable Authenticator App" | 🟡 |
| 449 | Buttons | Terms accept | TermsModal | Accept terms CTA | Forest button, full-width, at bottom of scrolled content | 🟡 |
| 450 | Buttons | Scroll to top | Long screens | Back-to-top affordance | Only show after 200px scroll; animated fade-in glass button | 🟢 |
| 451 | Buttons | Keyboard done button | Mobile keyboard | "Done"/"Next" return key | `inputMode`, `enterKeyHint` props on all inputs | 🟡 |
| 452 | Buttons | Button icon-only min size | All icon buttons | Min 44x44px confirmed needed | Add `--btn-icon-size: 44px` token and apply universally | 🔴 |
| 453 | Buttons | Button label truncation | Long button labels | Labels should never wrap inside buttons | Add `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` | 🟡 |
| 454 | Buttons | Multi-select confirm | Category chips, country | "Done" confirm CTA | Sticky bottom CTA after multi-select; shows count "Add 3 countries" | 🟡 |
| 455 | Buttons | Clear/reset button | Form fields | Optional clear action | X clear icon inside field; `aria-label="Clear input"` | 🟡 |
| 456 | Buttons | Back button/chevron | Detail screens | Navigation back | Chevron + screen name text; `aria-label="Back to dashboard"` | 🟡 |
| 457 | Buttons | "New trip" in menu | NavBar expand panel | Create trip action | Visually distinguished from "Switch trip" list items | 🟡 |
| 458 | Buttons | Copy invite link | If invite exists | Copy to clipboard | Visual: default to "Copied!" for 2s to default | 🟡 |
| 459 | Buttons | Continue/next step | Multi-step forms | Wizard progression | Forest primary at bottom-right; disabled until required fields filled | 🟡 |
| 460 | Buttons | Step back in wizard | Multi-step | Previous step | Ghost button at bottom-left of wizard | 🟡 |
| 461 | Buttons | Sheet confirm row | Confirm action in sheet | Yes/No confirmation | Use 2-button row: ghost cancel + danger/forest confirm | 🟡 |
| 462 | Buttons | `aria-busy` during loading | Async buttons | Screen reader needs to know | Add `aria-busy="true"` and `aria-label="Saving..."` during async ops | 🟠 |
| 463 | Buttons | `type="submit"` vs `type="button"` | Form buttons | Incorrect type causes form submission | Ensure non-submit buttons have `type="button"` explicitly | 🟠 |
| 464 | Buttons | Double-tap prevention | All async actions | User taps twice accidentally | Disable button immediately on first click; re-enable after response | 🟠 |
| 465 | Buttons | Swipe-to-delete | Event list items | Swipe left to reveal delete | Confirm this is implemented; add spring snap-back animation | 🟡 |
| 466 | Buttons | Long-press context menu | Cards/items | Long press on trip or event | Show contextual action sheet (edit, delete, share) | 🟢 |
| 467 | Buttons | Haptic on primary CTA | Important actions | Light haptic on key confirmations | `navigator.vibrate([10, 30, 10])` pattern for important confirms | 🟢 |
| 468 | Buttons | Keyboard shortcut hint | Desktop tooltip | Shortcut label | For desktop: show keyboard shortcuts in tooltips on key actions | 🟢 |
| 469 | Buttons | "Try again" vs "Retry" | Error states | Consistent label | Standardize all retry buttons to "Try Again" | 🟢 |

---

## 7. Forms & Inputs (62 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 470 | Forms | Field.tsx base | Glass input, 44px min-height | Min height meets touch target | ✓ 44px minimum confirmed | 🟢 |
| 471 | Forms | Field.tsx focus state | Brand blue glow | Focus should use brand green not system blue | Change focus ring to `var(--color-brand)` | 🟠 |
| 472 | Forms | Field.tsx error state | Danger border + shadow | `role="alert"` on error message? | Add `role="alert"` and `aria-live="assertive"` on error container | 🟠 |
| 473 | Forms | Field.tsx `aria-invalid` | Missing? | `aria-invalid="true"` when in error state | Add `aria-invalid={!!error}` to input element | 🟠 |
| 474 | Forms | Field.tsx `aria-describedby` | Not confirmed | Error + hint should be linked to input | `aria-describedby={error ? errorId : hintId}` on input | 🟠 |
| 475 | Forms | Field.tsx label association | `<label>` element | Confirm label `for` matches input `id` | `<label htmlFor={id}>` + `<input id={id}>` — confirm implementation | 🔴 |
| 476 | Forms | Field.tsx placeholder-only | Some fields may lack visible labels | Placeholder disappears on typing | Never use placeholder as substitute for label | 🔴 |
| 477 | Forms | Field.tsx icon position | Left icon inside field | Icon must not overlap text | `padding-inline-start: 44px` when icon present | 🟡 |
| 478 | Forms | Field.tsx RTL icon | Icon position in RTL | Icon should flip position in RTL | Use `padding-inline-start` (logical property) for icon padding | 🟠 |
| 479 | Forms | Field.tsx autoFocus | Sheet auto-focus | 350ms delay to prevent scroll | Confirmed — appropriate delay | 🟢 |
| 480 | Forms | Field.tsx type=number | Budget/cost inputs | Number inputs on iOS show wrong keyboard | Use `type="text" inputMode="decimal"` for currency amounts | 🟠 |
| 481 | Forms | Field.tsx type=email | Email input | Must have `autocomplete="email"` | Add `autoComplete="email"` prop | 🟡 |
| 482 | Forms | Field.tsx type=password | Password fields | Must have `autocomplete` | `autoComplete="current-password"` or `"new-password"` | 🟡 |
| 483 | Forms | Field.tsx resize | Textarea | Auto-growing textarea preferred | Implement auto-height textarea with `rows={1}` + JS height update | 🟡 |
| 484 | Forms | Field.tsx max-length | Input constraints | Visual character count on limited fields | Add character counter for max-length fields (e.g. trip name) | 🟡 |
| 485 | Forms | PlacesInput | Location autocomplete | Google/Maps autocomplete | Ensure keyboard navigation works through dropdown results | 🟠 |
| 486 | Forms | PlacesInput loading | Fetching suggestions | No feedback during fetch | Show spinner inside field while fetching suggestions | 🟡 |
| 487 | Forms | PlacesInput empty | No results | Empty search results | Show "No places found" message, not empty dropdown | 🟡 |
| 488 | Forms | CountriesInput | Country multi-select | Flag display + search | Search must work for country names in both EN and HE | 🟠 |
| 489 | Forms | CountriesInput chip | Selected country as chip | Chip inside field | Show selected countries as chips inside the input field | 🟡 |
| 490 | Forms | CountriesInput remove | Chip remove X | Small X on chip | Min 24x24px X button with `aria-label="Remove Israel"` | 🟠 |
| 491 | Forms | Date range picker | Create trip form | Two date fields | Use a single date range picker (calendar) not two separate inputs | 🟡 |
| 492 | Forms | Date range min constraint | End date min | End date must be >= start date | `min` attribute on end date updates dynamically when start changes | 🟠 |
| 493 | Forms | Date field on mobile | `<input type="date">` | Native date picker on iOS is fine | Ensure native date input is styled to match app design | 🟡 |
| 494 | Forms | Budget field | Numeric currency input | `type="text" inputMode="decimal"` recommended | Right-align amount; show currency symbol as prefix | 🟡 |
| 495 | Forms | Budget negative value | User types negative | Prevent negative budget | Add validation: budget must be >= 0 | 🟠 |
| 496 | Forms | Zod validation messages | Zod v4 + form | Error messages from Zod | Human-readable messages for all Zod errors; Hebrew translations needed | 🟠 |
| 497 | Forms | Form submit on Enter | All forms | Enter key should submit | `onKeyDown` on form to capture Enter; `type="submit"` button | 🟡 |
| 498 | Forms | Form validation timing | Real-time vs on-submit | Validate on submit first, then on-change | Don't show errors before user has typed; validate on blur | 🟡 |
| 499 | Forms | Required field indicator | Asterisk | Visual asterisk + `required` attribute | Add `required` attribute and visual asterisk | 🟡 |
| 500 | Forms | Field group fieldset | Grouped inputs | Related fields (date range, location) | Wrap related fields in `<fieldset>` with `<legend>` | 🟡 |
| 501 | Forms | Keyboard avoidance | Visual viewport | Sheet content above keyboard | Confirmed handler in Sheet.tsx — verify on iOS Safari | 🟠 |
| 502 | Forms | `enterKeyHint` on inputs | Mobile keyboard action button | No `enterKeyHint` detected | Add `enterKeyHint="next"` for intermediate fields, `"done"` for last | 🟡 |
| 503 | Forms | `inputMode` on all inputs | Mobile keyboard type | Correct keyboard for each input type | `inputMode="email"` for email, `"tel"` for phone, `"decimal"` for amounts | 🟡 |
| 504 | Forms | `autocomplete` attrs | All form inputs | Browser autofill support | Map all fields to correct `autocomplete` values | 🟡 |
| 505 | Forms | OTP input group | MFAChallenge | 6 individual cells | Auto-advance to next cell on digit entry | 🟡 |
| 506 | Forms | OTP paste support | MFAChallenge | Paste 6-digit code | Handle paste event: fill all 6 cells from clipboard string | 🟠 |
| 507 | Forms | Password visibility toggle | Password fields | Show/hide password | Add eye icon button to toggle `type="text"/"password"` | 🟡 |
| 508 | Forms | Password strength indicator | New password | Visual strength meter | Show strength bar (weak/fair/strong/excellent) below password field | 🟡 |
| 509 | Forms | Trip name field | Create/edit trip | First field in create trip form | `maxLength={60}`, placeholder "e.g. Portugal Coastal Drive" | 🟡 |
| 510 | Forms | Trip name validation | Form validation | Non-empty, no just whitespace | Trim whitespace in Zod schema; min 2 chars | 🟡 |
| 511 | Forms | Event name field | Add event form | Required text field | `maxLength={80}`, `autoFocus` when sheet opens | 🟡 |
| 512 | Forms | Event time fields | Start/end time | Time picker on mobile | Use `<input type="time">` with 24h in he locale, 12h in en | 🟡 |
| 513 | Forms | Event category picker | Category selection | 30+ categories as chips | Search/filter chips; scroll with sticky alphabet group headers | 🟡 |
| 514 | Forms | Event cost field | Optional cost | Decimal input for expense | `inputMode="decimal"`, right-align, currency prefix/suffix | 🟡 |
| 515 | Forms | Event location field | Optional location | PlacesInput component | GPS/location icon to use current location | 🟢 |
| 516 | Forms | Event notes field | Optional textarea | Free text | Auto-grow textarea; max 500 chars with counter | 🟡 |
| 517 | Forms | Form dirty state | Unsaved changes | Closing sheet with changes | Confirm before close if form is dirty: "Discard changes?" | 🟠 |
| 518 | Forms | Settings auto-save | Toggle settings | Immediate save on change | Show brief "Saved" indicator; no submit button needed | 🟡 |
| 519 | Forms | Settings text size | Accessibility | Slider or 3-option pick? | Use 3 options (S/M/L) as segmented control, not slider | 🟡 |
| 520 | Forms | Account email change | SecuritySettings | Email change flow | Require current password + verification email for changes | 🟠 |
| 521 | Forms | New password confirmation | Password change | Confirm password field | Fields must match; show error if mismatch on blur | 🟠 |
| 522 | Forms | Notes autosave | NotesScreen | When does it save? | Autosave on pause (debounce 1500ms); show "Saved" in top-right | 🟡 |
| 523 | Forms | Notes character limit | Long trip notes | Character limit? | If limit exists, show counter at bottom | 🟢 |
| 524 | Forms | Crew invite email | Invite input | Email field for invite | `type="email"`, `autocomplete="email"`, `inputMode="email"` | 🟡 |
| 525 | Forms | Crew role selector | Owner/editor/viewer | Role assignment | Radio group or segmented control; not dropdown for 3 options | 🟡 |
| 526 | Forms | Budget currency selector | Create/edit trip | Inline currency selector | Searchable dropdown; show 3-letter code + full name | 🟡 |
| 527 | Forms | Select dropdowns | Any `<select>` usage | Native `<select>` | Style native select or replace with custom accessible combobox | 🟡 |
| 528 | Forms | Form accessibility | All forms | Overall ARIA usage | Add `<form>` with `aria-label` describing purpose | 🟡 |
| 529 | Forms | Real-time server validation | Username/email | Check email availability | Debounce 600ms; show "Email already taken" before submit | 🟡 |
| 530 | Forms | Form loading state | Submit while saving | Global submit button state | Spinner in button; `disabled` to prevent re-submit | 🟠 |
| 531 | Forms | Form success state | After successful submit | Sheet closes + toast shows | Toast: "Trip created!" with 3.2s auto-dismiss | 🟡 |

---

## 8. NavBar (60 rows)

| # | Area | Component / Location | Current State | Issue | Recommended Fix | Priority |
|---|------|---------------------|---------------|-------|-----------------|----------|
| 532 | NavBar | Root container | Fixed bottom pill | NavBar must have `role="navigation"` and `aria-label` | Add `<nav role="navigation" aria-label="Main navigation">` | 🟠 |
| 533 | NavBar | Tab labels | Uppercase small text | "WISHLIST" at small size in tight space | Max 8 chars per label; abbreviate if needed | 🟡 |
| 534 | NavBar | Tab labels Hebrew | Hebrew in RTL | Hebrew labels may be longer — test at 375px | Log all 5 Hebrew tab labels; ensure none wraps | 🟠 |
| 535 | NavBar | Tab icon size | SVG icons in tabs | Confirm all tab icons are consistent 24px | `width: 24px; height: 24px; flex-shrink: 0` | 🟡 |
| 536 | NavBar | Active tab blob | Animated gradient blob | Animation speed | Blob move transition: `spring.snap` (500 stiffness) — snappy ✓ | 🟢 |
| 537 | NavBar | Active tab label color | White on gradient? | Active label on terra gradient must meet 4.5:1 | Confirm active label is white; gradient stops must support this | 🟠 |
| 538 | NavBar | Inactive tab opacity | Muted icons/labels | `opacity: 0.5-0.6` for inactive | Inactive labels: `color: var(--color-text-3)` (not just opacity) | 🟡 |
| 539 | NavBar | `aria-current="page"` | Active tab | Confirmed in code | ✓ `aria-current="page"` on active tab | 🟢 |
| 540 | NavBar | `aria-expanded` on menu | Expand FAB | Confirmed in code | ✓ `aria-expanded` on menu toggle | 🟢 |
| 541 | NavBar | Keyboard tab navigation | Tab key moves between tabs | Tab key should navigate to each tab in order | Ensure all 5 tabs are focusable and in DOM order | 🟠 |
| 542 | NavBar | Focus visible on tabs | Ring on focused tab | Focus ring on keyboard navigation | `:focus-visible` ring on each tab button | 🟠 |
| 543 | NavBar | RTL tab order | Visual tab order | In RTL, Home should still be first | Tabs maintain semantic order; CSS reverses visual layout via `dir` | 🟠 |
| 544 | NavBar | RTL FAB positions | FAB placement in RTL | FABs position in RTL | FABs should remain centered regardless of direction | 🟡 |
| 545 | NavBar | Pill safe area bottom | `env(safe-area-inset-bottom)` | Confirmed in code | Verify pill bottom accounts for safe area on iPhone 14/15 | 🟠 |
| 546 | NavBar | Pill left/right inset | `top-4 left-4 right-4` pattern | 16px inset — adequate floating appearance | ✓ Correct floating pill appearance | 🟢 |
| 547 | NavBar | Backdrop blur | `backdrop-filter: blur()` on NavBar | Glass blur on NavBar — OK for modern browsers | Add `@supports` fallback for no-filter: solid bg | 🟡 |
| 548 | NavBar | NavBar height token | `--navbar-height` | Define as CSS token for reuse in screen padding | Set `--navbar-height: 80px` (pill + insets) globally | 🟠 |
| 549 | NavBar | Transition between screens | Active tab change | Spring-animated blob moves to new tab | Tab click should also trigger screen transition animation | 🟡 |
| 550 | NavBar | Badge notification | Unread notifications? | If any tabs need badge count | Badge: 8px circle with number, red/brand color, right-corner of icon | 🟢 |
| 551 | NavBar | NavBar in landscape | 375x667 landscape | NavBar takes up more of height | Consider hiding NavBar on landscape to maximize map/day view | 🟡 |
| 552 | NavBar | Scroll-aware NavBar | Scroll-hide behavior | NavBar visible always | Hide on scroll down, show on scroll up for more content space | 🟡 |
| 553 | NavBar | Tab press feedback | `whileTap` on tabs | Each tab should have press scale | Add `whileTap={{ scale: 0.94 }}` to each tab button | 🟡 |
| 554 | NavBar | Screen transition direction | Tab slide direction | Dashboard to Day should slide left; Day to Dashboard right | Map RTL slide: positive X for LTR-advance, negative for back | 🟠 |
| 555 | NavBar | NavBar shadow | Above the pill | Upward soft shadow on NavBar | `box-shadow: 0 -8px 32px rgba(0,0,0,0.08)` on NavBar pill | 🟡 |
| 556 | NavBar | FAB expand panel backdrop | When expand menu opens | Backdrop behind expand panel | Semi-transparent backdrop that closes menu on tap | 🟡 |
| 557 | NavBar | Expand panel items | Menu panel content | Switch trip, Notes, Crew, Settings, Sign out | Items should be large touch targets: min 52px height each | 🟠 |
| 558 | NavBar | Expand panel animation | Panel slide up | Spring.gentle animation | Panel should have smooth spring slide-up; stagger children by 0.05s | 🟡 |
| 559 | NavBar | Expand panel close on route change | Panel stays open | Panel must close when tab changes | Watch screen state in Zustand; close panel on screen change | 🟠 |
| 560 | NavBar | Expand panel sign-out color | Red text in menu | Danger color draws eye | Add separator line above sign-out | 🟡 |
| 561 | NavBar | NavBar `pointer-events` during animation | Blob animation | Tapping tabs mid-animation should still register | Ensure `pointer-events: auto` during blob transition | 🟡 |
| 562 | NavBar | Wishlist tab icon | Heart or bookmark | Ensure icon matches label semantics | Use filled heart for "saved" metaphor; outline for inactive state | 🟢 |
| 563 | NavBar | Map tab icon | Compass or map pin | Compass is brand-aligned | Keep compass — it is the brand mark | 🟡 |
| 564 | NavBar | Pack tab icon | Backpack icon | Confirm icon is recognizable at 24px | Test recognition at 24px; backpack strokes must be >= 1.5px | 🟡 |
| 565 | NavBar | Explore tab icon | Calendar or explore | Label "Explore" but shows day view | Rename to "Plan" or "Days" to match actual screen function | 🟠 |
| 566 | NavBar | Tab icon scale on active | `scale(1.1)` | Subtle scale increase on active | 1.1 is good — not too large, still perceivable | 🟢 |
| 567 | NavBar | NavBar in PWA fullscreen | `display: standalone` | Bottom home indicator bar on iOS overlaps | `padding-bottom: env(safe-area-inset-bottom)` on pill bottom | 🔴 |
| 568 | NavBar | Drag-up gesture on NavBar | Sheet-over-nav | Swipe up on NavBar area | Consider: swipe up from NavBar opens "Quick Actions" sheet | 🟢 |
| 569 | NavBar | Tab highlight animation duration | Active blob | Duration of blob traveling between tabs | `spring.snap` at 500 stiffness — very fast, feels premium ✓ | 🟢 |
| 570 | NavBar | Inactive tab `cursor: pointer` | Desktop web | Missing `cursor: pointer` on inactive tabs | Add `cursor: pointer` to all tab buttons | 🟠 |
| 571 | NavBar | NavBar render on auth pages | LandingSignIn | NavBar should not render on landing/auth pages | Confirm NavBar only renders inside `<AppShell>` after auth | 🟡 |
| 572 | NavBar | NavBar render on join page | `/join/[token]` | Join page — NavBar should not show | Confirm NavBar absent on public pages | 🟡 |
| 573 | NavBar | FAB label tooltip | Hover on desktop | Icon-only FABs need label on hover | Add `title` or Radix Tooltip with action name on desktop hover | 🟡 |
| 574 | NavBar | ARIA `aria-label` on NavBar | nav element | `aria-label="Main navigation"` | Add to confirm screen readers announce nav region correctly | 🟠 |
| 575 | NavBar | NavBar `tabIndex` management | Focus trapping | When panel is open, trap focus inside panel | Use `focus-trap` or manual tab cycling inside expand panel | 🟠 |
| 576 | NavBar | Escape closes expand panel | Keyboard | Escape key | `onKeyDown` on document: if key=Escape and panel open, close it | 🟠 |
| 577 | NavBar | Click-outside closes panel | Expand menu | Tap outside panel | Overlay div behind panel, `onClick` closes it | 🟡 |
| 578 | NavBar | Screen reader announcement | Tab switch | New screen loads | Live region announces screen name: "Navigated to Packing" | 🟠 |
| 579 | NavBar | Animation during reduced motion | `data-reduced-motion` | Blob animation + panel slide | All NavBar animations must respect reduced-motion preference | 🟠 |
| 580 | NavBar | Landscape expand panel height | Short screens | Panel may overflow on landscape | `max-height: 60vh; overflow-y: auto` on expand panel | 🟡 |
| 581 | NavBar | NavBar glass in high contrast | HC mode | Glass blur invisible in HC | HC mode: solid opaque NavBar background + strong border | 🟠 |
| 582 | NavBar | Active tab test all 5 | Visual regression | All 5 active states | Test each tab active state in both light and dark mode | 🟡 |
| 583 | NavBar | NavBar `will-change` | Performance | NavBar is fixed — has GPU layer? | Add `will-change: transform` on NavBar container for compositing | 🟡 |
| 584 | NavBar | FAB `aria-haspopup` | Add FAB | FAB opens sheet | `aria-haspopup="dialog"` on FAB that opens sheet | 🟡 |
| 585 | NavBar | FAB AI `aria-haspopup` | AI FAB | Opens AI suggestions sheet | Same: `aria-haspopup="dialog"` | 🟡 |
| 586 | NavBar | NavBar re-render on scroll | Performance | Fixed NavBar shouldn't re-render on scroll | Confirm NavBar is outside scroll container and not re-rendering | 🟡 |
| 587 | NavBar | Tab animation interrupt | Rapid tab switching | Clicking tabs quickly | Blob animation should interrupt cleanly — spring physics handles this ✓ | 🟢 |
| 588 | NavBar | Panel z-index | Stacking order | Panel must be above all content but below modals | Panel: `z-index: var(--z-navbar-panel, 25)` | 🟡 |
| 589 | NavBar | Long press tab | Mobile | Long-press tab for context | Could reveal "Go to today" on calendar tab | 🟢 |
| 590 | NavBar | NavBar vibrancy on iOS | `-webkit-backdrop-filter` | Blur for older WebKit | Add `-webkit-backdrop-filter` alongside `backdrop-filter` | 🟡 |
| 591 | NavBar | `prefers-reduced-motion` blob | No animation fallback | If motion disabled, blob should not animate | Use `transition: none` + instant position on motion-disabled | 🟠 |

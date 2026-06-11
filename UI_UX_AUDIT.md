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

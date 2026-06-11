sections = """
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
"""

with open('c:/Users/guy9d/Desktop/Trippy/UI_UX_AUDIT.md', 'a', encoding='utf-8') as f:
    f.write(sections)
print("Done")

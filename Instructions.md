# Trippy — Full Code Audit Fix Plan
# Give this file to Claude Code and say: "Execute this plan top to bottom, one phase at a time."
# Each phase is fully atomic — stopping after any phase leaves the app working.

---

## PHASE 1 — Security (5 min, zero risk)
**Stop here = safe ✅**

```
Run: npm audit fix
Then run: npm audit
Report what was fixed and what remains.
Do NOT use --force.
```

---

## PHASE 2 — CSS Token Scale for font sizes (no visual breakage, pure refactor)
**Stop here = safe ✅**

```
In app/globals.css, add this token block under the existing type scale tokens:

  --t-2xs: 0.625rem;   /* 10px */
  --t-xs:  0.6875rem;  /* 11px */
  --t-sm:  0.75rem;    /* 12px */
  --t-md:  0.8125rem;  /* 13px */
  --t-base: 0.875rem;  /* 14px */
  --t-lg:  0.9375rem;  /* 15px */
  --t-body: 1rem;      /* 16px — iOS safe minimum */

Do NOT replace usages yet — just add the tokens. Commit.
```

---

## PHASE 3 — Z-index scale (no visual change, just organization)
**Stop here = safe ✅**

```
In app/globals.css, add a z-index scale under the token section:

  --z-base:    1;
  --z-above:   20;
  --z-overlay: 80;
  --z-modal:   200;
  --z-toast:   1000;
  --z-top:     9999;

Then find-and-replace all hardcoded zIndex values in app/ tsx files:
  zIndex: 1      → zIndex: 'var(--z-base)'
  zIndex: 20     → zIndex: 'var(--z-above)'
  zIndex: 80     → zIndex: 'var(--z-overlay)'
  zIndex: 200    → zIndex: 'var(--z-modal)'
  zIndex: 1000   → zIndex: 'var(--z-toast)'
  zIndex: 9000, 9002, 9990, 9999, 99999 → zIndex: 'var(--z-top)'

After: grep -rn "zIndex:" app/ to verify no raw numbers remain.
```

---

## PHASE 4 — Animation duration tokens (no visual change)
**Stop here = safe ✅**

```
In app/globals.css add:

  --dur-fast:   0.15s;
  --dur-base:   0.25s;
  --dur-slow:   0.4s;
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);

Then in all .tsx files replace inline transition strings:
  'all .15s'        → 'all var(--dur-fast)'
  'all .18s'        → 'all var(--dur-fast)'
  'all .2s'         → 'all var(--dur-base)'
  'all .22s'        → 'all var(--dur-base)'
  'all .25s'        → 'all var(--dur-base)'
  'all .3s'         → 'all var(--dur-slow)'
  'all .4s'         → 'all var(--dur-slow)'
  'opacity 0.15s'   → 'opacity var(--dur-fast)'
  'opacity 0.25s'   → 'opacity var(--dur-base)'
  'color 0.2s ease' → 'color var(--dur-base)'
  'box-shadow .2s'  → 'box-shadow var(--dur-base)'
```

---

## PHASE 5 — Button base transition (tiny CSS, big feel improvement)
**Stop here = safe ✅**

```
In app/globals.css, find the button base styles and add:

button {
  transition: opacity var(--dur-fast), background var(--dur-fast), 
              box-shadow var(--dur-fast), transform var(--dur-fast);
  cursor: pointer;
}

button:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  button:hover {
    opacity: 0.88;
  }
}

Do NOT add this to buttons that already have explicit hover styles.
```

---

## PHASE 6 — Desktop: AppShell max-width (1 line fix, huge desktop improvement)
**Stop here = safe ✅**

```
In app/components/AppShell.tsx, find the outermost app container div 
(className="fixed inset-0 flex flex-col overflow-hidden").

Wrap the <main> content area with a centered container:
  maxWidth: 1440px, 
  margin: '0 auto', 
  width: '100%', 
  height: '100%', 
  position: 'relative'

The NavBar_V2 stays fixed — only the content area gets constrained.
Test at 1920px width to confirm.
```

---

## PHASE 7 — Desktop: Nav tooltip labels (hover labels on sidebar icons)
**Stop here = safe ✅**

```
In app/components/NavBar_V2.tsx, on each tab button add a tooltip on hover.
Only show on desktop (pointer: fine):

For each tab icon button, add:
  title={tab.label}  (native browser tooltip — zero code, instant fix)

Then add a custom CSS tooltip for better styling in globals.css:
@media (hover: hover) and (pointer: fine) {
  [data-nav-tip]:hover::after {
    content: attr(data-nav-tip);
    position: absolute;
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    background: var(--text);
    color: var(--text-inv);
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    z-index: var(--z-top);
  }
}

Add data-nav-tip={tab.label} to each nav button.
```

---

## PHASE 8 — Mobile: Scroll snap on horizontal carousels
**Stop here = safe ✅**

```
In app/components/screens/DayDetail_V2.tsx, find these 3 scroll containers:
  line ~462: { display: 'flex', gap: 8, overflowX: 'auto' }
  line ~605: { display: 'flex', gap: 6, overflowX: 'auto' }
  line ~746: { display: 'flex', gap: 6, overflowX: 'auto' }

Add to each container:
  scrollSnapType: 'x mandatory',
  WebkitOverflowScrolling: 'touch',
  paddingBottom: 4,

Add to each CHILD item inside those containers:
  scrollSnapAlign: 'start',
  flexShrink: 0,

Also in Map_V2.tsx line ~192: same treatment for the filter chips row.
```

---

## PHASE 9 — Mobile: Safe-area consistency
**Stop here = safe ✅**

```
In app/components/Sheets_V2.tsx, find all instances of:
  marginBottom: 10, paddingBottom: 10

Replace with:
  paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))'

Search for any other raw paddingBottom/marginBottom values that appear 
at the bottom of scrollable content and apply the same env() pattern.
```

---

## PHASE 10 — Desktop: Expand 2-column grid to more screens
**Stop here = safe ✅**

```
In app/globals.css, the .resp-dash-grid already exists with @media (min-width: 1024px).
Add a new utility class:

.resp-two-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
@media (min-width: 1024px) {
  .resp-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }
}

Then in these screens, wrap the main content sections with className="resp-two-col":
  - app/components/screens/Packing_V2.tsx (split list + stats)
  - app/components/screens/Settings_V2.tsx (split sections)

Do NOT touch DayDetail_V2 or Map_V2 yet — they need deeper redesign.
```

---

## PHASE 11 — Fix: Components defined inside render (critical React bug)
**Stop here = safe ✅**

```
In Trippy_Full_Design_V2/trippy-loaders-and-motions/project/loaders.jsx:

Find the RouteLoader function. Inside it, there is:
  const Pin = ({ x, y, color, delay }) => ( ... )

Move the Pin component OUTSIDE of RouteLoader — make it a top-level function:
  function Pin({ x, y, color, delay }) { ... }

Then RouteLoader can still use <Pin /> normally.
This prevents state reset on every render.
```

---

## PHASE 12 — Fix: Refs accessed during render
**Stop here = safe ✅**

```
In Trippy_Full_Design_V2/trippy-loaders-and-motions/project/tweaks-panel.jsx line ~271:

PROBLEM:
  style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}

FIX: Add a state mirror for the offset:
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // update offset in the drag handler: setOffset({ x: ..., y: ... })
  // keep offsetRef for the drag math (avoids stale closure)

Then use offset (state) in JSX, not offsetRef.current.
```

---

## PHASE 13 — TypeScript: Remove `any` from critical paths (incremental)
**Stop here = safe ✅**

```
Run: npx tsc --noEmit 2>&1 | head -50
Then fix the top 10 'any' usages only (do not attempt all 58 at once).
Focus on:
  - API response types in lib/ 
  - Props in app/components/ui/*.tsx

For each, replace `any` with a proper type or at minimum `unknown`.
Commit after each file.
```

---

## PHASE 14 — Accessibility: aria-labels on icon-only buttons
**Stop here = safe ✅**

```
Find all <button> elements in app/ that contain ONLY an <Icon> child 
(no visible text). Add aria-label to each:

Examples:
  Close buttons    → aria-label="Close"
  Back buttons     → aria-label="Go back"  
  Add buttons      → aria-label="Add item"
  Delete buttons   → aria-label="Delete"
  Settings buttons → aria-label="Open settings"

Run: grep -n "<button" app/components/ui/Sheet.tsx 
and check each one.

Priority files: Sheet.tsx, NavBar_V2.tsx, Sheets_V2.tsx
```

---

## PHASE 15 — Performance: React.memo on heavy screens
**Stop here = safe ✅**

```
Wrap the default export of these components with React.memo():

  app/components/screens/Dashboard_V2.tsx  (1487 lines)
  app/components/screens/DayDetail_V2.tsx  (1376 lines)
  app/components/screens/Packing_V2.tsx    (939 lines)

Pattern:
  // Before:
  export default function Dashboard_V2(props) { ... }
  
  // After:
  function Dashboard_V2(props) { ... }
  export default React.memo(Dashboard_V2);

Also add React.memo to all components in app/components/ui/ that 
accept simple props.
```

---

## DO NOT DO (skip for now — requires full redesign):
- Converting bottom sheets to side panels on desktop (Phase 8 in audit — needs design decisions)
- Replacing all 387 hardcoded colors (risk of visual regression — needs design review)
- Adding keyboard shortcuts system
- Pull-to-refresh (needs library choice decision)
- Swipe navigation between screens (needs animation library decision)
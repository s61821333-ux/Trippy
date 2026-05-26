# TRIPPY V2 — DESIGN CREW

> **Owner:** Design System, Motion, Native Feel  
> **Branch:** `v2/design`  
> **Reads:** `00_GLOBAL.md` first

---

## 1. DESIGN PHILOSOPHY

**"Desert Glass"** — Trippy's design language combines the warmth of desert sand with the transparency of glass. Every surface feels warm, physical, and alive. Motion has weight. Glass has depth. Colors come from the earth.

The aesthetic is: **warm material design meets iOS 26 Liquid Glass meets desert sunset**.

---

## 2. 2026 DESIGN TRENDS — APPLIED TO TRIPPY

### 2.1 iOS 26 Liquid Glass

Apple's iOS 26 introduced Liquid Glass: translucent materials that blur, tint, and respond to content behind them. Unlike flat glassmorphism, Liquid Glass has:
- **Depth tinting:** the glass itself picks up color from content behind it
- **Specular highlights:** a subtle white rim at the top of glass panels
- **Adaptive opacity:** glass darkens/lightens based on background luminosity

**Trippy implementation:**

```css
/* globals.css — Liquid Glass surface tokens */
:root {
  --surface: oklch(97% 0.01 80 / 0.72);          /* warm white glass */
  --surface-strong: oklch(95% 0.015 80 / 0.88);  /* overlay glass */
  --nav-surface: oklch(96% 0.01 80 / 0.92);      /* nav chrome */

  /* Specular highlight — top rim of glass panels */
  --glass-rim: linear-gradient(
    180deg,
    oklch(100% 0 0 / 0.18) 0%,
    oklch(100% 0 0 / 0) 40%
  );

  /* Depth blur */
  --glass-blur: blur(20px) saturate(1.8);
}

[data-dark="true"] {
  --surface: oklch(18% 0.02 80 / 0.72);
  --surface-strong: oklch(15% 0.025 80 / 0.88);
  --nav-surface: oklch(16% 0.02 80 / 0.92);
}
```

**Glass panel component:**
```css
.glass-panel {
  background: var(--surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid oklch(100% 0 0 / 0.12);
  border-top-color: oklch(100% 0 0 / 0.24);  /* specular rim */
  border-radius: var(--radius-2);
  box-shadow:
    0 1px 0 oklch(100% 0 0 / 0.1) inset,  /* top highlight */
    0 8px 32px oklch(0% 0 0 / 0.08);       /* ambient shadow */
}
```

---

### 2.2 Warm Desert Color System

```css
/* globals.css — Color Token System */
:root {
  /* Primary palette — Desert terrain */
  --terra:        oklch(58% 0.16 42);   /* warm terracotta */
  --sand:         oklch(88% 0.06 80);   /* pale desert sand */
  --dusk:         oklch(48% 0.12 260);  /* twilight violet */
  --oasis:        oklch(62% 0.18 165);  /* desert oasis green */
  --ember:        oklch(68% 0.22 48);   /* sunset ember */

  /* Background system */
  --bg-paper:     oklch(96% 0.02 80);   /* aged paper */
  --bg-warm:      oklch(93% 0.03 70);   /* warm parchment */

  /* Text */
  --text-1:       oklch(22% 0.04 60);   /* primary ink */
  --text-2:       oklch(45% 0.05 60);   /* secondary ink */
  --text-3:       oklch(62% 0.04 60);   /* tertiary / hints */
  --text-inverse: oklch(97% 0.01 80);   /* text on dark */

  /* Semantic */
  --success:      oklch(56% 0.16 165);
  --warning:      oklch(72% 0.18 80);
  --danger:       oklch(52% 0.22 20);
  --info:         oklch(58% 0.14 230);

  /* Borders */
  --border:       oklch(85% 0.04 70);
  --border-strong: oklch(72% 0.06 70);
}
```

**Dark mode palette:**
```css
[data-dark="true"] {
  --bg-paper:     oklch(14% 0.03 260);
  --bg-warm:      oklch(16% 0.025 260);
  --text-1:       oklch(92% 0.02 80);
  --text-2:       oklch(72% 0.03 80);
  --text-3:       oklch(52% 0.03 80);
  --border:       oklch(28% 0.04 260);
  --border-strong: oklch(36% 0.05 260);
}
```

---

### 2.3 Typography Scale

```css
:root {
  /* Scale — Major Third (1.25) */
  --text-xs:   0.64rem;   /* 10.2px — labels, badges */
  --text-sm:   0.8rem;    /* 12.8px — captions, meta */
  --text-base: 1rem;      /* 16px — body */
  --text-md:   1.25rem;   /* 20px — subheadings */
  --text-lg:   1.563rem;  /* 25px — headings */
  --text-xl:   1.953rem;  /* 31.25px — hero */
  --text-2xl:  2.441rem;  /* 39px — display */

  /* Line heights */
  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Font weights */
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
}
```

---

## 3. SPACE & RADIUS TOKENS

```css
:root {
  /* Space scale — 4px base */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-1: 8px;   /* inputs, small chips */
  --radius-2: 14px;  /* cards, buttons */
  --radius-3: 20px;  /* sheets, large panels */
  --radius-4: 28px;  /* modals, full screens */
  --radius-full: 9999px;  /* pills, avatars */
}
```

---

## 4. MOTION SYSTEM (`lib/motion.ts`)

All animation values must come from this file. No inline spring values in components.

```typescript
// lib/motion.ts
import type { Transition } from 'framer-motion';

export const spring = {
  // Snappy UI response (nav pills, switches)
  snap: {
    type: 'spring',
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  } satisfies Transition,

  // Default interaction (cards, buttons)
  default: {
    type: 'spring',
    stiffness: 320,
    damping: 28,
    mass: 1,
  } satisfies Transition,

  // Gentle entrance (sheets, overlays)
  gentle: {
    type: 'spring',
    stiffness: 220,
    damping: 26,
    mass: 1.2,
  } satisfies Transition,

  // Float (decorative, ambient)
  float: {
    type: 'spring',
    stiffness: 120,
    damping: 22,
    mass: 1.5,
  } satisfies Transition,

  // Instant (reduced motion fallback)
  instant: {
    duration: 0.01,
  } satisfies Transition,
} as const;

export const duration = {
  instant: 0.01,
  fast:    0.12,
  normal:  0.22,
  slow:    0.38,
  crawl:   0.6,
} as const;

export const stagger = {
  fast:   0.04,
  normal: 0.06,
  slow:   0.1,
} as const;

// Slide variants — direction-aware for RTL
export const slideVariants = (isRTL = false) => ({
  enter: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? (isRTL ? -40 : 40) : (isRTL ? 40 : -40),
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? (isRTL ? 40 : -40) : (isRTL ? -40 : 40),
    opacity: 0,
  }),
});

// Sheet variants
export const sheetVariants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit:    { y: '100%', opacity: 0 },
};

// Fade variants
export const fadeVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

// Scale variants (for modals, popovers)
export const scaleVariants = {
  hidden:  { scale: 0.92, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit:    { scale: 0.96, opacity: 0 },
};
```

---

## 5. NATIVE APP FEEL

### 5.1 Touch Interaction Rules

Every interactive element must feel instantaneous. iOS Safari adds 300ms tap delay — eliminate it:

```css
/* globals.css */
* {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

button, [role="button"], a, [tabindex] {
  user-select: none;
  cursor: pointer;
}

/* Prevent text selection on UI chrome */
nav, [data-no-select] {
  user-select: none;
  -webkit-user-select: none;
}
```

### 5.2 Swipe Gesture System (`lib/gestures.ts`)

```typescript
// lib/gestures.ts
import { useEffect, useRef } from 'react';

interface SwipeConfig {
  onSwipeLeft?:  () => void;
  onSwipeRight?: () => void;
  onSwipeDown?:  () => void;
  threshold?:    number;  // px
  velocityMin?:  number;  // px/ms
}

export function useSwipe(ref: React.RefObject<HTMLElement>, config: SwipeConfig) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startT = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startT.current = Date.now();
    };

    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      const dt = Date.now() - startT.current;
      const velocity = Math.abs(dx) / dt;

      const threshold = config.threshold ?? 50;
      const velocityMin = config.velocityMin ?? 0.3;

      // Guard: if vertical movement dominates, it's a scroll — ignore
      if (Math.abs(dy) > Math.abs(dx) * 0.8) return;

      if (dx < -threshold && velocity > velocityMin) config.onSwipeLeft?.();
      if (dx > threshold && velocity > velocityMin) config.onSwipeRight?.();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [config]);
}
```

**Usage — day navigation via swipe:**
```typescript
// In DayScreen:
const containerRef = useRef<HTMLDivElement>(null);
const { isRTL } = useLocale();

useSwipe(containerRef, {
  onSwipeLeft:  () => isRTL ? goToPreviousDay() : goToNextDay(),
  onSwipeRight: () => isRTL ? goToNextDay() : goToPreviousDay(),
});
```

### 5.3 Scroll Behavior

```css
/* Every scrollable container */
.scroll-container {
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Hide scrollbar on mobile, style on desktop */
@media (pointer: coarse) {
  .scroll-container::-webkit-scrollbar { display: none; }
  .scroll-container { scrollbar-width: none; }
}
@media (pointer: fine) {
  .scroll-container::-webkit-scrollbar { width: 4px; }
  .scroll-container::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: var(--radius-full);
  }
}
```

### 5.4 Haptic Feedback (`lib/haptics.ts`)

```typescript
// lib/haptics.ts
type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<HapticPattern, number[]> = {
  light:   [10],
  medium:  [20],
  heavy:   [40],
  success: [10, 50, 10],
  warning: [30, 20, 30],
  error:   [50, 30, 50, 30, 50],
};

export function haptic(type: HapticPattern = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(patterns[type]);
  }
}
```

**Usage:**
```typescript
// On event delete
haptic('warning');

// On trip creation success
haptic('success');

// On button tap
haptic('light');
```

---

## 6. FLOATING TAB BAR REDESIGN

The current tab bar is a flat strip at the bottom. V2 upgrades it to a **floating glass pill** that floats above the content:

```
┌─────────────────────────────────────────────┐
│                  Screen Content              │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  🧭  📅  🧳  👥     ← floating bar  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                  ↑ 16px from bottom safe area
```

```css
/* NavBar.module.css */
.floatingBar {
  position: fixed;
  inset-inline: var(--space-4);
  bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  
  background: var(--nav-surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border);
  border-top-color: oklch(100% 0 0 / 0.2);
  border-radius: var(--radius-full);
  
  padding: var(--space-2) var(--space-3);
  
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: var(--space-2);
  
  box-shadow:
    0 1px 0 oklch(100% 0 0 / 0.12) inset,
    0 8px 32px oklch(0% 0 0 / 0.12),
    0 2px 8px oklch(0% 0 0 / 0.08);

  z-index: 100;
}
```

---

## 7. COMPONENT REDESIGNS

### 7.1 Event Card

```
┌─────────────────────────────────────────────┐
│  [09:00]   Colosseum Tour          2h 30m   │
│            Via Sacra, Rome      🏛️           │
│  ══════════════════════════  ↑↓ 👍3 👎1      │
└─────────────────────────────────────────────┘
```

- Left: time in monospace font (`var(--font-mono)`)
- Category icon, color-coded dot
- Duration chip (right)
- Inline vote counts with micro-animations on tap
- Swipe left → delete (with red background reveal)
- Swipe right → edit

### 7.2 Day Strip (horizontal day selector)

```
  Day 1   [Day 2]  Day 3   Day 4
  Rome    Paris    Paris   Berlin
```

- Active day: pill with `var(--terra)` background, springs to new position
- Weather icon under each day (tiny 16px sun/rain/cloud)
- Tap to switch day; swipe to scroll the strip
- `aria-current="page"` on active day

### 7.3 Hero Card (Dashboard)

```
┌─────────────────────────────────────────────┐
│  🇮🇹 Italy & France                         │
│  Jun 12 → Jun 20  ·  T-14 days              │
│                                              │
│  [○] Guy  [○] Sarah  [○] +2                 │
│                                              │
│  Next: Colosseum Tour at 09:00 tomorrow      │
└─────────────────────────────────────────────┘
```

- Glass panel, full-width
- Countdown badge with spring animation on first render
- Participant avatars: colored circles with initials
- Next event preview with category icon

### 7.4 Sheet Component

All sheets must have:
```typescript
// ui/Sheet.tsx — required attributes
<motion.div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  // Focus trap via useFocusTrap hook
  // Dismiss on Escape key
  // Dismiss on backdrop tap (when isDismissable)
>
```

Sheets slide up from bottom (60% → 90% height based on content) with a drag handle:
```
        ╔══════════════════╗
        ║  ┄┄┄┄┄┄ drag ┄┄ ║   ← drag handle indicator
        ║                  ║
        ║  [Sheet Content] ║
        ║                  ║
        ╚══════════════════╝
```

### 7.5 Add Event Button

```
             ┌──────┐
             │  +   │   ← Floating action button
             └──────┘
                ↑ 72px above tab bar
```

- `var(--terra)` background
- Spring scale animation on press: `scale: [1, 0.9, 1.05, 1]`
- Haptic on tap
- Rotates 45° when sheet is open (turns into × )

---

## 8. DARK MODE IMPLEMENTATION

Every component must respond to `[data-dark="true"]` on `<html>`. The toggle sets this attribute:

```typescript
// In store or AppShell
useEffect(() => {
  document.documentElement.setAttribute('data-dark', themeMode === 'dark' ? 'true' : 'false');
}, [themeMode]);
```

**Dark mode test checklist (required before every PR):**
- [ ] All text is readable (min 4.5:1 contrast)
- [ ] No hardcoded `#F4EFE8` or `white` values
- [ ] Glass panels use `--surface` token (auto-adjusts)
- [ ] Loading overlay uses `var(--bg-paper)` not `#F4EFE8`
- [ ] Icon colors use `--text-2` or `--text-3` tokens

---

## 9. ACCESSIBILITY — VISUAL

### Focus Indicators

```css
/* globals.css */
:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 2px;
  border-radius: var(--radius-1);
}

:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced Motion

```typescript
// In AppShell — wrap entire app
import { MotionConfig } from 'framer-motion';

<MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
  {children}
</MotionConfig>
```

When `reducedMotion = true`, all Framer Motion animations collapse to instant transitions automatically.

---

## 10. SKELETON LOADING STATES

Every screen that fetches data must show a skeleton, not a blank flash:

```typescript
// ui/Skeleton.tsx
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.card}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={styles.line}
          style={{ width: `${70 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}
```

```css
/* Shimmer animation */
.line {
  height: 14px;
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    var(--border-strong) 50%,
    var(--border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-1);
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .line { animation: none; background: var(--border); }
}
```

---

## 11. SCROLL SNAP FOR DAY NAVIGATION

The day view screens use scroll snap so swiping between days feels native:

```css
/* DayScreen container */
.daysContainer {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.dayPanel {
  scroll-snap-align: start;
  flex: 0 0 100%;
  height: 100%;
}
```

This combines with the `useSwipe` hook to give both CSS-native snapping and programmatic day switching via the day strip.

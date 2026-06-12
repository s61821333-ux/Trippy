// tokens/design-system.ts
// DOCUMENTED SOURCE OF TRUTH for the palette + motion language.
// NOTE: runtime colors live as CSS custom properties in app/globals.css :root
// (e.g. --brand, --terra, --sand); the --lg-* "liquid glass" tokens are now
// aliases of those, so there is ONE palette. Keep the values below in sync with
// globals.css. Brand: warm paper + forest green + terracotta + sand gold.
// Vivid pass (2026): chroma lifted for life; glass saturate raised to ~1.8.

export const tokens = {

  // ─── COLORS (oklch — perceptually uniform, wide-gamut P3-ready) ───────────
  colors: {
    // Forest green — primary brand (vivid: chroma lifted, hue 152)
    brand: {
      50:  'oklch(97% 0.020 152)',
      100: 'oklch(93% 0.044 152)',
      200: 'oklch(86% 0.078 152)',
      300: 'oklch(76% 0.105 152)',
      400: 'oklch(62% 0.130 152)',
      500: 'oklch(52% 0.158 152)',   // --primary-container
      600: 'oklch(45% 0.150 152)',   // --brand CSS var
      700: 'oklch(38% 0.138 152)',   // --brand-hover
      800: 'oklch(30% 0.090 158)',   // --brand-deep
      900: 'oklch(18% 0.040 158)',
    },

    // Terracotta — CTA / accent (vivid: hotter, hue 38)
    accent: {
      50:  'oklch(97% 0.014 38)',
      100: 'oklch(92% 0.042 38)',
      300: 'oklch(78% 0.110 38)',
      500: 'oklch(63% 0.170 38)',    // --terra
      600: 'oklch(57% 0.162 38)',    // --terra-hover
      700: 'oklch(48% 0.128 38)',    // --terra-text / --terra-btn (text-safe)
    },

    // Sand gold — secondary accent (vivid)
    sand: {
      300: 'oklch(82% 0.100 73)',
      500: 'oklch(72% 0.162 73)',    // --sand
      600: 'oklch(60% 0.120 73)',
    },

    // Warm paper surfaces (light mode)
    surface: {
      base:      'oklch(98% 0.010 75)',   // bg paper
      warm:      'oklch(96% 0.012 75)',   // bg warm
      alt:       'oklch(94% 0.014 75)',   // bg alt
      container: 'oklch(92% 0.016 75)',   // contained surface
    },

    // Glass surfaces (with alpha — use in backdrop-filter contexts)
    glass: {
      base:      'oklch(99% 0.004 80 / 52%)',
      float:     'oklch(99% 0.004 80 / 72%)',
      strong:    'oklch(99% 0.004 80 / 88%)',
      dark:      'oklch(14% 0.018 55 / 78%)',
      darkFloat: 'oklch(10% 0.014 55 / 90%)',
    },

    // Text
    text: {
      primary:   'oklch(13% 0.012 55)',   // ink
      secondary: 'oklch(40% 0.020 55)',   // text-2
      muted:     'oklch(60% 0.014 55)',   // text-3
      inverse:   'oklch(98% 0.002 80)',
    },

    // Borders
    border: {
      subtle: 'oklch(89% 0.010 75)',
      strong: 'oklch(80% 0.014 75)',
    },

    // Semantic
    success: 'oklch(50% 0.090 155)',
    warning: 'oklch(55% 0.110 68)',
    danger:  'oklch(48% 0.130 25)',
  },

  // ─── TYPOGRAPHY — 2027 variable font stack ──────────────────────────────
  // 2026 redesign: bold DM Sans (700/800) carries hero moments via the
  // .text-display* classes in globals.css; Instrument Serif is now reserved for
  // the `Trippy.` wordmark + editorial captions only. Hebrew uses Assistant
  // (the live `--font-friendly`/`--font-hebrew` value), not Noto Sans Hebrew.
  typography: {
    // DM Sans Variable (body + bold display) + Instrument Serif (wordmark/editorial)
    body:    '"DM Sans Variable", "DM Sans", -apple-system, system-ui, sans-serif',
    display: '"DM Sans Variable", "DM Sans", system-ui, sans-serif', // bold 700/800 heroes
    editorial: '"Instrument Serif", Georgia, serif', // wordmark + editorial captions only
    serif:   '"Instrument Serif", Georgia, serif',
    mono:    '"JetBrains Mono", ui-monospace, monospace',
    hebrew:  '"Assistant", "DM Sans", sans-serif',

    // clamp() fluid scale — micro → display
    sizes: {
      micro:   'clamp(0.68rem,  1vw,    0.6875rem)',
      xs:      'clamp(0.76rem,  1.1vw,  0.8125rem)',
      sm:      'clamp(0.86rem,  1.3vw,  0.9375rem)',
      base:    'clamp(0.95rem,  1.5vw,  1rem)',
      md:      'clamp(1.1rem,   1.8vw,  1.25rem)',
      lg:      'clamp(1.3rem,   2.2vw,  1.563rem)',
      xl:      'clamp(1.6rem,   3vw,    1.953rem)',
      '2xl':   'clamp(2rem,     4vw,    2.441rem)',
      display: 'clamp(2rem,     5vw,    3.2rem)',
    },

    tracking: {
      tight:  '-0.04em',
      snug:   '-0.02em',
      normal: '-0.01em',
      mono:   '0.12em',
      wide:   '0.20em',
    },

    leading: {
      tight:   '1.05',
      normal:  '1.5',
      relaxed: '1.75',
    },
  },

  // ─── SPACING (4px base grid) ─────────────────────────────────────────────
  spacing: {
    '1':  '4px',
    '2':  '8px',
    '3':  '12px',
    '4':  '16px',
    '5':  '20px',
    '6':  '24px',
    '8':  '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
  },

  // ─── BORDER RADIUS (Jelly Glass — organic curves, min 16px) ─────────────
  radius: {
    xs:   '10px',
    sm:   '16px',
    md:   '20px',
    lg:   '24px',
    xl:   '32px',
    '2xl':'40px',
    screen: '48px', // device frame (2026 redesign)
    full: '9999px',
  },

  // ─── 2026 redesign — paper pill on dark canvas + onboarding canvas ───────
  redesign: {
    paperPillBg:   '#F7F3EC',
    paperPillText: '#1C1713',
    canvas:        '#0E0C0A',
  },

  // ─── SHADOWS — 2027: layered depth, oklch-based, never pure black ────────
  shadows: {
    xs:  '0 1px 2px oklch(13% 0.012 55 / 5%),  0 1px 4px oklch(13% 0.012 55 / 3%)',
    sm:  '0 2px 8px oklch(13% 0.012 55 / 7%),  0 1px 2px oklch(13% 0.012 55 / 4%)',
    md:  '0 4px 16px oklch(13% 0.012 55 / 8%),  0 2px 6px oklch(13% 0.012 55 / 5%)',
    lg:  '0 12px 40px oklch(13% 0.012 55 / 10%), 0 4px 12px oklch(13% 0.012 55 / 6%)',
    xl:  '0 24px 64px oklch(13% 0.012 55 / 12%), 0 8px 24px oklch(13% 0.012 55 / 7%)',
    // Brand glow shadows
    brandGlow: '0 8px 20px oklch(42% 0.092 155 / 30%), inset 0 1px 0 oklch(100% 0 0 / 15%)',
    accentGlow:'0 8px 24px oklch(62% 0.115 40 / 28%)',
    sandGlow:  '0 8px 24px oklch(68% 0.108 75 / 22%)',
    // Glass inner rim — directional specular
    glassInner:'inset 0 1px 0 oklch(100% 0 0 / 72%)',
  },

  // ─── GLASS BLUR ──────────────────────────────────────────────────────────
  blur: {
    sm:  'blur(12px) saturate(1.6)',
    md:  'blur(24px) saturate(1.8)',
    lg:  'blur(40px) saturate(1.85)',
    xl:  'blur(60px) saturate(2.0)',
  },

  // ─── MOTION — 2027: physics-based, intentional, never decorative ─────────
  motion: {
    duration: {
      instant: '80ms',
      fast:    '150ms',
      normal:  '250ms',
      slow:    '400ms',
      enter:   '500ms',
    },
    easing: {
      snap:   'cubic-bezier(0.25, 0, 0, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      exit:   'cubic-bezier(0.4, 0, 1, 1)',
      jelly:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    // ── Framer Motion variants — 2027 signature: blur-fade + vertical drift ─
    blurUp: {
      hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
      visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.45, ease: [0.25, 0, 0, 1] as [number, number, number, number] },
      },
      exit: {
        opacity: 0, y: -8, filter: 'blur(4px)',
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
      },
    },

    stagger: {
      visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
    },

    staggerFast: {
      visible: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
    },

    popIn: {
      hidden: { opacity: 0, scale: 0.88, filter: 'blur(4px)' },
      visible: {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
      },
    },

    pageEnter: {
      initial: { opacity: 0, y: 8,  filter: 'blur(6px)' },
      animate: { opacity: 1, y: 0,  filter: 'blur(0px)',
        transition: { duration: 0.38, ease: [0.25, 0, 0, 1] as [number, number, number, number] } },
      exit:    { opacity: 0, y: -6, filter: 'blur(4px)',
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] } },
    },
  },
} as const;

export type Tokens = typeof tokens;

// tokens/design-system.ts
// THE SINGLE SOURCE OF TRUTH — all components consume from here
// Brand: Trippy v2 "Jelly Liquid Glass" — warm paper + forest green + terracotta + sand gold

export const tokens = {

  // ─── COLORS (oklch — perceptually uniform, wide-gamut) ─────────────────────
  colors: {
    // Forest green — primary brand
    brand: {
      50:  'oklch(97% 0.018 155)',
      100: 'oklch(93% 0.040 155)',
      200: 'oklch(86% 0.072 155)',
      300: 'oklch(76% 0.095 155)',
      400: 'oklch(62% 0.100 155)',
      500: 'oklch(50% 0.100 155)',   // #3B6E52 — forest
      600: 'oklch(42% 0.092 155)',   // #22553b — brand hover
      700: 'oklch(35% 0.080 155)',   // #2B5340 — forest dark
      800: 'oklch(27% 0.060 155)',
      900: 'oklch(18% 0.038 155)',
    },

    // Terracotta — accent / CTA
    accent: {
      50:  'oklch(97% 0.012 40)',
      100: 'oklch(92% 0.038 40)',
      300: 'oklch(78% 0.085 40)',
      500: 'oklch(62% 0.115 40)',    // #C4714A — terra
      600: 'oklch(56% 0.110 40)',    // #A85C3A — terra hover
      700: 'oklch(48% 0.100 40)',
    },

    // Sand gold — secondary accent
    sand: {
      300: 'oklch(82% 0.090 75)',
      500: 'oklch(68% 0.108 75)',    // #C8944A — sand
      600: 'oklch(60% 0.100 75)',
    },

    // Warm paper backgrounds
    surface: {
      base:     'oklch(98% 0.010 75)',   // #fef9f2
      warm:     'oklch(96% 0.012 75)',   // #f8f3ec
      alt:      'oklch(94% 0.014 75)',   // #f2ede6
      container:'oklch(92% 0.016 75)',   // #ece7e1
    },

    // Glass surfaces (rgba — for use in components directly)
    glass: {
      base:     'rgba(255, 255, 255, 0.45)',
      float:    'rgba(255, 255, 255, 0.65)',
      strong:   'rgba(255, 255, 255, 0.82)',
      dark:     'rgba(30, 26, 20, 0.72)',
      darkFloat:'rgba(25, 22, 16, 0.88)',
    },

    // Text
    text: {
      primary:   'oklch(13% 0.012 55)',    // #1A1410
      secondary: 'oklch(40% 0.020 55)',    // #6B5C4E
      muted:     'oklch(60% 0.014 55)',    // #A8998A
      inverse:   'oklch(98% 0.002 80)',
    },

    // Borders
    border: {
      subtle: 'oklch(89% 0.010 75)',       // #E3DBD1
      strong: 'oklch(80% 0.014 75)',       // #C9BDB0
    },

    // Semantic
    success: 'oklch(50% 0.090 155)',       // #2E7D55
    warning: 'oklch(55% 0.110 68)',        // #B45309
    danger:  'oklch(48% 0.130 25)',        // #C0392B
  },

  // ─── TYPOGRAPHY ─────────────────────────────────────────────────────────────
  typography: {
    display: '"Bricolage Grotesque", -apple-system, system-ui, sans-serif',
    body:    '"Bricolage Grotesque", -apple-system, system-ui, sans-serif',
    serif:   '"Newsreader", Georgia, serif',
    mono:    '"JetBrains Mono", ui-monospace, monospace',
    hebrew:  '"Noto Sans Hebrew", "DM Sans", sans-serif',

    sizes: {
      micro: 'clamp(0.68rem, 1vw,   0.6875rem)',
      xs:    'clamp(0.76rem, 1.1vw, 0.8125rem)',
      sm:    'clamp(0.86rem, 1.3vw, 0.9375rem)',
      base:  'clamp(0.95rem, 1.5vw, 1rem)',
      md:    'clamp(1.1rem,  1.8vw, 1.25rem)',
      lg:    'clamp(1.3rem,  2.2vw, 1.563rem)',
      xl:    'clamp(1.6rem,  3vw,   1.953rem)',
      '2xl': 'clamp(2rem,   4vw,   2.441rem)',
      display: 'clamp(1.9rem, 5vw, 2.8rem)',
    },

    tracking: {
      tight:   '-0.04em',
      snug:    '-0.02em',
      normal:  '-0.01em',
      mono:    '0.12em',
      wide:    '0.20em',
    },

    leading: {
      tight:   '1.1',
      normal:  '1.5',
      relaxed: '1.75',
    },
  },

  // ─── SPACING (4px base grid) ────────────────────────────────────────────────
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

  // ─── BORDER RADIUS (Jelly Glass — min 16px, full organic curves) ─────────
  radius: {
    xs:   '10px',
    sm:   '16px',
    md:   '20px',
    lg:   '24px',
    xl:   '32px',
    '2xl':'40px',
    full: '9999px',
  },

  // ─── SHADOWS (layered depth — never pure-black) ─────────────────────────────
  shadows: {
    xs: '0 1px 3px rgba(26,20,16,0.06), 0 1px 2px rgba(26,20,16,0.04)',
    sm: '0 2px 8px rgba(26,20,16,0.08), 0 1px 2px rgba(26,20,16,0.04)',
    md: '0 4px 16px rgba(26,20,16,0.08), 0 2px 6px rgba(26,20,16,0.04)',
    lg: '0 12px 40px rgba(26,20,16,0.10), 0 4px 12px rgba(26,20,16,0.06)',
    xl: '0 24px 64px rgba(26,20,16,0.12), 0 8px 24px rgba(26,20,16,0.07)',
    // Brand glow shadows
    brandGlow: '0 8px 20px rgba(34,85,59,0.30), inset 0 1px 0 rgba(255,255,255,0.15)',
    accentGlow:'0 8px 24px rgba(196,113,74,0.28)',
    sandGlow:  '0 8px 24px rgba(200,148,74,0.22)',
    // Glass inner rim
    glassInner:'inset 0 1px 0 rgba(255,255,255,0.72)',
  },

  // ─── GLASS BLUR ────────────────────────────────────────────────────────────
  blur: {
    sm:  'blur(12px) saturate(1.6)',
    md:  'blur(24px) saturate(1.8)',
    lg:  'blur(40px) saturate(1.8)',
    xl:  'blur(60px) saturate(2.0)',
  },

  // ─── MOTION (physics-based, intentional) ────────────────────────────────────
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

    // ── Framer Motion variants ─────────────────────────────────────────────
    // 2027 signature: blur-fade + vertical drift
    blurUp: {
      hidden: {
        opacity: 0,
        y: 16,
        filter: 'blur(6px)',
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.45,
          ease: [0.25, 0, 0, 1] as [number, number, number, number],
        },
      },
    },

    stagger: {
      visible: {
        transition: {
          staggerChildren: 0.07,
          delayChildren: 0.05,
        },
      },
    },

    popIn: {
      hidden: {
        opacity: 0,
        scale: 0.88,
        filter: 'blur(4px)',
      },
      visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.4,
          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
        },
      },
    },

    pageEnter: {
      initial: { opacity: 0, y: 8,  filter: 'blur(6px)' },
      animate: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.38, ease: [0.25, 0, 0, 1] as [number, number, number, number] } },
      exit:    { opacity: 0, y: -6, filter: 'blur(4px)', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] } },
    },
  },
} as const;

export type Tokens = typeof tokens;

import type { Transition, Variants } from 'framer-motion';

export const spring = {
  snap: {
    type: 'spring',
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  } satisfies Transition,

  default: {
    type: 'spring',
    stiffness: 320,
    damping: 28,
    mass: 1,
  } satisfies Transition,

  gentle: {
    type: 'spring',
    stiffness: 220,
    damping: 26,
    mass: 1.2,
  } satisfies Transition,

  float: {
    type: 'spring',
    stiffness: 120,
    damping: 22,
    mass: 1.5,
  } satisfies Transition,

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

export const slideVariants = (isRTL = false): Variants => ({
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

export const sheetVariants: Variants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit:    { y: '100%', opacity: 0 },
};

export const fadeVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

export const scaleVariants: Variants = {
  hidden:  { scale: 0.92, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit:    { scale: 0.96, opacity: 0 },
};

export const screenVariants: Variants = {
  initial: { opacity: 0, y: 10, filter: 'blur(5px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.38, ease: [0.25, 0, 0, 1] },
  },
  exit:    { opacity: 0, y: -5, filter: 'blur(3px)',
    transition: { duration: 0.20, ease: [0.4, 0, 1, 1] },
  },
};

export const listItemVariants: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// ── 2027 blur-fade patterns ──────────────────────────────────────────────────

// Signature entrance: opacity + drift + blur
export const blurUpVariants: Variants = {
  hidden:  { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.25, 0, 0, 1] },
  },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)',
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

// Container with stagger for children
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// Fast stagger for dense lists
export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

// Page-level blur transition (used by PageTransition wrapper)
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8,  filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.38, ease: [0.25, 0, 0, 1] },
  },
  exit:    { opacity: 0, y: -6, filter: 'blur(4px)',
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

// Pop-in for modals, cards, badges
export const popInVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.88, filter: 'blur(4px)' },
  visible: { opacity: 1, scale: 1,    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
};

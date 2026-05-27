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
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

export const listItemVariants: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

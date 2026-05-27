import type { Transition, Variants } from 'framer-motion';

export const spring = {
  snap: {
    type: 'spring',
    stiffness: 620,
    damping: 22,
    mass: 0.65,
  } satisfies Transition,

  default: {
    type: 'spring',
    stiffness: 400,
    damping: 22,
    mass: 0.9,
  } satisfies Transition,

  gentle: {
    type: 'spring',
    stiffness: 260,
    damping: 24,
    mass: 1.0,
  } satisfies Transition,

  float: {
    type: 'spring',
    stiffness: 160,
    damping: 20,
    mass: 1.2,
  } satisfies Transition,

  bounce: {
    type: 'spring',
    stiffness: 520,
    damping: 16,
    mass: 0.75,
  } satisfies Transition,

  instant: {
    duration: 0.01,
  } satisfies Transition,
} as const;

export const duration = {
  instant: 0.01,
  fast:    0.08,
  normal:  0.16,
  slow:    0.28,
  crawl:   0.48,
} as const;

export const stagger = {
  fast:   0.03,
  normal: 0.05,
  slow:   0.08,
} as const;

export const slideVariants = (isRTL = false): Variants => ({
  enter: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? (isRTL ? -56 : 56) : (isRTL ? 56 : -56),
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 'forward' | 'back') => ({
    x: direction === 'forward' ? (isRTL ? 56 : -56) : (isRTL ? -56 : 56),
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
  hidden:  { scale: 0.86, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit:    { scale: 0.94, opacity: 0 },
};

export const screenVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};

export const listItemVariants: Variants = {
  hidden:  { opacity: 0, y: 18, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1    },
};

export const popVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit:    { scale: 0, opacity: 0 },
};

export const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1    },
};

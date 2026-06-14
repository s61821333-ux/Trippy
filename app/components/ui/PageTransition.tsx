'use client';

import { AnimatePresence, m } from 'framer-motion';
import { pageVariants } from '@/lib/motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Unique key for the current "page" - changing it triggers the transition */
  pageKey: string;
}

/**
 * 2027-era page transition: blur-fade + vertical drift.
 * Wrap each screen in this component and change `pageKey` when navigating.
 */
export function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pageKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ height: '100%', width: '100%' }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

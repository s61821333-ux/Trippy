'use client';

import { useEffect, useRef } from 'react';

interface SwipeConfig {
  onSwipeLeft?:  () => void;
  onSwipeRight?: () => void;
  onSwipeDown?:  () => void;
  threshold?:    number;
  velocityMin?:  number;
}

export function useSwipe(ref: React.RefObject<HTMLElement | null>, config: SwipeConfig) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startT = useRef(0);
  const configRef = useRef(config);
  configRef.current = config;

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
      const cfg = configRef.current;

      const threshold   = cfg.threshold   ?? 50;
      const velocityMin = cfg.velocityMin ?? 0.3;

      // Guard: vertical scroll dominates → ignore
      if (Math.abs(dy) > Math.abs(dx) * 0.8) {
        if (dy > threshold && velocity > velocityMin) cfg.onSwipeDown?.();
        return;
      }

      if (dx < -threshold && velocity > velocityMin) cfg.onSwipeLeft?.();
      if (dx >  threshold && velocity > velocityMin) cfg.onSwipeRight?.();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend',   onEnd);
    };
  }, [ref]);
}

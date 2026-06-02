'use client';

import React, { ReactNode, useRef, useEffect, useState, useId } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion';
import Icon from './Icon';

interface SheetProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  isDismissable?: boolean;
  // When `full` is true the sheet becomes a full-screen slider (slides in from the right)
  full?: boolean;
}

export default function Sheet({ children, onClose, title, subtitle, isDismissable = true, full = false }: SheetProps) {
  const startY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollAtStart = useRef(0);
  const [kbH, setKbH] = useState(0);
  const titleId = useId();

  // Lock body scroll while sheet is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Push sheet above software keyboard via visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKbH(Math.max(0, window.innerHeight - vv.offsetTop - vv.height));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // Dismiss on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isDismissable) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, isDismissable]);

  // Auto-focus: after animation, focus the first INPUT (not a button which would fight with field autoFocus on mobile)
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = panelRef.current?.querySelector<HTMLElement>('input, textarea');
      if (firstInput) {
        firstInput.focus({ preventScroll: true });
      }
    }, 350); // wait for sheet slide-in animation to finish
    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    scrollAtStart.current = panelRef.current?.scrollTop ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - startY.current;
    if (dy > 80 && scrollAtStart.current === 0 && isDismissable) onClose();
  };

  const handleFocusCapture = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    setTimeout(() => target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 400);
  };

  return (
    <AnimatePresence>
      <m.div
        key="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.20 }}
        onClick={isDismissable ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(26, 20, 16, 0.55)',
          display: 'flex',
          alignItems: full ? 'stretch' : 'flex-end',
          justifyContent: full ? 'flex-end' : undefined,
          paddingBottom: kbH > 0 ? kbH : undefined,
          transition: 'padding-bottom 0.2s ease',
        }}
      >
        <m.div
          key="sheet-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          initial={full ? { x: '100%' } : { y: '100%' }}
          animate={full ? { x: 0 } : { y: 0 }}
          exit={full ? { x: '100%' } : { y: '100%' }}
          transition={spring.gentle}
          onClick={e => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onFocusCapture={handleFocusCapture}
          style={{
            width: full ? '100%' : '100%',
            height: full ? '100%' : undefined,
            background: 'var(--lg-panel-strong)',
            backdropFilter: 'var(--lg-blur-strong)',
            WebkitBackdropFilter: 'var(--lg-blur-strong)',
            color: 'var(--text)',
            borderRadius: full ? 0 : 'var(--lg-r-lg) var(--lg-r-lg) 0 0',
            border: '1px solid oklch(100% 0 0 / 22%)',
            borderBottom: full ? 'none' : 'none',
            padding: full ? 'var(--space-6) var(--space-6)' : 'var(--space-2) var(--space-5)',
            paddingBottom: kbH > 0
              ? 'max(20px, env(safe-area-inset-bottom, 20px))'
              : full ? 'env(safe-area-inset-bottom, 20px)' : 'max(40px, env(safe-area-inset-bottom, 40px))',
            maxHeight: full ? '100vh' : '92dvh',
            overflowY: 'auto',
            boxShadow: full ? 'none' : 'var(--lg-shadow-lg), inset 0 1px 0 oklch(100% 0 0 / 70%)',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            position: full ? 'relative' : undefined,
          }}
        >
          {/* Drag handle + close button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '12px 0 20px' }}>
            <div
              aria-hidden="true"
              style={{
                width: 40, height: 4,
                background: 'var(--border-strong)',
                borderRadius: 2,
                cursor: isDismissable ? 'grab' : 'default',
              }}
            />
            {isDismissable && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="lg-btn lg-btn-glass"
                style={{
                  position: 'absolute', insetInlineEnd: 0,
                  width: 36, height: 36,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <Icon name="x" size={16} style={{ color: 'var(--lg-ink)' }} />
              </button>
            )}
          </div>

          {(title || subtitle) && (
            <div style={{ marginBottom: 20 }}>
              {title && (
                <h3
                  id={titleId}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: subtitle ? 4 : 0,
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}

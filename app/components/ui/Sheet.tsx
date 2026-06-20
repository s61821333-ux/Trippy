'use client';

import React, { ReactNode, useRef, useEffect, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion';
import Icon from './Icon';
import { useI18n } from '@/lib/i18n';

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
  const { locale } = useI18n();
  const startY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollAtStart = useRef(0);
  const [kbH, setKbH] = useState(0);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  // Track the element that triggered open so we can restore focus on close
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    openerRef.current = document.activeElement;
  }, []);

  // Lock body scroll and apply inert to background content while sheet is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';

    // Mark background content as inert so AT can't navigate behind the sheet
    const appRoot = document.getElementById('app-root') ?? document.querySelector('main') ?? null;
    if (appRoot) (appRoot as HTMLElement).setAttribute('inert', '');

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
      if (appRoot) (appRoot as HTMLElement).removeAttribute('inert');
      // Return focus to the element that opened the sheet
      if (openerRef.current && (openerRef.current as HTMLElement).focus) {
        (openerRef.current as HTMLElement).focus({ preventScroll: true });
      }
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

  // Scroll panel to top on open so long forms always start at the title
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, []);

  // Row 810: focus trap - cycle Tab/Shift+Tab within the sheet
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.closest('[inert]'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

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

  // Scroll the panel so the focused field is visible above the keyboard.
  // Uses manual scrollTop calculation - scrollIntoView is unreliable inside
  // position:fixed overflow containers on iOS.
  const handleFocusCapture = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    const panel = panelRef.current;
    if (!panel) return;
    const scrollToField = () => {
      const vvHeight = window.visualViewport?.height ?? window.innerHeight;
      const targetRect = target.getBoundingClientRect();
      if (targetRect.bottom > vvHeight - 20) {
        panel.scrollTop += targetRect.bottom - (vvHeight - 20);
      }
    };
    setTimeout(scrollToField, 50);
    setTimeout(scrollToField, 350);
  };

  const sheetContent = (
    <AnimatePresence>
      <m.div
        key="sheet-backdrop"
        className="sheet-backdrop-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.20 }}
        onClick={isDismissable ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 'var(--z-modal-lg)',
          background: 'var(--sheet-backdrop, rgba(26, 20, 16, 0.55))',
          display: 'flex',
          alignItems: full ? 'stretch' : 'flex-end',
          justifyContent: full ? 'flex-end' : undefined,
          paddingBottom: kbH > 0 ? kbH : undefined,
          transition: 'padding-bottom var(--dur-base) ease',
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
          onKeyDown={handleKeyDown}
          style={{
            width: full ? '100%' : '100%',
            height: full ? '100%' : undefined,
            background: 'var(--lg-panel-float, var(--lg-panel-strong))',
            backdropFilter: 'var(--lg-blur-4)',
            WebkitBackdropFilter: 'var(--lg-blur-4)',
            color: 'var(--text)',
            borderRadius: full ? 0 : 'var(--lg-r-lg) var(--lg-r-lg) 0 0',
            /* Specular top rim + subtle left rim + lower shadow */
            borderTop: full ? 'none' : '1px solid oklch(100% 0 0 / 38%)',
            borderLeft: '1px solid oklch(100% 0 0 / 18%)',
            borderRight: '1px solid oklch(13% 0.012 55 / 5%)',
            borderBottom: 'none',
            padding: full ? 'var(--space-6) var(--space-6)' : '10px var(--space-5) 0',
            paddingBottom: kbH > 0
              ? 'max(20px, env(safe-area-inset-bottom, 20px))'
              : full
                ? 'env(safe-area-inset-bottom, 20px)'
                : 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
            maxHeight: full ? '100vh' : '92dvh',
            overflowY: 'auto',
            boxShadow: full
              ? 'none'
              : 'var(--lg-shadow-lg), inset 0 1px 0 oklch(100% 0 0 / 62%), inset 0 0 0 1px oklch(100% 0 0 / 14%)',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            position: full ? 'relative' : undefined,
          }}
        >
          {/* Drag handle + close button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '0 0 20px' }}>
            <div
              aria-hidden="true"
              data-sheet-handle
              className="lg-handle sheet-handle"
              style={{ cursor: isDismissable ? 'grab' : 'default' }}
            />
            {isDismissable && (
              <button
                onClick={onClose}
                aria-label={locale === 'he' ? 'סגור' : 'Close'}
                className="lg-btn lg-btn-glass"
                style={{
                  position: 'absolute', insetInlineEnd: 0,
                  width: 44, height: 44,
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
            <div className="sheet-header-sticky" style={{ marginBottom: 20 }}>
              {title && (
                <h2
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
                </h2>
              )}
              {subtitle && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.4, margin: 0 }}>{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </m.div>
      </m.div>
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(sheetContent, document.body);
}

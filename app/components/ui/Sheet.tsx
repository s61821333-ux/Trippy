'use client';

import React, { ReactNode, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SheetProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function Sheet({ children, onClose, title, subtitle }: SheetProps) {
  const startY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollAtStart = useRef(0);

  // Lock body scroll while sheet is open (prevents iOS keyboard + scroll jump)
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

  // Dismiss on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    scrollAtStart.current = panelRef.current?.scrollTop ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - startY.current;
    // Only close if panel was at top AND user dragged down significantly
    if (dy > 80 && scrollAtStart.current === 0) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.20 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(26, 20, 16, 0.55)',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <motion.div
          key="sheet-panel"
          ref={panelRef}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 420, damping: 40, mass: 0.85 }}
          onClick={e => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            width: '100%',
            background: 'var(--surface)',
            color: 'var(--text)',
            borderTop: '1px solid var(--border)',
            borderRadius: '24px 24px 0 0',
            padding: '8px 20px',
            paddingBottom: 'max(40px, env(safe-area-inset-bottom, 40px))',
            maxHeight: '92dvh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Drag handle + close button row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '12px 0 20px' }}>
            <div
              style={{
                width: 40, height: 4,
                background: 'var(--border-strong)',
                borderRadius: 2,
                cursor: 'grab',
              }}
            />
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute', right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {(title || subtitle) && (
            <div style={{ marginBottom: 20 }}>
              {title && (
                <h3 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: subtitle ? 4 : 0,
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

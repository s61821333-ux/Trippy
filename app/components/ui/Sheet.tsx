'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SheetProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function Sheet({ children, onClose, title, subtitle }: SheetProps) {
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
          background: 'rgba(26, 20, 16, 0.50)',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <motion.div
          key="sheet-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 420, damping: 40, mass: 0.85 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            borderRadius: '20px 20px 0 0',
            padding: '8px 20px',
            paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
            maxHeight: '88%',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Handle */}
          <div style={{
            width: 36, height: 4,
            background: 'var(--border-strong)',
            borderRadius: 2,
            margin: '10px auto 20px',
          }} />

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

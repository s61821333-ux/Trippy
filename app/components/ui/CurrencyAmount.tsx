'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CURRENCIES, convertCurrency, getCurrencySymbol } from '@/lib/currency';

interface Props {
  amount: number;
  base: string;           // e.g. 'USD'
  style?: React.CSSProperties;
  className?: string;
  decimals?: number;      // decimal places for the converted value
}

/**
 * Tap to peek the amount in any other currency.
 * Shows a compact picker, converts live, auto-reverts after 5 s.
 */
export default function CurrencyAmount({
  amount, base, style, className, decimals = 0,
}: Props) {
  const [open,      setOpen]      = useState(false);
  const [peekCode,  setPeekCode]  = useState<string | null>(null);
  const [peekValue, setPeekValue] = useState<number | null>(null);
  const [loading,   setLoading]   = useState(false);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef   = useRef<HTMLSpanElement>(null);

  const baseSym = getCurrencySymbol(base);
  const isPeeking = peekCode !== null;

  const reset = () => {
    setPeekCode(null);
    setPeekValue(null);
    setOpen(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handlePick = async (code: string) => {
    setOpen(false);
    if (code === base) { reset(); return; }
    setLoading(true);
    setPeekCode(code);
    setPeekValue(null);
    const converted = await convertCurrency(amount, base, code);
    setPeekValue(converted);
    setLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(reset, 5000);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const fmt = (v: number) =>
    v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const peekSym = peekCode ? getCurrencySymbol(peekCode) : null;

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...style }} className={className}>
      <button
        onClick={() => {
          if (isPeeking) { reset(); return; }
          setOpen(o => !o);
        }}
        title={isPeeking ? 'Tap to reset' : 'Tap to convert'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, display: 'inline-flex', alignItems: 'center', gap: 2,
          fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
          color: isPeeking ? 'var(--lg-terra)' : 'inherit',
          transition: 'color .2s',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ opacity: 0.5 }}
            >…</motion.span>
          ) : isPeeking ? (
            <motion.span key="peek"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}
            >
              <span style={{ fontSize: '0.65em', opacity: 0.55, letterSpacing: 0 }}>≈</span>
              {peekSym}{peekValue != null ? fmt(peekValue) : '…'}
            </motion.span>
          ) : (
            <motion.span key="base"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              {baseSym}{fmt(amount)}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Currency picker popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 300,
              background: 'var(--lg-panel-strong)',
              borderRadius: 18,
              padding: '10px 10px 8px',
              boxShadow: '0 12px 40px oklch(20% 0.03 60 / 26%), inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
              width: 220,
            }}
          >
            {/* Arrow */}
            <div style={{
              position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
              width: 10, height: 10, background: 'var(--lg-panel-strong)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }} />

            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-3)', margin: '0 0 7px 2px',
            }}>
              Convert to
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {CURRENCIES.filter(c => c.code !== base).map(c => (
                <button
                  key={c.code}
                  onClick={() => handlePick(c.code)}
                  style={{
                    background: 'var(--lg-panel)',
                    border: 'none', cursor: 'pointer',
                    borderRadius: 9999, padding: '5px 9px',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                    color: 'var(--lg-ink)',
                    boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    transition: 'background .15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ opacity: 0.7 }}>{c.symbol}</span> {c.code}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

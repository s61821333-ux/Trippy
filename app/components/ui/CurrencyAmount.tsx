'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { CURRENCIES, convertCurrency, getCurrencySymbol } from '@/lib/currency';

interface Props {
  amount: number;
  base: string;
  style?: React.CSSProperties;
  className?: string;
  decimals?: number;
}

interface Rect { top: number; bottom: number; left: number; right: number; width: number; height: number }

export default function CurrencyAmount({ amount, base, style, className, decimals = 0 }: Props) {
  const [open,      setOpen]      = useState(false);
  const [anchorRect, setAnchorRect] = useState<Rect | null>(null);
  const [peekCode,  setPeekCode]  = useState<string | null>(null);
  const [peekValue, setPeekValue] = useState<number | null>(null);
  const [loading,   setLoading]   = useState(false);
  const btnRef    = useRef<HTMLButtonElement>(null);
  const popRef    = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseSym   = getCurrencySymbol(base);
  const isPeeking = peekCode !== null;

  const reset = () => {
    setPeekCode(null);
    setPeekValue(null);
    setOpen(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleOpen = () => {
    if (isPeeking) { reset(); return; }
    if (!btnRef.current) return;
    setAnchorRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
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

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        popRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const fmt = (v: number) =>
    v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const peekSym = peekCode ? getCurrencySymbol(peekCode) : null;

  // Position: prefer above the anchor, fall back to below if near top of viewport
  const POPOVER_W = 224;
  const popStyle = (): React.CSSProperties => {
    if (!anchorRect) return { display: 'none' };
    const spaceAbove = anchorRect.top;
    const above = spaceAbove > 160;
    const left  = Math.min(
      Math.max(8, anchorRect.left + anchorRect.width / 2 - POPOVER_W / 2),
      window.innerWidth - POPOVER_W - 8,
    );
    return {
      position: 'fixed',
      zIndex: 9999,
      width: POPOVER_W,
      left,
      ...(above
        ? { bottom: window.innerHeight - anchorRect.top + 8 }
        : { top: anchorRect.bottom + 8 }),
    };
  };

  const arrowAbove = anchorRect ? anchorRect.top > 160 : true;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} className={className}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        title={isPeeking ? 'Click to reset' : 'Click to convert'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, display: 'inline-flex', alignItems: 'center', gap: 2,
          fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
          color: isPeeking ? 'var(--lg-terra)' : 'inherit',
          transition: 'color .2s',
          textDecoration: isPeeking ? 'none' : 'underline dotted oklch(50% 0.02 60 / 30%)',
          textUnderlineOffset: 3,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <m.span key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ opacity: 0.45 }}
            >…</m.span>
          ) : isPeeking ? (
            <m.span key="peek"
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}
            >
              <span style={{ fontSize: '0.6em', opacity: 0.5 }}>≈</span>
              {peekSym}{peekValue != null ? fmt(peekValue) : '…'}
            </m.span>
          ) : (
            <m.span key="base"
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              {baseSym}{fmt(amount)}
            </m.span>
          )}
        </AnimatePresence>
      </button>

      {/* Portal popover — renders to document.body, unaffected by parent overflow */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <m.div
              ref={popRef}
              initial={{ opacity: 0, scale: 0.92, y: arrowAbove ? 6 : -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: arrowAbove ? 6 : -6 }}
              transition={{ type: 'spring', stiffness: 440, damping: 32 }}
              style={{
                ...popStyle(),
                background: 'var(--lg-panel-strong)',
                borderRadius: 18,
                padding: '10px 10px 8px',
                boxShadow: '0 12px 48px oklch(20% 0.03 60 / 30%), inset 0 0 0 1px oklch(50% 0.02 60 / 16%)',
              }}
            >
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                ...(arrowAbove
                  ? { bottom: -5, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }
                  : { top: -5, clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }),
                left: '50%', transform: 'translateX(-50%)',
                width: 10, height: 6,
                background: 'var(--lg-panel-strong)',
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
                      background: 'var(--lg-panel)', border: 'none', cursor: 'pointer',
                      borderRadius: 9999, padding: '5px 9px',
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                      color: 'var(--lg-ink)',
                      boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ opacity: 0.65 }}>{c.symbol}</span> {c.code}
                  </button>
                ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </span>
  );
}

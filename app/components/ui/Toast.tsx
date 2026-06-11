'use client';

import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

interface ToastAction { label: string; onClick: () => void }
type ToastVariant = 'default' | 'success' | 'error' | 'info';
interface ToastOptions { action?: ToastAction; variant?: ToastVariant }
interface ToastCtx { show: (msg: string, opts?: ToastOptions) => void }

const Ctx = createContext<ToastCtx>({ show: () => {} });

const VARIANT_STYLES: Record<ToastVariant, { bg: string; color: string; border: string }> = {
  default:  { bg: 'rgba(255,255,255,0.92)', color: 'rgba(28,18,8,0.88)',  border: 'rgba(255,255,255,0.85)' },
  success:  { bg: 'oklch(97% 0.020 155 / 0.95)', color: 'var(--brand)',   border: 'oklch(42% 0.092 155 / 0.25)' },
  error:    { bg: 'oklch(97% 0.018 25 / 0.95)',  color: 'var(--danger)',  border: 'oklch(48% 0.130 25 / 0.25)' },
  info:     { bg: 'rgba(255,255,255,0.92)', color: 'oklch(52% 0.16 225)', border: 'oklch(52% 0.16 225 / 0.25)' },
};

// Row 118: icon + color + text triple redundancy
const VARIANT_ICON: Record<ToastVariant, string | null> = {
  default: null,
  success: `<path d="M5 12l5 5L20 7"/>`,
  error:   `<path d="M6 6l12 12M18 6L6 18"/>`,
  info:    `<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>`,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg]         = useState<string | null>(null);
  const [action, setAction]   = useState<ToastAction | null>(null);
  const [variant, setVariant] = useState<ToastVariant>('default');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string, opts?: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg(m);
    setAction(opts?.action ?? null);
    setVariant(opts?.variant ?? 'default');
    timerRef.current = setTimeout(() => { setMsg(null); setAction(null); }, 3200);
  }, []);

  const vs = VARIANT_STYLES[variant];

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {/* aria-live region always in DOM so screen readers register it early */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          /* Positioned above the NavBar (--navbar-clearance = ~96px) */
          position: 'fixed',
          bottom: 'calc(var(--navbar-clearance, 96px) + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          pointerEvents: msg ? 'auto' : 'none',
        }}
      >
        {msg && (
          <div
            className="an-fade"
            style={{
              background: vs.bg,
              backdropFilter: 'blur(28px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
              border: `1px solid ${vs.border}`,
              borderRadius: 14,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 24px rgba(80,60,20,0.12)',
              color: vs.color,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {VARIANT_ICON[variant] && (
              <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: VARIANT_ICON[variant]! }}
              />
            )}
            <span>{msg}</span>
            {action && (
              <button
                type="button"
                onClick={() => {
                  action.onClick();
                  if (timerRef.current) clearTimeout(timerRef.current);
                  setMsg(null);
                  setAction(null);
                }}
                style={{
                  background: 'var(--brand)', color: 'white',
                  border: 'none', borderRadius: 8,
                  padding: '4px 12px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', flexShrink: 0,
                  minHeight: 28,
                }}
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);

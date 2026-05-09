'use client';

import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

interface ToastAction { label: string; onClick: () => void }
interface ToastOptions { action?: ToastAction }
interface ToastCtx { show: (msg: string, opts?: ToastOptions) => void }

const Ctx = createContext<ToastCtx>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg]       = useState<string | null>(null);
  const [action, setAction] = useState<ToastAction | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string, opts?: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg(m);
    setAction(opts?.action ?? null);
    timerRef.current = setTimeout(() => { setMsg(null); setAction(null); }, 3200);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {msg && (
        <div
          className="an-fade"
          style={{
            position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            border: '1px solid rgba(255,255,255,0.85)',
            borderRadius: 14, padding: '10px 16px',
            fontSize: 13, fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px rgba(80,60,20,0.10)',
            color: 'rgba(28,18,8,0.88)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <span>{msg}</span>
          {action && (
            <button
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
              }}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);

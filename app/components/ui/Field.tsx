'use client';

import React, { CSSProperties, ReactNode, useState } from 'react';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  icon?: ReactNode;
  autoFocus?: boolean;
  rows?: number;
  style?: CSSProperties;
  disabled?: boolean;
}

export default function Field({
  label, hint, error, type = 'text', placeholder, value, onChange, onKeyDown,
  icon, autoFocus, rows, style = {}, disabled,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  const baseStyle: CSSProperties = {
    // 2027 glass input surface
    background: focused
      ? 'oklch(99% 0.004 80 / 72%)'
      : 'oklch(97% 0.008 80 / 58%)',
    backdropFilter: 'blur(20px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
    border: 'none',
    borderRadius: 14,
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    fontSize: 16,                   // never below 16px — prevents iOS auto-zoom
    padding: '11px 18px',
    paddingLeft: icon ? 46 : 18,
    width: '100%',
    outline: 'none',
    minHeight: 44,                  // WCAG 2.5.5 touch target
    boxSizing: 'border-box' as const,
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
    boxShadow: error
      ? 'inset 0 0 0 1.5px var(--danger), inset 0 1px 0 oklch(100% 0 0 / 40%)'
      : focused
        ? `inset 0 0 0 1.5px var(--brand), inset 0 1px 0 oklch(100% 0 0 / 50%), 0 0 0 3px var(--brand-muted)`
        : 'inset 0 0 0 1px oklch(13% 0.012 55 / 8%), inset 0 1px 0 oklch(100% 0 0 / 50%)',
    ...style,
  };

  const sharedProps = {
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    disabled,
    style: baseStyle,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.10em',
          textTransform: 'uppercase' as const,
          color: focused ? 'var(--brand)' : 'var(--text-3)',
          transition: 'color 0.2s ease',
        }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            insetInlineStart: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? 'var(--brand)' : 'var(--text-3)',
            display: 'flex',
            pointerEvents: 'none',
            transition: 'color 0.2s ease',
          }}>
            {icon}
          </span>
        )}

        {rows ? (
          <textarea
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            {...sharedProps}
            style={{ ...baseStyle, resize: 'none', paddingLeft: 18, borderRadius: 16 }}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            inputMode={
              type === 'number' || type === 'tel' ? 'numeric'
              : type === 'email' ? 'email'
              : undefined
            }
            {...sharedProps}
          />
        )}
      </div>

      {(hint || error) && (
        <p style={{
          fontSize: 12,
          color: error ? 'var(--danger)' : 'var(--text-3)',
          margin: 0,
          paddingInlineStart: 4,
        }}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

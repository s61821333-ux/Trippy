'use client';

import React, { CSSProperties, ReactNode } from 'react';

interface FieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  icon?: ReactNode;
  autoFocus?: boolean;
  rows?: number;
  style?: CSSProperties;
}

const INPUT_STYLE: CSSProperties = {
  background: 'var(--surface)',
  backdropFilter: 'blur(20px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
  border: 'none',
  borderRadius: 9999,
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  fontSize: 16,
  padding: '11px 20px',
  width: '100%',
  outline: 'none',
  boxShadow: 'inset 0 0 0 1px rgba(26,20,16,0.07), inset 0 1px 0 rgba(255,255,255,0.40)',
};

export default function Field({ label, type = 'text', placeholder, value, onChange, onKeyDown, icon, autoFocus, rows, style = {} }: FieldProps) {
  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-2)',
          letterSpacing: '0.03em',
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 18, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-3)',
            display: 'flex', pointerEvents: 'none',
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
            className="input-premium"
            style={{ ...INPUT_STYLE, resize: 'none', minHeight: 44, ...style }}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            inputMode={type === 'number' || type === 'tel' ? 'numeric' : type === 'email' ? 'email' : undefined}
            className="input-premium"
            style={{ ...INPUT_STYLE, paddingLeft: icon ? 44 : 20, minHeight: 44, ...style }}
          />
        )}
      </div>
    </div>
  );
}

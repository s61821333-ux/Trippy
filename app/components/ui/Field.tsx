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
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  padding: '11px 14px',
  width: '100%',
  outline: 'none',
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
            position: 'absolute', left: 12, top: '50%',
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
            style={{ ...INPUT_STYLE, resize: 'none', ...style }}
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
            style={{ ...INPUT_STYLE, paddingLeft: icon ? 38 : 14, minHeight: 44, ...style }}
          />
        )}
      </div>
    </div>
  );
}

'use client';

import React, { CSSProperties, ReactNode, useId, useState } from 'react';

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
  autoComplete?: string;
  min?: string;
  rows?: number;
  style?: CSSProperties;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  id?: string;
  name?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
}

export default function Field({
  label, hint, error, type = 'text', placeholder, value, onChange, onKeyDown,
  icon, autoFocus, autoComplete, min, rows, style = {}, disabled, required,
  maxLength, id: idProp, name, inputMode: inputModeProp, enterKeyHint,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  // Row 476: placeholder must never substitute for a visible label
  if (process.env.NODE_ENV === 'development' && !label && placeholder) {
    console.warn('[Field] Missing `label` prop - placeholder alone is not accessible. Add a label.');
  }
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = `${id}-error`;
  const hintId  = `${id}-hint`;

  const inputMode: React.InputHTMLAttributes<HTMLInputElement>['inputMode'] =
    inputModeProp ??
    (type === 'number' ? 'decimal'
    : type === 'tel'   ? 'tel'
    : type === 'email' ? 'email'
    : undefined);

  const baseStyle: CSSProperties = {
    background: focused ? 'var(--field-bg-focused)' : 'var(--field-bg)',
    backdropFilter: 'blur(24px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
    border: 'none',
    borderRadius: 14,
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    fontSize: 16, // never below 16px - prevents iOS auto-zoom
    padding: '11px 18px',
    paddingInlineStart: icon ? 46 : 18,
    width: '100%',
    outline: 'none',
    minHeight: 44,
    boxSizing: 'border-box' as const,
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
    boxShadow: error
      ? 'inset 0 0 0 1.5px var(--danger), inset 0 1px 0 oklch(100% 0 0 / 50%)'
      : focused
        ? `inset 0 0 0 1.5px var(--field-border-focused), inset 0 1px 0 oklch(100% 0 0 / 55%), 0 0 0 3px var(--brand-muted)`
        : 'inset 0 0 0 1px var(--field-border), inset 0 1px 0 oklch(100% 0 0 / 52%), inset 0 -1px 0 oklch(13% 0.012 55 / 3%)',
    caretColor: 'var(--brand)',
    ...style,
  };

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  const sharedProps = {
    id,
    name,
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required,
    style: baseStyle,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontFamily: 'var(--font-sans)', /* changed from mono to sans - less technical feel */
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: focused ? 'var(--brand)' : 'var(--text-2)',
            transition: 'color 0.2s ease',
          }}
        >
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--danger)', marginInlineStart: 3 }}>*</span>
          )}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              insetInlineStart: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? 'var(--brand)' : 'var(--field-icon)',
              display: 'flex',
              pointerEvents: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            {icon}
          </span>
        )}

        {rows ? (
          <textarea
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={maxLength}
            dir="auto"
            {...sharedProps}
            style={{ ...baseStyle, resize: 'none', paddingInlineStart: 18, borderRadius: 16 }}
          />
        ) : (
          <input
            type={type === 'number' ? 'text' : type} /* use text + inputMode for better mobile UX */
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            min={min}
            maxLength={maxLength}
            inputMode={inputMode}
            enterKeyHint={enterKeyHint}
            dir="auto"
            {...sharedProps}
          />
        )}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="assertive"
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--danger)',
            margin: 0,
            paddingInlineStart: 4,
          }}
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p
          id={hintId}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-3)',
            margin: 0,
            paddingInlineStart: 4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

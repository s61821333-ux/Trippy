'use client';

import { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

type Variant = 'default' | 'accent' | 'coral' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface GlassBtnProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

const SIZES: Record<Size, { h: number; px: number; fs: number }> = {
  sm: { h: 36, px: 14, fs: 13 },
  md: { h: 44, px: 18, fs: 14 },
  lg: { h: 52, px: 24, fs: 15 },
};

function getVariantStyles(variant: Variant) {
  switch (variant) {
    case 'accent':
      return {
        bg: 'var(--brand)',
        color: 'white',
        border: 'none',
        shadow: 'var(--shadow-sm)',
      };
    case 'coral':
      return {
        bg: 'var(--terra)',
        color: 'white',
        border: 'none',
        shadow: 'var(--shadow-sm)',
      };
    case 'danger':
      return {
        bg: 'var(--danger-bg)',
        color: 'var(--danger)',
        border: '1px solid rgba(192,57,43,0.18)',
        shadow: 'none',
      };
    case 'ghost':
      return {
        bg: 'transparent',
        color: 'var(--text-2)',
        border: 'none',
        shadow: 'none',
      };
    default:
      return {
        bg: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        shadow: 'var(--shadow-xs)',
      };
  }
}

export default function GlassBtn({
  children, variant = 'default', size = 'md',
  onClick, disabled = false, style = {}, type = 'button',
}: GlassBtnProps) {
  const sz = SIZES[size];
  const { bg, color, border, shadow } = getVariantStyles(variant);

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      style={{
        height: sz.h,
        padding: `0 ${sz.px}px`,
        fontSize: sz.fs,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        letterSpacing: '0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: border || 'none',
        borderRadius: 'var(--radius-md)',
        color,
        background: bg,
        boxShadow: shadow,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

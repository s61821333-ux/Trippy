'use client';

// Usage: accent/coral/danger for actions; ghost for secondary; flat for inline list controls; default for general buttons.
// Never use on page-scroll content that is not floating (use a plain <button> or GlassBtn variant="flat" instead).
import { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

type Variant = 'default' | 'accent' | 'coral' | 'danger' | 'ghost' | 'flat';
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
  sm: { h: 44, px: 14, fs: 13 },
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
    case 'flat':
      return {
        bg: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        shadow: 'none',
      };
    default:
      return {
        bg: 'oklch(97% 0.01 80 / 0.82)',
        color: 'var(--text)',
        border: '1px solid oklch(100% 0 0 / 0.10)',
        borderTop: '1px solid oklch(100% 0 0 / 0.36)',
        shadow: '0 2px 8px rgba(26,20,16,0.07)',
        backdropFilter: 'blur(20px) saturate(1.6)',
      };
  }
}

export default function GlassBtn({
  children, variant = 'default', size = 'md',
  onClick, disabled = false, style = {}, type = 'button',
}: GlassBtnProps) {
  const sz = SIZES[size];
  const vs = getVariantStyles(variant);

  const isDefault = variant === 'default' || variant === 'flat';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.96, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
      whileHover={disabled ? {} : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      style={{
        height: sz.h,
        padding: `0 ${sz.px}px`,
        fontSize: sz.fs,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: vs.border || 'none',
        borderTopColor: (vs as any).borderTop ? undefined : undefined,
        borderRadius: 'var(--radius-md)',
        color: vs.color,
        background: vs.bg,
        boxShadow: vs.shadow,
        backdropFilter: (vs as any).backdropFilter || undefined,
        WebkitBackdropFilter: (vs as any).backdropFilter || undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.18s ease, box-shadow 0.18s ease',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

'use client';

// Usage: accent/coral/danger for actions; ghost for secondary; flat for inline list controls; default for general buttons.
// Never use on page-scroll content that is not floating (use a plain <button> or GlassBtn variant="flat" instead).
import { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { m } from 'framer-motion';

// Detect true hover capability once on mount (avoids mobile jitter from whileHover)
function useHoverCapable() {
  const ref = useRef(false);
  useEffect(() => {
    ref.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);
  return ref;
}

type Variant = 'default' | 'accent' | 'coral' | 'danger' | 'ghost' | 'flat' | 'forest';
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
    case 'forest':
      return {
        bg: 'linear-gradient(180deg, oklch(52% 0.14 158), var(--lg-forest))',
        color: 'white',
        border: 'none',
        shadow: 'var(--lg-glow-forest), inset 0 1px 0 oklch(100% 0 0 / 25%)',
      };
    case 'accent':
      return {
        bg: 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))',
        color: 'white',
        border: 'none',
        shadow: 'var(--lg-glow-terra), inset 0 1px 0 oklch(100% 0 0 / 30%)',
      };
    case 'coral':
      return {
        bg: 'var(--coral-glow, var(--terra))',
        color: 'white',
        border: 'none',
        shadow: '0 6px 20px rgba(224,90,58,0.28), inset 0 1px 0 rgba(255,255,255,0.15)',
      };
    case 'danger':
      return {
        bg: 'var(--danger-bg)',
        color: 'var(--danger)',
        border: 'none',
        shadow: 'inset 0 0 0 1px rgba(192,57,43,0.18)',
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
        border: 'none',
        shadow: 'inset 0 0 0 1px rgba(26,20,16,0.08), inset 0 1px 0 rgba(255,255,255,0.40)',
        backdropFilter: 'blur(20px) saturate(1.6)',
      };
    default:
      return {
        bg: 'rgba(255,255,255,0.72)',
        color: 'var(--text)',
        border: 'none',
        shadow: 'inset 0 1px 0 rgba(255,255,255,0.60), 0 2px 8px rgba(26,20,16,0.07)',
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
  const hoverCapable = useHoverCapable();

  return (
    <m.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.96, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
      // Only apply hover lift on devices with a real hover pointer — prevents mobile jitter
      whileHover={disabled || !hoverCapable.current ? {} : { scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      aria-disabled={disabled}
      style={{
        height: sz.h,
        padding: `0 ${sz.px}px`,
        fontSize: sz.fs,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: disabled ? 'none' : undefined,
        border: vs.border || 'none',
        borderRadius: 9999,
        color: vs.color,
        background: vs.bg,
        boxShadow: vs.shadow,
        backdropFilter: (vs as any).backdropFilter || undefined,
        WebkitBackdropFilter: (vs as any).backdropFilter || undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minWidth: 44,
        minHeight: 44,
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.18s ease, box-shadow 0.18s ease',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...style,
      }}
    >
      {children}
    </m.button>
  );
}

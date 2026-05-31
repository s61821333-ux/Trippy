'use client';

import { m } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

interface ToggleProps {
  on: boolean;
  onClick: () => void;
  label: string;
}

export default function Toggle({ on, onClick, label }: ToggleProps) {
  const { isRTL } = useI18n();
  return (
    <button
      onClick={onClick} role="switch" aria-checked={on} aria-label={label}
      style={{
        width: 50, height: 30, borderRadius: 9999, border: 0, cursor: 'pointer', padding: 3, flexShrink: 0,
        background: on ? 'var(--lg-forest)' : 'oklch(50% 0.02 60 / 24%)',
        boxShadow: on ? 'var(--lg-glow-forest)' : 'none', transition: 'background .3s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <m.span
        animate={{ x: on ? (isRTL ? -20 : 20) : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        style={{ display: 'block', width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: 'var(--lg-shadow)' }}
      />
    </button>
  );
}

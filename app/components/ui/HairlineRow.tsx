'use client';

import React from 'react';

interface HairlineRowProps {
  leading?: React.ReactNode;
  children?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  as?: 'button' | 'div';
  disabled?: boolean;
  noRule?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * Hairline list row (HANDOFF rule 4 - rows over cards). Leading stamp/avatar,
 * flexible middle, right-aligned datum, 1px var(--rule) bottom border.
 */
function HairlineRow({
  leading, children, trailing, onClick, as, disabled, noRule, className = '', style,
  'aria-label': ariaLabel,
}: HairlineRowProps) {
  const Tag = (as ?? (onClick ? 'button' : 'div')) as React.ElementType;
  return (
    <Tag
      onClick={onClick}
      disabled={Tag === 'button' ? disabled : undefined}
      aria-label={ariaLabel}
      className={`hairline-row${noRule ? ' no-rule' : ''} ${className}`.trim()}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      {leading != null && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{leading}</span>}
      {children != null && <span style={{ flex: 1, minWidth: 0, display: 'block' }}>{children}</span>}
      {trailing != null && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>{trailing}</span>}
    </Tag>
  );
}
export default React.memo(HairlineRow);

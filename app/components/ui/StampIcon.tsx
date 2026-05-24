'use client';

import React, { CSSProperties } from 'react';
import { STAMP_ICONS } from '@/lib/stampIcons';

interface StampIconProps {
  iconKey: string;
  size?: number;
  style?: CSSProperties;
}

export function StampIcon({ iconKey, size = 48, style = {} }: StampIconProps) {
  const icon = STAMP_ICONS[iconKey];
  if (!icon) {
    // Legacy: DB stored actual emoji characters before stamp keys were introduced
    return (
      <span style={{ fontSize: size * 0.65, lineHeight: 1, display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }}>
        {iconKey}
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="38" fill={icon.bg} />
      <circle cx="40" cy="40" r="34" fill="none" stroke="#F4EFE8" strokeWidth="1" opacity="0.35" />
      <g dangerouslySetInnerHTML={{ __html: icon.sym }} />
    </svg>
  );
}

'use client';

import React from 'react';
import Icon from './Icon';

interface SettingsRowProps {
  icon?: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}

export function SettingsRow({ icon, title, sub, right, onClick }: SettingsRowProps) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', cursor: onClick ? 'pointer' : 'default' }}
    >
      {icon && (
        <span className="lg-btn lg-btn-glass" style={{ width: 38, height: 38, padding: 0, flexShrink: 0 }} aria-hidden="true">
          <Icon name={icon as 'settings'} size={17} color="var(--lg-forest)" />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function SettingsDivider() {
  return <div aria-hidden="true" style={{ height: 1, background: 'oklch(50% 0.02 60 / 10%)' }} />;
}

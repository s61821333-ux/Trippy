import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonCardProps {
  lines?: number;
  height?: number;
  radius?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={styles.line}
          style={{ width: `${70 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonRect({ height = 48, radius = 8, className }: { height?: number; radius?: number; className?: string }) {
  return (
    <div
      className={`${styles.line} ${className ?? ''}`}
      style={{ height, borderRadius: radius, width: '100%' }}
    />
  );
}

export function SkeletonEventCard() {
  return (
    <div className={styles.eventCard}>
      <div className={styles.eventTime} />
      <div className={styles.eventBody}>
        <div className={styles.line} style={{ width: '60%', height: 14 }} />
        <div className={styles.line} style={{ width: '40%', height: 11, marginTop: 6 }} />
      </div>
      <div className={styles.eventChip} />
    </div>
  );
}

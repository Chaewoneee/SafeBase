'use client';

import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  delta?: number;
  color?: 'blue' | 'red' | 'amber' | 'green';
  invertDelta?: boolean;
}

export default function StatCard({
  icon,
  label,
  value,
  delta,
  color = 'blue',
  invertDelta = false,
}: StatCardProps) {
  const isPositiveDelta = delta !== undefined && delta > 0;
  const deltaClass = invertDelta
    ? (isPositiveDelta ? styles.deltaUp : styles.deltaDown)
    : (isPositiveDelta ? styles.deltaUp : styles.deltaDown);

  return (
    <div className={styles.statCard}>
      <div className={`${styles.gradientBar} ${styles[color]}`} />
      <div className={styles.top}>
        <div className={`${styles.icon} ${styles[color]}`}>{icon}</div>
        {delta !== undefined && (
          <span className={`${styles.delta} ${deltaClass}`}>
            {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className={styles.value}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

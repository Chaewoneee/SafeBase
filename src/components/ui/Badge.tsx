import React from 'react';
import styles from './Badge.module.css';
import type { RiskLevel, TransactionStatus, ReportStatus, BlacklistLevel } from '@/types';
import { RISK_LABELS, STATUS_LABELS, REPORT_STATUS_LABELS, BLACKLIST_LEVEL_LABELS } from '@/types';

type BadgeVariant = 'risk' | 'status' | 'reportStatus' | 'blacklist' | 'blacklistLevel' | 'userRole' | 'custom';

interface BadgeProps {
  variant?: BadgeVariant;
  value?: RiskLevel | TransactionStatus | ReportStatus | BlacklistLevel | string;
  label?: string;
  showDot?: boolean;
  className?: string;
}

function getStyleKey(variant: BadgeVariant, value: string): string {
  if (variant === 'custom') return value.toLowerCase();

  const map: Record<string, string> = {
    NORMAL: 'normal', CAUTION: 'caution', WARNING: 'warning', DANGER: 'danger',
    PENDING: 'pending', REVIEWED: 'reviewed', REPORTED: 'reported', DISMISSED: 'dismissed',
    RECEIVED: 'received', INVESTIGATING: 'investigating', RESOLVED: 'resolved', REJECTED: 'rejected',
    WATCH: 'watch', SUSPENDED: 'suspended', BANNED: 'banned',
    ADMIN: 'admin', MANAGER: 'manager', VIEWER: 'viewer',
  };
  return map[value] || 'pending';
}

function getLabel(variant: BadgeVariant, value: string): string {
  switch (variant) {
    case 'risk': return RISK_LABELS[value as RiskLevel] || value;
    case 'status': return STATUS_LABELS[value as TransactionStatus] || value;
    case 'reportStatus': return REPORT_STATUS_LABELS[value as ReportStatus] || value;
    case 'blacklist': return BLACKLIST_LEVEL_LABELS[value as BlacklistLevel] || value;
    case 'blacklistLevel': return BLACKLIST_LEVEL_LABELS[value as BlacklistLevel] || value;
    case 'userRole': return ({ ADMIN: '관리자', MANAGER: '매니저', VIEWER: '뷰어' }[value] || value);
    default: return value;
  }
}

export default function Badge({
  variant = 'custom',
  value = '',
  label,
  showDot = true,
  className = '',
}: BadgeProps) {
  const styleKey = getStyleKey(variant, value);
  const displayLabel = label || getLabel(variant, value);

  const classes = [
    styles.badge,
    styles[styleKey] || styles.pending,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {showDot && <span className={styles.dot} />}
      {displayLabel}
    </span>
  );
}

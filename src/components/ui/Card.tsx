import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  noPadding?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  action,
  hoverable = false,
  clickable = false,
  noPadding = false,
  className = '',
  onClick,
}: CardProps) {
  const classes = [
    styles.card,
    hoverable ? styles.hoverable : '',
    clickable ? styles.clickable : '',
    noPadding ? styles.noPadding : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {(title || action) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

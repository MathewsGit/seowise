import React from 'react';
import styles from './Badge.module.css';

export type Severity = 'pass' | 'warning' | 'fail' | 'notice';

interface BadgeProps {
  severity: Severity;
  label: string;
  className?: string;
}

// Filled circle-check for pass
const PassIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.icon} fill="currentColor" aria-hidden="true">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414 4.243 4.243z"/>
  </svg>
);

// Filled triangle for warning
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.icon} fill="currentColor" aria-hidden="true">
    <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
  </svg>
);

// Filled octagon for fail
const FailIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.icon} fill="currentColor" aria-hidden="true">
    <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM14 16.59L12.59 18 9 14.41 5.41 18 4 16.59 7.59 13 4 9.41 5.41 8 9 11.59 12.59 8 14 9.41 10.41 13 14 16.59z"/>
  </svg>
);

// Filled info circle for notice
const NoticeIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.icon} fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

const Icons = {
  pass: PassIcon,
  warning: WarningIcon,
  fail: FailIcon,
  notice: NoticeIcon,
};

export function Badge({ severity, label, className = '' }: BadgeProps) {
  const Icon = Icons[severity];
  const classNames = [styles.badge, styles[severity], className].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      <Icon />
      {label}
    </span>
  );
}
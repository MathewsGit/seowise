'use client';

import React from 'react';
import styles from './IssueCard.module.css';

export type Severity = 'pass' | 'warning' | 'fail' | 'notice';

interface IssueCardProps {
  severity: Severity;
  title: string;
  urlCount: number;
  summary: string;
  onClick: () => void;
}

// Re-using the filled icon shapes per spec
const Icons = {
  pass: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414 4.243 4.243z"/></svg>,
  warning: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>,
  fail: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM14 16.59L12.59 18 9 14.41 5.41 18 4 16.59 7.59 13 4 9.41 5.41 8 9 11.59 12.59 8 14 9.41 10.41 13 14 16.59z"/></svg>,
  notice: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
};

const SeverityColors: Record<Severity, string> = {
  pass: 'var(--signal-teal)',
  warning: 'var(--signal-violet)',
  fail: 'var(--signal-coral)',
  notice: 'var(--signal-blue)',
};

export function IssueCard({ severity, title, urlCount, summary, onClick }: IssueCardProps) {
  const Icon = Icons[severity];
  
  return (
    <button 
      type="button" 
      className={styles.card} 
      onClick={onClick}
      style={{ '--severity-color': SeverityColors[severity] } as React.CSSProperties}
    >
      <div className={styles.iconWrapper}>
        <Icon />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <span className={styles.urlCount}>{urlCount} URL{urlCount !== 1 ? 's' : ''}</span>
        </div>
        <span className={styles.summary}>{summary}</span>
      </div>
      <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  );
}
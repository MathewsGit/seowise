'use client';

import React from 'react';
import styles from './ErrorCard.module.css';
import { Button } from './Button';

interface ErrorCardProps {
  statusCode: number | string;
  url: string;
  onRetry: () => void;
}

function truncateMiddle(str: string, maxLength: number = 60) {
  if (str.length <= maxLength) return str;
  const charsToShow = maxLength - 3;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return str.substring(0, frontChars) + '...' + str.substring(str.length - backChars);
}

export function ErrorCard({ statusCode, url, onRetry }: ErrorCardProps) {
  return (
    <div className={styles.card} role="listitem">
      <span className={styles.statusCode} aria-label={`HTTP Status ${statusCode}`}>
        {statusCode}
      </span>
      
      <span className={styles.url} title={url}>
        {truncateMiddle(url)}
      </span>
      
      <div className={styles.retryButton}>
        <Button variant="tertiary" size="sm" onClick={onRetry}>
          Retry this page
        </Button>
      </div>
    </div>
  );
}
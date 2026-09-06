'use client';

import React from 'react';
import styles from './MetricCard.module.css';
import { ScoreGauge } from './ScoreGauge';

interface MetricCardProps {
  label: string;
  score: number | null;
  delta?: number; // E.g., +4 or -2
}

export function MetricCard({ label, score, delta }: MetricCardProps) {
  return (
    <div className={styles.card}>
      <ScoreGauge score={score} label={label} />
      
      <div className={styles.deltaContainer} aria-hidden={!delta}>
        {delta !== undefined && delta !== 0 && (
          <span className={delta > 0 ? styles.deltaPositive : styles.deltaNegative}>
            {delta > 0 ? '+' : ''}{delta} since last scan
          </span>
        )}
      </div>
    </div>
  );
}
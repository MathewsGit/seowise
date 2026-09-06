'use client';

import React, { useEffect, useState } from 'react';
import styles from './BarChart.module.css';

export interface BarDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  colorHex?: string; // Optional override for severity charts
  ariaLabel: string;
}

export function BarChart({ data, colorHex, ariaLabel }: BarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={styles.container} role="img" aria-label={ariaLabel}>
      {/* Hidden text summary for screen readers */}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {data.map(d => `${d.label}: ${d.value}`).join('. ')}
      </span>

      {data.map((item, index) => {
        const widthPct = (item.value / maxValue) * 100;
        const targetWidth = isMounted ? `${widthPct}%` : '0%';

        return (
          <div key={index} className={styles.row} aria-hidden="true">
            <span className={styles.label} title={item.label}>
              {item.label}
            </span>
            <div className={styles.barTrack}>
              <div 
                className={styles.barFill} 
                style={{ 
                  width: targetWidth, 
                  backgroundColor: colorHex || undefined 
                }} 
              />
              <span className={styles.value}>{item.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import styles from './CoreWebVitalsGauge.module.css';

interface CWVGaugeProps {
  metric: 'LCP' | 'INP' | 'CLS';
  value: number;
  formattedValue: string; // e.g. "2.4s" or "150ms"
  thresholdGood: number;
  thresholdPoor: number;
  maxAxisValue: number; // For scaling the needle calculation
  history?: number[]; // Up to 8 points for the sparkline
}

export function CoreWebVitalsGauge({ 
  metric, value, formattedValue, thresholdGood, thresholdPoor, maxAxisValue, history 
}: CWVGaugeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Calculate SVG stroke-dasharrays based on thresholds
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // full circle ~314.16
  const semiCircle = circumference / 2; // 180 degrees ~157.08

  // Calculate percentages (clamped to 100%)
  const goodPct = Math.min(thresholdGood / maxAxisValue, 1);
  const poorPct = Math.min(thresholdPoor / maxAxisValue, 1);
  
  // Needle calculation (maps 0 to maxAxisValue onto a -90 to 90 degree rotation)
  const clampedValue = Math.min(Math.max(value, 0), maxAxisValue);
  const valuePct = clampedValue / maxAxisValue;
  // CSS transform rotate starts at -90deg (far left) to 90deg (far right)
  const targetRotation = -90 + (valuePct * 180); 
  const currentRotation = isMounted ? targetRotation : -90;

  // Generate sparkline path if history exists
  const generateSparkline = () => {
    if (!history || history.length < 2) return null;
    const maxVal = Math.max(...history);
    const minVal = Math.min(...history);
    const range = maxVal - minVal || 1; // avoid div by zero
    
    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * 140; // width 140
      const y = 24 - (((val - minVal) / range) * 20 + 2); // height 24, 2px padding
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className={styles.sparklineSvg} viewBox="0 0 140 24" aria-hidden="true">
        <polyline points={points} className={styles.sparklinePath} />
      </svg>
    );
  };

  return (
    <div className={styles.container}>
      <span className={styles.srOnly}>
        {metric} is {formattedValue}.
      </span>
      
      <div className={styles.gaugeWrapper} aria-hidden="true">
        <svg className={styles.svg} viewBox="0 0 120 120">
          {/* Base track: Poor (Coral) - drawn full length */}
          <circle 
            className={`${styles.band} ${styles.bandPoor}`}
            cx="60" cy="60" r={radius}
            strokeDasharray={`${semiCircle} ${circumference}`}
            strokeDashoffset="0"
          />
          {/* Middle track: Needs Improvement (Violet) */}
          <circle 
            className={`${styles.band} ${styles.bandNeedsImprovement}`}
            cx="60" cy="60" r={radius}
            strokeDasharray={`${semiCircle * poorPct} ${circumference}`}
            strokeDashoffset="0"
          />
          {/* Top track: Good (Teal) */}
          <circle 
            className={`${styles.band} ${styles.bandGood}`}
            cx="60" cy="60" r={radius}
            strokeDasharray={`${semiCircle * goodPct} ${circumference}`}
            strokeDashoffset="0"
          />
        </svg>
        
        {/* Needle pointer */}
        <div 
          className={styles.needle} 
          style={{ transform: `translateX(-50%) rotate(${currentRotation}deg)` }}
        />
        <div className={styles.needleBase} />
      </div>

      <div className={styles.labelWrapper}>
        <div className={styles.metricValue}>{formattedValue}</div>
        <div className={styles.metricName}>{metric}</div>
      </div>

      {generateSparkline()}
    </div>
  );
}
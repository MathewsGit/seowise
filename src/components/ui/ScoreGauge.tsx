'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './ScoreGauge.module.css';

interface ScoreGaugeProps {
  score: number | null; // null represents "Not scanned"
  label: string;
}

export function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  // SVG Math for 270 degree sweep
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.3
  const maxDash = circumference * 0.75; // 270 degrees = 75% of circle
  
  const actualScore = score === null ? 0 : score;
  const targetDash = (actualScore / 100) * maxDash;
  
  // Color band logic
  let colorClass = styles.muted;
  if (score !== null) {
    if (score < 50) colorClass = styles.coral;
    else if (score < 80) colorClass = styles.violet;
    else colorClass = styles.teal;
  }

  // Handle the count-up animation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (score === null || prefersReducedMotion) {
      setDisplayScore(actualScore);
      return;
    }

    let startTimestamp: number;
    const duration = 900; // 900ms per spec

    // Ease-out expo function mapped for the number counter
    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const currentEasedProgress = easeOutExpo(progress);
      setDisplayScore(Math.floor(currentEasedProgress * actualScore));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [score, actualScore]);

  return (
    <div 
      className={styles.gaugeContainer}
      role="progressbar"
      aria-valuenow={score !== null ? score : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className={styles.srOnly}>
        {score !== null ? `${label} score is ${score} out of 100` : `${label} was not scanned`}
      </span>
      
      <svg className={styles.svg} viewBox="0 0 100 100">
        {/* Background Track */}
        <circle 
          className={styles.track}
          cx="50" 
          cy="50" 
          r={radius}
          strokeDasharray={`${maxDash} ${circumference}`}
        />
        {/* Fill Arc */}
        <circle 
          className={`${styles.fill} ${colorClass}`}
          cx="50" 
          cy="50" 
          r={radius}
          strokeDasharray={`${isMounted ? targetDash : 0} ${circumference}`}
        />
      </svg>
      
      <div className={styles.centerContent} aria-hidden="true">
        <span className={styles.scoreText}>
          {score !== null ? displayScore : '—'}
        </span>
        <span className={styles.labelText}>
          {label}
        </span>
      </div>
    </div>
  );
}
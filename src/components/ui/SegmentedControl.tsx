'use client';

import React from 'react';
import styles from './SegmentedControl.module.css';

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

export function SegmentedControl({ options, value, onChange, ariaLabel }: SegmentedControlProps) {
  const shouldStackOnMobile = options.length >= 3;
  
  return (
    <div 
      className={`${styles.container} ${shouldStackOnMobile ? styles.stackable : ''}`}
      role="group" 
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`${styles.segment} ${isActive ? styles.active : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
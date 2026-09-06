'use client';

import React, { ButtonHTMLAttributes } from 'react';
import styles from './Toggle.module.css';

interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string; // Required for accessibility when no visible label exists
}

export function Toggle({ checked, onChange, ariaLabel, className = '', ...props }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`${styles.toggle} ${className}`.trim()}
      onClick={() => onChange(!checked)}
      {...props}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  );
}
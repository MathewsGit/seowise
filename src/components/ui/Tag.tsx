'use client';

import React, { ButtonHTMLAttributes } from 'react';
import styles from './Tag.module.css';

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive?: boolean;
}

export function Tag({ label, isActive = false, className = '', ...props }: TagProps) {
  const classNames = [
    styles.tag,
    isActive ? styles.active : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classNames}
      aria-pressed={isActive}
      {...props}
    >
      {label}
    </button>
  );
}
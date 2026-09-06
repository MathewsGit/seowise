'use client';

import React, { InputHTMLAttributes, useState } from 'react';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  size?: 'md' | 'lg';
}

const GlobeIcon = () => (
  <svg 
    className={styles.icon} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="square" 
    strokeLinejoin="round" 
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export function Input({
  label,
  helperText,
  type = 'text',
  size = 'md',
  className = '',
  onBlur,
  ...props
}: InputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  
  const isUrl = type === 'url';
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isUrl) {
      const val = e.target.value;
      if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
        setInternalError('Add https:// to continue');
      } else {
        setInternalError(null);
      }
    }
    
    // Call the external onBlur if passed
    if (onBlur) {
      onBlur(e);
    }
  };

  const inputClassNames = [
    styles.input,
    size === 'md' ? styles.inputMd : styles.inputLg,
    isUrl ? styles.monospace : '',
    isUrl ? styles.withIcon : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.container}>
      {label && <label className={styles.label} htmlFor={props.id}>{label}</label>}
      
      <div className={styles.inputWrapper}>
        {isUrl && <GlobeIcon />}
        <input
          type={type}
          className={inputClassNames}
          onBlur={handleBlur}
          {...props}
        />
      </div>

      {internalError ? (
        <span className={styles.errorText} role="alert">{internalError}</span>
      ) : helperText ? (
        <span className={styles.helperText}>{helperText}</span>
      ) : null}
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export type ToastVariant = 'success' | 'warning' | 'error';

interface ToastProps {
  variant: ToastVariant;
  message: string;
  onDismiss: () => void;
}

// Re-using the filled shape icons
const Icons = {
  success: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414 4.243 4.243z"/></svg>,
  warning: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>,
  error: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM14 16.59L12.59 18 9 14.41 5.41 18 4 16.59 7.59 13 4 9.41 5.41 8 9 11.59 12.59 8 14 9.41 10.41 13 14 16.59z"/></svg>,
};

export function Toast({ variant, message, onDismiss }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onDismiss, 160); // Match CSS fadeOut duration
  };

  useEffect(() => {
    if (variant === 'success') {
      const timer = setTimeout(handleClose, 4000);
      return () => clearTimeout(timer);
    }
    // Warning and Error do not auto-dismiss
  }, [variant]);

  const Icon = Icons[variant];
  const role = variant === 'success' ? 'status' : 'alert';

  return (
    <div className={styles.toastWrapper}>
      <div className={`${styles.toast} ${styles[variant]} ${isClosing ? styles.closing : ''}`} role={role}>
        <div className={styles.iconWrapper}>
          <Icon />
        </div>
        <div className={styles.content}>{message}</div>
        <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="Dismiss message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
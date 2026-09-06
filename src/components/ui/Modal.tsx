'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './Modal.module.css';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';

// --- BASE MODAL LOGIC ---
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBusy?: boolean;
  busyMessage?: string;
  size?: 'sm' | 'lg';
  children: React.ReactNode;
  ariaLabel: string;
}

function BaseModal({ isOpen, onClose, isBusy = false, busyMessage, size = 'sm', children, ariaLabel }: BaseModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (isBusy) return; // Prevent closing if action in progress
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // Matches the 200ms animation duration
  }, [isBusy, onClose]);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
      
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus first element on mount
    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>('button, input');
      focusable?.focus();
    }, 10);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div 
        className={`${styles.backdrop} ${isClosing ? styles.closing : ''}`} 
        onClick={handleClose} 
        aria-hidden="true" 
      />
      <div 
        ref={panelRef}
        className={`${styles.panel} ${styles[`size-${size}`]} ${isClosing ? styles.closing : ''}`}
      >
        {children}
        {isBusy && busyMessage && (
          <div className={styles.footer} style={{ paddingTop: 0 }}>
            <span className={styles.busyMessage} role="alert">{busyMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}


// --- INFO MODAL VARIANT ---
interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export function InfoModal({ isOpen, onClose, title, content, primaryActionLabel, onPrimaryAction }: InfoModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="sm" ariaLabel={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.body}>{content}</div>
      <div className={styles.footer}>
        <Button variant="tertiary" onClick={onClose}>Close</Button>
        {primaryActionLabel && onPrimaryAction && (
          <Button variant="primary" onClick={onPrimaryAction}>{primaryActionLabel}</Button>
        )}
      </div>
    </BaseModal>
  );
}


// --- WARNING/CONFIRMATION MODAL VARIANT ---
interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  destructiveActionLabel: string;
  onDestructiveAction: () => void;
}

export function WarningModal({ isOpen, onClose, title, content, destructiveActionLabel, onDestructiveAction }: WarningModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="sm" ariaLabel={title}>
      <div className={styles.header}>
        <div className={styles.headerIconWarning}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
          </svg>
        </div>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.body}>{content}</div>
      <div className={styles.footer}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onDestructiveAction}>{destructiveActionLabel}</Button>
      </div>
    </BaseModal>
  );
}


// --- EXPORT MODAL VARIANT ---
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExporting: boolean;
  onExport: (format: string) => void;
}

export function ExportModal({ isOpen, onClose, isExporting, onExport }: ExportModalProps) {
  const [format, setFormat] = useState('pdf');

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      ariaLabel="Export Report" 
      isBusy={isExporting} 
      busyMessage="Export in progress. Please wait..."
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Export Report</h2>
      </div>
      <div className={styles.body}>
        <div className={styles.exportContent}>
          <div className={styles.exportSection}>
            <span className={styles.exportLabel}>Format</span>
            <SegmentedControl 
              options={[
                { label: 'PDF Document', value: 'pdf' },
                { label: 'CSV Spreadsheet', value: 'csv' },
                { label: 'Raw JSON', value: 'json' }
              ]}
              value={format}
              onChange={setFormat}
              ariaLabel="Export format"
            />
          </div>
          
          <div className={styles.exportSection}>
            <span className={styles.exportLabel}>Preview</span>
            <div className={styles.previewPlaceholder} aria-hidden="true">
              Preview generation for {format.toUpperCase()}...
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <Button variant="tertiary" onClick={onClose} disabled={isExporting}>Cancel</Button>
        <Button variant="primary" onClick={() => onExport(format)} isLoading={isExporting}>
          Export report
        </Button>
      </div>
    </BaseModal>
  );
}
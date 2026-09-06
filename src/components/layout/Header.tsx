'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { Button } from '../ui/Button';

// SVG Logo Mark (Stylized Waveform Tick)
const LogoMark = () => (
  <svg className={styles.logoMark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trap focus for simple mobile drawer closing
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.left}>
          <Link href="/" className={styles.logoArea}>
            <LogoMark />
            <span className={styles.wordmark}>SEOwise</span>
          </Link>
          
          <nav className={styles.nav} aria-label="Main navigation">
            <Link href="/#how-it-works" className={styles.navLink}>How it works</Link>
            <Link href="/about" className={styles.navLink}>About</Link>
          </nav>
        </div>

        <div className={styles.right}>
          <Link href="/audit">
            <Button variant="primary" size="sm">Start audit</Button>
          </Link>
        </div>

        <button 
          className={styles.mobileMenuBtn} 
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {mobileMenuOpen && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className={styles.drawerHeader}>
              <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className={styles.drawerNav}>
              <Link href="/#how-it-works" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>How it works</Link>
              <Link href="/about" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="/audit" className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--signal-amber)' }}>Start audit</Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
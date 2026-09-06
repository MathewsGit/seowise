import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.column}>
          <h3 className={styles.heading}>Product</h3>
          <ul className={styles.linkList}>
            <li><Link href="/audit" className={styles.link}>New Audit</Link></li>
            <li><Link href="/#features" className={styles.link}>Features</Link></li>
            <li><Link href="/#how-it-works" className={styles.link}>How it works</Link></li>
          </ul>
        </div>
        
        <div className={styles.column}>
          <h3 className={styles.heading}>Resources</h3>
          <ul className={styles.linkList}>
            <li><Link href="/about" className={styles.link}>About</Link></li>
            <li><Link href="/docs" className={styles.link}>Documentation</Link></li>
            <li><Link href="/privacy" className={styles.link}>Privacy</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.heading}>Open-source</h3>
          <ul className={styles.linkList}>
            <li><a href="https://github.com/open-seo" target="_blank" rel="noopener noreferrer" className={styles.link}>open-seo Engine</a></li>
            <li><a href="https://github.com/open-seo/signalscan" target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub Repository</a></li>
            <li><Link href="/about#open-source" className={styles.link}>Transparency details</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copyright}>© {new Date().getFullYear()} SEOwise. All rights reserved.</span>
        <span className={styles.credit}>
          Powered by the <a href="https://github.com/open-seo" target="_blank" rel="noopener noreferrer" className={styles.creditLink}>open-seo</a> engine.
        </span>
      </div>
    </footer>
  );
}
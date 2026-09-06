'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export default function SettingsPage() {
  // Appearance State
  const [theme, setTheme] = useState('dark');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [appearanceSaved, setAppearanceSaved] = useState(false);

  // Audit Defaults State
  const [defaultDepth, setDefaultDepth] = useState('standard');
  const [defaultSpeed, setDefaultSpeed] = useState('standard');
  const [defaultDevice, setDefaultDevice] = useState('desktop');
  const [auditSaved, setAuditSaved] = useState(false);

  // Helper to trigger inline saved state
  const triggerSave = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className={`${styles.pageWrapper} light-theme`}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backLink}>← Back</Link>
        <h1 className={styles.pageTitle}>Settings</h1>
      </header>

      <main className={styles.main}>
        {/* Appearance Card */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Appearance</h2>
            <span className={`${styles.savedToast} ${appearanceSaved ? styles.visible : ''}`} aria-live="polite">
              Saved
            </span>
          </div>

          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>Light Theme</div>
              <div className={styles.settingDesc}>Use light surfaces universally (Overrides shell defaults)</div>
            </div>
            <Toggle 
              checked={theme === 'light'} 
              onChange={(c) => { setTheme(c ? 'light' : 'dark'); triggerSave(setAppearanceSaved); }} 
              ariaLabel="Toggle light theme"
            />
          </div>

          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>Reduce Motion</div>
              <div className={styles.settingDesc}>Disable sweep animations and force graph physics</div>
            </div>
            <Toggle 
              checked={reducedMotion} 
              onChange={(c) => { setReducedMotion(c); triggerSave(setAppearanceSaved); }} 
              ariaLabel="Toggle reduced motion"
            />
          </div>
        </section>

        {/* Audit Defaults Card */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Audit defaults</h2>
            <span className={`${styles.savedToast} ${auditSaved ? styles.visible : ''}`} aria-live="polite">
              Saved
            </span>
          </div>

          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>Default Device Mode</div>
            </div>
            <div style={{ width: '200px' }}>
              <SegmentedControl 
                options={[ { label: 'Desktop', value: 'desktop' }, { label: 'Mobile', value: 'mobile' } ]}
                value={defaultDevice}
                onChange={(v) => { setDefaultDevice(v); triggerSave(setAuditSaved); }}
                ariaLabel="Default device mode"
              />
            </div>
          </div>

          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>Default Crawl Speed</div>
            </div>
            <div style={{ width: '200px' }}>
              <Select
                options={[
                  { label: 'Careful', value: 'careful' },
                  { label: 'Standard', value: 'standard' },
                  { label: 'Fast', value: 'fast' }
                ]}
                value={defaultSpeed}
                onChange={(v) => { setDefaultSpeed(v); triggerSave(setAuditSaved); }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
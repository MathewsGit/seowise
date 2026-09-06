'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

// SVG Logo Mark for minimal header
const LogoMark = () => (
  <svg className={styles.logoMark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
);

function AuditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [url, setUrl] = useState('');
  const [device, setDevice] = useState('desktop');
  const [depth, setDepth] = useState('standard');
  const [speed, setSpeed] = useState('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill URL from query string if available
  useEffect(() => {
    const queryUrl = searchParams.get('url');
    if (queryUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(queryUrl);
    }
  }, [searchParams]);

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsSubmitting(true);
    
    // Simulate job API call and redirect to Loading screen
    // In reality, this would submit to the open-seo engine and return a jobId
    const query = new URLSearchParams({
      url,
      device,
      depth,
      speed
    }).toString();
    
    router.push(`/loading?${query}`);
  };

  return (
    <form className={`${styles.card} light-theme`} onSubmit={handleStartAudit}>
      <Input
        type="url"
        size="lg"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        autoFocus
        required
        aria-label="Website URL to audit"
      />

      <div className={styles.formGroup}>
        <span className={styles.groupLabel} id="device-label">Device mode</span>
        <SegmentedControl
          options={[
            { label: 'Desktop', value: 'desktop' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Both', value: 'both' }
          ]}
          value={device}
          onChange={setDevice}
          ariaLabel="Select device mode"
        />
      </div>

      <div className={styles.formGroup}>
        <span className={styles.groupLabel}>Audit depth</span>
        <Select
          options={[
            { label: 'Quick scan (homepage only)', value: 'quick' },
            { label: 'Standard (up to 25 pages)', value: 'standard' },
            { label: 'Deep (up to 200 pages)', value: 'deep' }
          ]}
          value={depth}
          onChange={setDepth}
        />
      </div>

      <div className={styles.formGroup}>
        <span className={styles.groupLabel}>Crawl speed</span>
        <Select
          options={[
            { label: 'Careful (Low impact)', value: 'careful' },
            { label: 'Standard (Recommended)', value: 'standard' },
            { label: 'Fast (High impact)', value: 'fast' }
          ]}
          value={speed}
          onChange={setSpeed}
        />
        <span className={styles.note}>
          Faster crawls finish sooner but may put higher load on the target server.
        </span>
      </div>

      <div className={styles.submitWrapper}>
        <Button type="submit" size="lg" variant="primary" isLoading={isSubmitting}>
          Start audit
        </Button>
      </div>
    </form>
  );
}

export default function AuditPage() {
  return (
    <div className={styles.pageWrapper}>
      <header className={styles.minimalHeader}>
        <Link href="/" className={styles.logoArea}>
          <LogoMark />
          <span className={styles.wordmark}>SEOwise</span>
        </Link>
      </header>

      <main className={styles.main}>
        {/* Suspense boundary required when using useSearchParams in Next.js App Router */}
        <Suspense fallback={<div className={styles.card} style={{ height: '400px' }} />}>
          <AuditForm />
        </Suspense>

        <div className={styles.tipsContainer}>
          <h2 className={styles.tipsTitle}>Pre-audit tips</h2>
          <ul className={styles.tipsList}>
            <li className={styles.tipItem}>Make sure your site is publicly reachable — we can&apos;t audit password-protected or local pages.</li>
            <li className={styles.tipItem}>Ensure your robots.txt allows our engine to crawl your specified scope.</li>
            <li className={styles.tipItem}>Include https:// in your URL for accurate protocol evaluation.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
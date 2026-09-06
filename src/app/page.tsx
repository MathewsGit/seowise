'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroWaveform } from '@/components/layout/HeroWaveform';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Pass the URL via query param to the Audit Input screen
      router.push(`/audit?url=${encodeURIComponent(url)}`);
    } else {
      router.push('/audit');
    }
  };

  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <HeroWaveform />
          <div className={styles.heroContent}>
            <h1 className={`${styles.heroHeadline} display-xl`}>
              See what search engines see.
            </h1>
            <p className={`${styles.heroSubhead} body-lg`}>
              A diagnostic instrument for technical SEO. SignalScan reads your website the way a technician reads a waveform, providing unfiltered insights and actionable fixes.
            </p>
            
            <form className={styles.heroForm} onSubmit={handleStartAudit}>
              <Input 
                type="url"
                size="lg"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="Website URL"
                required
              />
              <Button type="submit" size="lg" variant="primary">
                Start audit
              </Button>
            </form>
          </div>
        </section>

        {/* FEATURES HIGHLIGHTS */}
        <section id="features" className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <h3 className={`${styles.featureTitle} heading-md`}>Technical depth</h3>
              <p className={`${styles.featureBody} body-md`}>
                Deep crawl diagnostics examining canonicals, structured data, and hierarchy without the marketing fluff.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3 className={`${styles.featureTitle} heading-md`}>Real Core Web Vitals</h3>
              <p className={`${styles.featureBody} body-md`}>
                Integrated Lighthouse scoring mapped directly to Google&apos;s official LCP, INP, and CLS threshold bands.
              </p>
            </div>

            <div className={styles.featureCard}>
              <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <h3 className={`${styles.featureTitle} heading-md`}>Open-source engine</h3>
              <p className={`${styles.featureBody} body-md`}>
                Built on the transparent open-seo project. We don&apos;t hide our scoring logic behind a black box.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className={styles.howItWorksSection}>
          <div className={styles.howItWorksContent}>
            <h2 className="heading-lg">How it works</h2>
            <div className={styles.howItWorksStrip}>
              
              <div className={styles.step}>
                <span className={styles.stepNumber}>01</span>
                <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-9 9H7V9h5v2zm5-4H7V5h10v2z" />
                </svg>
                <p className={styles.stepText}>Enter URL to define the scope and initial entry point.</p>
              </div>

              <div className={styles.step}>
                <span className={styles.stepNumber}>02</span>
                <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                </svg>
                <p className={styles.stepText}>Engine crawls the pages applying specified depth limits.</p>
              </div>

              <div className={styles.step}>
                <span className={styles.stepNumber}>03</span>
                <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <p className={styles.stepText}>We analyze the structure, rendering, and meta signals.</p>
              </div>

              <div className={styles.step}>
                <span className={styles.stepNumber}>04</span>
                <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className={styles.stepText}>You get actionable fixes mapped directly to the raw data.</p>
              </div>

            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className={styles.ctaSection}>
          <h2 className={`${styles.ctaHeadline} display-lg`}>Ready to scan?</h2>
          <form className={styles.ctaForm} onSubmit={handleStartAudit}>
            <Input 
              type="url"
              size="lg"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-label="Website URL"
              required
            />
            <Button type="submit" size="lg" variant="primary">
              Start audit
            </Button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
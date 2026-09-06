'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Accordion } from '@/components/ui/Accordion';

export default function AboutPage() {
  const faqItems = [
    {
      id: 'faq1',
      title: 'Does this affect my site\'s SEO?',
      content: 'No. Running an audit using SEOwise acts identically to a normal user or search engine visiting your site. It does not alter your live site data, and merely observing the site does not positively or negatively impact your existing rankings.'
    },
    {
      id: 'faq2',
      title: 'Do you store my audit results?',
      content: 'Audit results are strictly temporary and generated in real-time. We do not persist your parsed HTML or resulting scores to a database. If you wish to save your report, use the Export function in the Dashboard to download a PDF or JSON file.'
    }
  ];

  return (
    <div className={`${styles.pageWrapper} light-theme`}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>← Home</Link>
        <Link href="/" className={styles.logoArea}>
          <span className={styles.wordmark}>SEOwise</span>
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={`${styles.pageTitle} display-lg`}>About SEOwise</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What SEOwise does</h2>
          <p className={`${styles.bodyText} body-lg`}>
            SEOwise is a diagnostic instrument designed for technical SEO. It reads your website exactly the way a search engine spider does—without executing unnecessary client-side marketing scripts, and without dressing up the data. We prioritize raw, unfiltered truth about your metadata, page structure, and performance capabilities over gamified scores.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How the open-seo engine works</h2>
          <p className={`${styles.bodyText} body-lg`}>
            Under the hood, SEOwise is powered by the open-source <strong>open-seo</strong> engine. When you request an audit, the engine fetches your URL and respects your <span className={styles.codeBlock}>robots.txt</span> directives. It extracts DOM nodes, evaluates structured JSON-LD data, and maps network-level responses into the reports you see. Performance metrics are derived through an integrated headless Lighthouse runner, mapped exactly to Google&apos;s official Core Web Vitals thresholds.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Privacy notes</h2>
          <p className={`${styles.bodyText} body-lg`}>
            We value data minimalization. The content we crawl from your pages is processed in-memory to generate your report and is discarded immediately after the session ends. We do not sell your domain data to third-party data brokers, nor do we use your site&apos;s proprietary data to train generalized AI models.
          </p>
        </section>

        <section className={styles.section} id="open-source">
          <h2 className={styles.sectionTitle}>Open-source credit</h2>
          <p className={`${styles.bodyText} body-lg`}>
            Transparency is central to our philosophy. SEOwise operates as a commercial frontend, but the heavy lifting of the crawling and scoring heuristics is performed by the open-seo project. You can inspect the engine, verify our claims, and contribute to the code on the <a href="https://github.com/open-seo" target="_blank" rel="noopener noreferrer" className={styles.link}>open-seo GitHub repository</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <Accordion items={faqItems} allowMultiple />
        </section>
      </main>
    </div>
  );
}
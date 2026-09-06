'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Accordion } from '@/components/ui/Accordion';

export default function IssueDetailPage() {
  const affectedUrls = [
    { id: '1', url: 'https://example.com/blog/article-1' },
    { id: '2', url: 'https://example.com/blog/article-2' },
  ];

  const columns: Column<typeof affectedUrls[0]>[] = [
    {
      key: 'url',
      label: 'Affected URL',
      isMonospace: true,
      render: (row) => (
        <a href={row.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--signal-amber)', textDecoration: 'none' }}>
          {row.url} ↗
        </a>
      )
    }
  ];

  const fixSteps = [
    {
      id: 'step1',
      title: '1. Identify the missing tag',
      content: 'Review the <head> section of the affected URLs. You will notice the <title> element is either completely missing or empty.'
    },
    {
      id: 'step2',
      title: '2. Add a descriptive title',
      content: (
        <>
          Insert a unique, descriptive title inside the document head. Ensure it is between 50-60 characters for optimal SERP display.
          <pre className={styles.codeSnippet}>
            {`<!DOCTYPE html>\n<html>\n  <head>\n    <title>Optimal Page Title Here | Brand</title>\n  </head>\n</html>`}
          </pre>
        </>
      )
    }
  ];

  return (
    <div className={`${styles.pageWrapper} light-theme`}>
      <main className={styles.panel}>
        <header className={styles.header}>
          <Link href="/dashboard" className={styles.breadcrumb}>← Back to issues</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Missing Title Tag</h1>
            <div className={styles.badgeGroup}>
              <Badge severity="fail" label="Critical" />
              <Tag label="Metadata" />
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.titleRow}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <div className={styles.tooltipWrapper} data-tooltip="Based on Critical severity × 2 affected URLs">
                <Badge severity="notice" label="Priority: Fix first" />
              </div>
            </div>
            <p className={styles.description}>
              The <code>&lt;title&gt;</code> tag is a crucial on-page SEO factor. It tells search engines and users what the page is about. Pages without a title tag may struggle to rank and will display sub-optimally in search results, often forcing the search engine to generate a title from on-page text.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Affected URLs ({affectedUrls.length})</h2>
            <DataTable columns={columns} data={affectedUrls} ariaLabel="Affected URLs table" />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Steps to fix</h2>
            <Accordion items={fixSteps} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Visual Example</h2>
            <div className={styles.visualPlaceholder} aria-hidden="true">
              [ SERP Snippet Preview: Truncated vs properly-sized title ]
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
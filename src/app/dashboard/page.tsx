'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { Tabs } from '@/components/ui/Tabs';
import { DataTable } from '@/components/ui/DataTable';
import { Tag } from '@/components/ui/Tag';
import { CoreWebVitalsGauge } from '@/components/charts/CoreWebVitalsGauge';
import { ForceGraph } from '@/components/charts/ForceGraph';
import { ExportModal } from '@/components/ui/Modal';
import { IssueCard } from '@/components/ui/IssueCard';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'technical', label: 'Technical' },
  { id: 'onpage', label: 'On-page' },
  { id: 'performance', label: 'Performance' },
  { id: 'issues', label: 'Issues' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportOpen(false);
      alert(`Exported as ${format.toUpperCase()}`);
    }, 1500);
  };

  return (
    // The `light-theme` class applies global CSS overrides for paper-050 backgrounds
    <div className={`${styles.pageWrapper} light-theme`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/audit" className={styles.breadcrumb}>← New audit</Link>
          <h1 className={styles.domainTitle}>
            example.com
            <Badge severity="notice" label="Desktop mode" />
          </h1>
          <span className={styles.timestamp}>Scanned on {new Date().toLocaleString()}</span>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="sm">Re-run</Button>
          <Button variant="primary" size="sm" onClick={() => setIsExportOpen(true)}>Export</Button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Tablet Tabs */}
        <div className={styles.navContainer}>
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Dashboard sections" />
        </div>

        {/* Desktop Left Rail */}
        <nav className={styles.leftRail} aria-label="Sidebar navigation">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              className={`${styles.railLink} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className={styles.mainContent}>
          
          {/* Always show Score Row at the top */}
          <section className={styles.section}>
            <div className={styles.scoreRow}>
              <MetricCard label="Overall" score={78} delta={2} />
              <MetricCard label="Technical" score={92} delta={0} />
              <MetricCard label="On-page" score={65} delta={-4} />
              <MetricCard label="Performance" score={81} delta={12} />
              <MetricCard label="Accessibility" score={98} />
              <MetricCard label="Mobile" score={null} />
            </div>
          </section>

          {/* Conditional Sections based on active tab */}
          {(activeTab === 'overview' || activeTab === 'performance') && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Core Web Vitals</h2>
              <div className={styles.cwvGrid}>
                <CoreWebVitalsGauge 
                  metric="LCP" value={2.1} formattedValue="2.1s"
                  thresholdGood={2.5} thresholdPoor={4.0} maxAxisValue={6.0}
                  history={[3.2, 2.8, 2.9, 2.4, 2.1, 2.1]} 
                />
                <CoreWebVitalsGauge 
                  metric="INP" value={180} formattedValue="180ms"
                  thresholdGood={200} thresholdPoor={500} maxAxisValue={800}
                  history={[240, 210, 190, 195, 180, 180]} 
                />
                <CoreWebVitalsGauge 
                  metric="CLS" value={0.34} formattedValue="0.34"
                  thresholdGood={0.1} thresholdPoor={0.25} maxAxisValue={0.5}
                  history={[0.12, 0.15, 0.28, 0.35, 0.34, 0.34]} 
                />
              </div>
            </section>
          )}

          {(activeTab === 'overview' || activeTab === 'technical') && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Internal Link Map</h2>
              <div className={styles.mapContainer}>
                <p className={styles.mobileTableWarning}>Graph visualization is disabled on small screens to ensure usability. View the data table below.</p>
                <div className={styles.hideOnMobile}>
                  <ForceGraph 
                    ariaLabel="Internal link topology graph"
                    nodes={[
                      { url: 'https://example.com/', status: 200, inbound: 45, outbound: 12, isCenter: true },
                      { url: 'https://example.com/about', status: 200, inbound: 12, outbound: 4 },
                      { url: 'https://example.com/contact', status: 301, inbound: 8, outbound: 1 },
                      { url: 'https://example.com/blog', status: 200, inbound: 22, outbound: 5 },
                      { url: 'https://example.com/old-page', status: 404, inbound: 3, outbound: 0 },
                    ]}
                    links={[
                      { source: 'https://example.com/', target: 'https://example.com/about' },
                      { source: 'https://example.com/', target: 'https://example.com/contact' },
                      { source: 'https://example.com/', target: 'https://example.com/blog' },
                      { source: 'https://example.com/about', target: 'https://example.com/old-page' },
                    ]}
                    onNodeClick={(url) => console.log("Clicked", url)}
                  />
                </div>
              </div>
            </section>
          )}

          {(activeTab === 'overview' || activeTab === 'issues') && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Detailed Issue List</h2>
              
              <div className={styles.filters}>
                <Badge severity="fail" label="Critical" />
                <Badge severity="warning" label="Warning" />
                <Badge severity="notice" label="Notice" />
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--line-200)', margin: '0 8px' }} />
                <Tag label="Metadata" isActive />
                <Tag label="Headings" />
                <Tag label="Performance" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--line-200)' }}>
                <IssueCard 
                  severity="fail" title="Missing Title Tag" urlCount={4} 
                  summary="Add a unique <title> tag to these pages." onClick={() => {}} 
                />
                <IssueCard 
                  severity="warning" title="Multiple H1 Tags found" urlCount={12} 
                  summary="Ensure only one <h1> tag is present per document." onClick={() => {}} 
                />
                <IssueCard 
                  severity="notice" title="Meta description too short" urlCount={1} 
                  summary="Expand meta description to 120-160 characters." onClick={() => {}} 
                />
              </div>
            </section>
          )}

        </main>
      </div>

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        isExporting={isExporting} 
        onExport={handleExport} 
      />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuditHistory } from "@/lib/audit-api";
import { getHistoryEntries } from "@/lib/audit-history-store";
import { AuditHistoryEntry } from "@/types/audit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroWaveform } from "@/components/layout/HeroWaveform";
import { IssueCard } from "@/components/ui/IssueCard";
import styles from "./page.module.css";

export default function HomePage() {
  const [history, setHistory] = useState<AuditHistoryEntry[]>([]);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getAuditHistory();
        setHistory(data.length > 0 ? data : getHistoryEntries());
      } catch (e) {
        // Server failed or doesn't support history yet, fallback to local storage
        setHistory(getHistoryEntries());
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <HeroWaveform />
        
        <section className={styles.heroContent}>
          <h1 className="display-xl">SEOwise</h1>
          <p className="body-lg">Advanced SEO auditing powered by open-seo.</p>
          <Link href="/audit" className="button">Start New Audit</Link>
        </section>
        
        {history.length > 0 && (
          <section className={styles.recentAudits}>
            <h2 className="heading-md">Recent Audits</h2>
            <div className={styles.historyList}>
              {history.map(h => (
                <IssueCard 
                  key={h.id}
                  title={h.startUrl}
                  description={`Crawled ${h.pagesCrawled} / ${h.pagesTotal} pages`}
                  severity={h.status === "failed" ? "critical" : h.status === "completed" ? "notice" : "warning"}
                  tag={h.status.toUpperCase()}
                  href={h.status === "completed" ? `/dashboard?auditId=${h.id}` : `/loading?auditId=${h.id}&url=${encodeURIComponent(h.startUrl)}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
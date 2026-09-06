"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuditHistory } from "@/lib/audit-api";
import { getHistoryEntries } from "@/lib/audit-history-store";
import { AuditHistoryEntry } from "@/types/audit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroWaveform } from "@/components/layout/HeroWaveform";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function HomePage() {
  const [history, setHistory] = useState<AuditHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const serverHistory = await getAuditHistory();
        setHistory(serverHistory);
      } catch (e) {
        console.warn("Server history fetch failed, falling back to local storage");
        setHistory(getHistoryEntries());
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <HeroWaveform />
        
        <div className={styles.container}>
          <div className={styles.heroText}>
            <h1 className="display-xl">Diagnose Your SEO.</h1>
            <p className="body-lg">Run comprehensive technical audits and Lighthouse checks on your site.</p>
            <Link href="/audit">
              <Button size="lg">Start New Audit</Button>
            </Link>
          </div>

          {!isLoading && history.length > 0 && (
            <section className={styles.recentAuditsSection}>
              <h2 className="heading-md">Recent Audits</h2>
              <DataTable 
                columns={[
                  { key: "url", label: "Target URL" },
                  { key: "status", label: "Status" },
                  { key: "pages", label: "Pages" },
                  { key: "date", label: "Date" },
                  { key: "action", label: "Action" }
                ]}
                data={history.map(entry => ({
                  id: entry.id,
                  url: entry.startUrl,
                  status: entry.status.toUpperCase(),
                  pages: `${entry.pagesCrawled} / ${entry.pagesTotal}`,
                  date: new Date(entry.completedAt || entry.startedAt).toLocaleDateString(),
                  action: (
                    <Link 
                      href={entry.status === "completed" 
                        ? `/dashboard?auditId=${entry.id}` 
                        : `/loading?auditId=${entry.id}&url=${encodeURIComponent(entry.startUrl)}`}
                    >
                      View
                    </Link>
                  )
                }))}
              />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAuditResults } from "@/lib/audit-api";
import { mapEngineIssueToUi } from "@/lib/issue-mapping";
import { AuditResults } from "@/types/audit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable } from "@/components/ui/DataTable";
import { IssueCard } from "@/components/ui/IssueCard";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

// Documenting scoring formula: 100 minus penalty points per issue severity, floored at 0.
function computeCategoryScores(results: AuditResults) {
  const scores = { technical: 100, onPage: 100, performance: null as number | null, accessibility: null as number | null, mobile: null as number | null, overall: 100 };
  
  let techPenalty = 0;
  let onPagePenalty = 0;
  
  results.issues.forEach(issue => {
    const penalty = issue.severity === "critical" ? 20 : issue.severity === "warning" ? 10 : 2;
    if (issue.type.match(/technical|robots|sitemap|canonical|server/)) {
      techPenalty += penalty;
    } else {
      onPagePenalty += penalty;
    }
  });
  
  scores.technical = Math.max(0, 100 - techPenalty);
  scores.onPage = Math.max(0, 100 - onPagePenalty);
  
  if (results.lighthouse.length > 0) {
    const lh = results.lighthouse[0];
    scores.performance = lh.performanceScore ? Math.round(lh.performanceScore * 100) : null;
    scores.accessibility = lh.accessibilityScore ? Math.round(lh.accessibilityScore * 100) : null;
    
    const mobileLh = results.lighthouse.find(l => l.strategy === "mobile");
    scores.mobile = mobileLh?.seoScore ? Math.round(mobileLh.seoScore * 100) : null;
  }
  
  const parts = [scores.technical, scores.onPage, scores.performance, scores.accessibility].filter(x => x !== null) as number[];
  scores.overall = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0;
  
  return scores;
}

function DashboardView() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");
  
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchResults = async () => {
    if (!auditId) return;
    setError(null);
    try {
      const res = await getAuditResults(auditId);
      setResults(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard.");
    }
  };

  useEffect(() => {
    fetchResults();
  }, [auditId]);
  
  if (error) {
    return <ErrorCard message={error} onRetry={fetchResults} />;
  }
  
  const domain = results ? new URL(results.audit.startUrl).hostname : "Loading...";
  const timestamp = results ? new Date(results.audit.completedAt || results.audit.startedAt).toLocaleString() : "Loading...";
  
  const scores = results ? computeCategoryScores(results) : null;
  
  const handleExport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${results.audit.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // TODO: PDF export
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className="heading-lg">{domain}</h1>
          <p className="body-sm text-ink-800">Scanned on {timestamp}</p>
        </div>
        <Button onClick={handleExport} disabled={!results}>Export JSON</Button>
      </header>
      
      <div className={styles.scoreGauges}>
        <ScoreGauge score={scores?.overall ?? null} label="Overall" />
        <ScoreGauge score={scores?.technical ?? null} label="Technical" />
        <ScoreGauge score={scores?.onPage ?? null} label="On-Page" />
        <ScoreGauge score={scores?.performance ?? null} label="Performance" />
      </div>
      
      <div className={styles.metrics}>
        <MetricCard label="Pages Crawled" score={results?.audit.pagesCrawled ?? null} />
        <MetricCard label="Total Issues" score={results?.issues.length ?? null} />
      </div>
      
      <div className={styles.issues}>
        <h2 className="heading-md">Detailed Issues</h2>
        {results?.issues.map(issue => {
          const mapped = mapEngineIssueToUi(issue);
          return (
            <IssueCard 
              key={issue.id}
              title={issue.title}
              description={issue.description}
              severity={mapped.severity}
              tag={mapped.categoryTag}
              href={`/issue?auditId=${results.audit.id}&issueId=${issue.id}`}
            />
          );
        })}
      </div>
      
      <div className={styles.tables}>
        <h2 className="heading-md">Pages</h2>
        <DataTable 
          data={results?.pages || []} 
          columns={["url", "statusCode", "title", "wordCount", "isIndexable"]}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.loading}>Loading Data...</div>}>
          <DashboardView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
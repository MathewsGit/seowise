"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAuditResults } from "@/lib/audit-api";
import { mapEngineIssueToUi } from "@/lib/issue-mapping";
import { AuditResults } from "@/types/audit";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable } from "@/components/ui/DataTable";
import { IssueCard } from "@/components/ui/IssueCard";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./page.module.css";
import { BarChart } from "@/components/charts/BarChart";
import { CoreWebVitalsGauge } from "@/components/charts/CoreWebVitalsGauge";

function computeCategoryScores(results: AuditResults) {
  const deduct = (issues: any[], typeMatch: string[]) => {
    let penalty = 0;
    issues.forEach(i => {
      // Safely grab the type string, falling back to an empty string if it's missing
      const issueTypeStr = (i.type || i.issueType || "").toLowerCase();
      
      if (typeMatch.some(t => issueTypeStr.includes(t))) {
        penalty += i.severity === "critical" ? 20 : i.severity === "warning" ? 10 : 2;
      }
    });
    return penalty;
  };

  const techPenalty = deduct(results.issues, ["robots", "canonical", "sitemap", "status", "server"]);
  const onPagePenalty = deduct(results.issues, ["title", "meta", "heading", "image", "content"]);
  
  const techScore = Math.max(0, 100 - techPenalty);
  const onPageScore = Math.max(0, 100 - onPagePenalty);
  const accessibilityScore = results.lighthouse[0]?.accessibilityScore ? Math.round(results.lighthouse[0].accessibilityScore * 100) : null;
  const performanceScore = results.lighthouse[0]?.performanceScore ? Math.round(results.lighthouse[0].performanceScore * 100) : null;
  const mobileScore = results.lighthouse.find(l => l.strategy === "mobile")?.seoScore 
    ? Math.round(results.lighthouse.find(l => l.strategy === "mobile")!.seoScore! * 100) : null;

  const validScores = [techScore, onPageScore, accessibilityScore, performanceScore].filter(s => s !== null) as number[];
  const overallScore = validScores.length ? Math.round(validScores.reduce((a,b)=>a+b,0)/validScores.length) : null;

  return { Technical: techScore, OnPage: onPageScore, Performance: performanceScore, Accessibility: accessibilityScore, Mobile: mobileScore, Overall: overallScore };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auditId = searchParams.get("auditId");
  
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = async () => {
    if (!auditId) {
      setError("No audit ID provided in URL.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAuditResults(auditId);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to load audit results.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [auditId]);

  if (error) {
    return (
      <div className={styles.errorWrapper}>
        {/* We map our general error into the existing crawl-error card format */}
        <ErrorCard 
          statusCode="Error" 
          url={error || "Failed to load audit results"} 
          onRetry={fetchResults} 
        />
      </div>
    );
  }

  const handleExport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seowise-export-${results.audit.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const domain = results ? new URL(results.audit.startUrl).hostname : "Loading...";
  const timestamp = results ? new Date(results.audit.completedAt ?? results.audit.startedAt).toLocaleString() : "Loading...";
  const scores = results ? computeCategoryScores(results) : { Technical: null, OnPage: null, Performance: null, Accessibility: null, Mobile: null, Overall: null };
  const mappedIssues = results ? results.issues.map((i, index) => ({ 
    ...i, 
    id: i.id || String(index), // Fallback to index if no ID exists
    ui: mapEngineIssueToUi(i) 
  })) : [];
  return (
    <div className={styles.container}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className="heading-lg">{domain}</h1>
          <p className="body-sm text-ink-800">Scanned on {timestamp}</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleExport} disabled={isLoading}>Export JSON</Button>
        </div>
      </div>

      <div className={styles.gaugesGrid}>
        <ScoreGauge score={scores.Overall} label="Overall" loading={isLoading} />
        <ScoreGauge score={scores.Technical} label="Technical" loading={isLoading} />
        <ScoreGauge score={scores.OnPage} label="On-Page" loading={isLoading} />
        <ScoreGauge score={scores.Performance} label="Performance" loading={isLoading} />
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard label="Pages Crawled" score={results?.audit.pagesCrawled ?? null} loading={isLoading} />
        <MetricCard label="Issues Found" score={results?.issues.length ?? null} loading={isLoading} />
        <MetricCard label="Avg Response Time (ms)" score={results && results.pages.length ? Math.round(results.pages.reduce((acc, p) => acc + p.responseTimeMs, 0) / results.pages.length) : null} loading={isLoading} />
      </div>

      <div className={styles.contentSections}>
        <section className={styles.section}>
          <h2 className="heading-md">Issues Discovered</h2>
          <div className={styles.issuesList}>
            {isLoading ? <div>Loading issues...</div> : 
             mappedIssues.length === 0 ? <p>No issues found!</p> :
             mappedIssues.map(issue => (
               <IssueCard 
                 key={issue.id} 
                 title={issue.title} 
                 severity={issue.ui.severity as any} 
                 summary={issue.description || issue.howToFix || "No description provided."} 
                 urlCount={issue.affectedUrls ? issue.affectedUrls.length : 1}
                 onClick={() => router.push(`/issue?auditId=${auditId}&issueId=${issue.id}`)}
               />
             ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className="heading-md">Page Details</h2>
          {isLoading ? (
            <div>Loading page details...</div>
          ) : (
            <DataTable 
              columns={[
                { key: "url", label: "URL", isMonospace: true },
                { key: "statusCode", label: "Status" },
                { key: "title", label: "Title" },
                { key: "wordCount", label: "Word Count" },
                { key: "indexable", label: "Indexable" }
              ]}
              data={results?.pages.map((p, i) => ({
                id: p.id || String(i),
                url: p.url,
                statusCode: p.statusCode.toString(),
                title: p.title || "-",
                wordCount: p.wordCount.toString(),
                indexable: p.isIndexable ? "Yes" : "No"
              })) || []}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.loadingMain}>Loading Dashboard...</div>}>
          <DashboardContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
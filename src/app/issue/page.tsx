"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAuditResults } from "@/lib/audit-api";
import { AuditIssue } from "@/types/audit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import styles from "./page.module.css";

const cache = new Map<string, AuditIssue[]>();

function IssueView() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");
  const issueId = searchParams.get("issueId");
  
  const [issue, setIssue] = useState<AuditIssue | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!auditId || !issueId) return;
    
    const fetchIssue = async () => {
      try {
        if (cache.has(auditId)) {
          const issues = cache.get(auditId)!;
          setIssue(issues.find(i => i.id === issueId) || null);
          return;
        }
        const res = await getAuditResults(auditId);
        cache.set(auditId, res.issues);
        setIssue(res.issues.find(i => i.id === issueId) || null);
      } catch (e: any) {
        setError(e.message || "Failed to load issue.");
      }
    };
    fetchIssue();
  }, [auditId, issueId]);

  if (error) return <div>{error}</div>;
  if (!issue) return <div>Loading...</div>;

  return (
    <div className={styles.issueDetails}>
      <div className={styles.badgeRow}>
        <Badge variant={issue.severity}>{issue.severity.toUpperCase()}</Badge>
      </div>
      <h1 className="heading-lg">{issue.title}</h1>
      <p className="body-md">{issue.description}</p>
      
      {issue.fixSteps && issue.fixSteps.length > 0 && (
        <div className={styles.fixSteps}>
          <h2 className="heading-md">How to fix</h2>
          <ul className="body-sm">
            {issue.fixSteps.map((step, i) => <li key={i}>{step}</li>)}
          </ul>
        </div>
      )}
      
      <div className={styles.affectedUrls}>
        <h2 className="heading-md">Affected URLs</h2>
        <ul>
          {issue.affectedUrls.map((url, i) => (
            <li key={i} className="mono-sm text-ink-800">{url}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function IssuePage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<div>Loading issue...</div>}>
          <IssueView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
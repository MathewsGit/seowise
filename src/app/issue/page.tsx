"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAuditResults } from "@/lib/audit-api";
import { AuditIssue } from "@/types/audit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ErrorCard } from "@/components/ui/ErrorCard";
import styles from "./page.module.css";
import { mapEngineIssueToUi } from "@/lib/issue-mapping";
import { Badge } from "@/components/ui/Badge";

// Simple in-memory cache to prevent refetching if navigating straight from dashboard
const issueCache: Record<string, AuditIssue[]> = {};

function IssueContent() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");
  const issueId = searchParams.get("issueId");

  const [issue, setIssue] = useState<AuditIssue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auditId || !issueId) {
      setError("Missing audit ID or issue ID.");
      setIsLoading(false);
      return;
    }

    const loadIssue = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let issues = issueCache[auditId];
        if (!issues) {
          const results = await getAuditResults(auditId);
          issues = results.issues;
          issueCache[auditId] = issues;
        }

        const found = issues.find((i, index) => (i.id || String(index)) === issueId);
        if (found) {
          setIssue(found);
        } else {
          setError("Issue not found in this audit.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load issue details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadIssue();
  }, [auditId, issueId]);

  if (error) {
    return (
      <div className={styles.content}>
        <ErrorCard title="Error loading issue" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (isLoading || !issue) {
    return <div className={styles.content}>Loading issue details...</div>;
  }

  const ui = mapEngineIssueToUi(issue);

  return (
    <div className={styles.content}>
      <div className={styles.issueHeader}>
        <Badge variant={ui.severity}>{ui.severity.toUpperCase()}</Badge>
        <Badge variant="neutral">{ui.categoryTag}</Badge>
      </div>
      <h1 className="heading-lg mt-4">{issue.title}</h1>
      <p className="body-lg mt-2">{issue.description}</p>

      {issue.fixSteps && issue.fixSteps.length > 0 && (
        <section className={styles.section}>
          <h2 className="heading-md">How to fix</h2>
          <ol className={styles.stepsList}>
            {issue.fixSteps.map((step, idx) => (
              <li key={idx} className="body-md">{step}</li>
            ))}
          </ol>
        </section>
      )}

      <section className={styles.section}>
        <h2 className="heading-md">Affected URLs ({issue.affectedUrls.length})</h2>
        <ul className={styles.urlsList}>
          {issue.affectedUrls.map((url, idx) => (
            <li key={idx} className="mono-sm text-ink-800 break-all">{url}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function IssuePage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<div>Loading...</div>}>
          <IssueContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
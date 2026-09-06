"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import styles from "./page.module.css";
import { Header } from "@/components/layout/Header";

const ERROR_MESSAGES: Record<string, string> = {
  step_timeout: "The site took too long to respond during the crawl.",
  oom: "The audit ran out of memory while processing this site.",
  cpu_limit: "The audit exceeded computational limits.",
  db_error: "A database error prevented the audit from completing.",
  step_output_too_large: "The site returned too much data to process.",
  workflow_internal: "An internal engine workflow error occurred.",
  instance_lost: "We lost track of this audit before it finished — please start a new one.",
  unknown: "Something went wrong while auditing this site.",
  network_failure: "We lost connection to the server while checking status."
};

function FailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const errorCode = searchParams.get("errorCode") || "unknown";
  const auditId = searchParams.get("auditId");
  const url = searchParams.get("url") || "";
  
  const message = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.unknown;

  const handleRetry = () => {
    router.push(`/audit?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className={styles.failedContainer}>
      <h1 className="display-lg">Audit Failed</h1>
      <p className="body-lg">{message}</p>
      
      <div className={styles.actions}>
        <Button onClick={handleRetry}>Try again</Button>
      </div>
      
      {auditId && (
        <div className={styles.details}>
          <Accordion title="Technical details">
            <div className="mono-sm text-ink-800">
              <p>Error Code: {errorCode}</p>
              <p>Audit ID: {auditId}</p>
              <p>Target URL: {url}</p>
            </div>
          </Accordion>
        </div>
      )}
    </div>
  );
}

export default function AuditFailedPage() {
  return (
    <div className={styles.page}>
      <Header minimal />
      <main className={styles.main}>
        <div className={styles.content}>
          <Suspense fallback={<div>Loading error details...</div>}>
            <FailedContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
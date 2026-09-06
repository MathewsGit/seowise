"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Header } from "@/components/layout/Header";
import styles from "./page.module.css";

const ERROR_MESSAGES: Record<string, string> = {
  step_timeout: "The site took too long to respond during the crawl.",
  oom: "The audit process ran out of memory.",
  cpu_limit: "The audit exceeded computational time limits.",
  db_error: "A database error occurred while saving the audit.",
  step_output_too_large: "The site returned too much data to process.",
  workflow_internal: "An internal system error occurred during the audit.",
  instance_lost: "We lost track of this audit before it finished — please start a new one.",
  unknown: "Something went wrong while auditing this site."
};

function FailedView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get("errorCode") || "unknown";
  const startUrl = searchParams.get("url") || "";
  const auditId = searchParams.get("auditId") || "";
  
  const message = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.unknown;

  return (
    <div className={styles.content}>
      <h1 className="heading-lg text-signal-coral">Audit Failed</h1>
      <p className="body-lg">{message}</p>
      
      <Button onClick={() => router.push(`/audit?url=${encodeURIComponent(startUrl)}`)}>
        Try again
      </Button>
      
      <div className={styles.accordionWrapper}>
        <Accordion title="Technical details">
          <div className="mono-sm text-ink-800">
            <p>Error Code: {errorCode}</p>
            <p>Audit ID: {auditId}</p>
            <p>Target URL: {startUrl}</p>
          </div>
        </Accordion>
      </div>
    </div>
  );
}

export default function AuditFailedPage() {
  return (
    <div className={styles.container}>
      <Header minimal />
      <main className={styles.main}>
        <Suspense fallback={<div>Loading...</div>}>
          <FailedView />
        </Suspense>
      </main>
    </div>
  );
}
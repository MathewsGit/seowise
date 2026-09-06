"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuditStatus, getAuditProgress, deleteAudit } from "@/lib/audit-api";
import { pushHistoryEntry } from "@/lib/audit-history-store";
import { AnimatedPipeline, ProgressBar } from "@/components/ui/LoadingVisuals";
import { WarningModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";
import { Header } from "@/components/layout/Header";

const DEFAULT_MESSAGES = [
  "Discovering pages...",
  "Parsing HTML...",
  "Checking technical SEO...",
  "Analyzing on-page content...",
  "Running Lighthouse metrics...",
  "Compiling final report..."
];

function deriveStageIndex(phase: string | null, progressPct: number): number {
  if (phase) {
    const lower = phase.toLowerCase();
    if (lower.includes("fetch") || lower.includes("discover")) return 0;
    if (lower.includes("pars")) return 1;
    if (lower.includes("technical") || lower.includes("robots") || lower.includes("sitemap") || lower.includes("canonical")) return 2;
    if (lower.includes("on-page") || lower.includes("metadata") || lower.includes("heading") || lower.includes("schema")) return 3;
    if (lower.includes("performance") || lower.includes("lighthouse") || lower.includes("vitals")) return 4;
    if (lower.includes("compil") || lower.includes("aggregat") || lower.includes("report")) return 5;
  }
  // Fallback to proportional estimate
  if (progressPct < 15) return 0;
  if (progressPct < 30) return 1;
  if (progressPct < 50) return 2;
  if (progressPct < 70) return 3;
  if (progressPct < 90) return 4;
  return 5;
}

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");
  const targetUrl = searchParams.get("url") || "the website";

  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_MESSAGES[0]);
  const [justCrawled, setJustCrawled] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const pollFailures = useRef(0);
  const isTerminal = useRef(false);

  useEffect(() => {
    if (!auditId || isTerminal.current) return;

    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      try {
        const status = await getAuditStatus(auditId);
        pollFailures.current = 0; // Reset on success

        let pct = Math.round((status.pagesCrawled / Math.max(status.pagesTotal, 1)) * 100);
        if (status.status !== "completed") {
          pct = Math.min(pct, 99); // Clamp to 99 until finished
        }
        
        setProgress(pct);
        setStageIndex(deriveStageIndex(status.currentPhase, pct));
        
        if (status.currentPhase) {
          // Title case and truncate phase string
          const formatted = status.currentPhase.charAt(0).toUpperCase() + status.currentPhase.slice(1).split('\n')[0];
          setStatusMessage(formatted);
        } else {
          setStatusMessage(DEFAULT_MESSAGES[deriveStageIndex(null, pct)]);
        }

        // Optional supplementary poll for progress
        try {
          const progressData = await getAuditProgress(auditId);
          if (progressData && progressData.length > 0) {
            setJustCrawled(progressData[0].url);
          }
        } catch (e) {
          // Ignore failures on supplementary data
        }

        if (status.status === "completed" || status.status === "failed") {
          isTerminal.current = true;
          
          pushHistoryEntry({
            id: status.id,
            startUrl: status.startUrl,
            status: status.status,
            pagesCrawled: status.pagesCrawled,
            pagesTotal: status.pagesTotal,
            ranLighthouse: status.lighthouseTotal > 0,
            startedAt: status.startedAt,
            completedAt: status.completedAt
          });

          if (status.status === "completed") {
            router.push(`/dashboard?auditId=${auditId}`);
          } else {
            router.push(`/audit-failed?auditId=${auditId}&errorCode=${status.errorCode || 'unknown'}&url=${encodeURIComponent(targetUrl)}`);
          }
          return; // Stop polling
        }

        timeoutId = setTimeout(poll, 2000);
      } catch (error) {
        pollFailures.current += 1;
        if (pollFailures.current >= 3) {
          isTerminal.current = true;
          router.push(`/audit-failed?auditId=${auditId}&errorCode=network_failure&url=${encodeURIComponent(targetUrl)}`);
        } else {
          timeoutId = setTimeout(poll, 2000); // Retry with backoff
        }
      }
    };

    poll();
    return () => clearTimeout(timeoutId);
  }, [auditId, router, targetUrl]);

  const handleCancel = () => {
    if (auditId) {
      deleteAudit(auditId).catch(() => {}); // Fire and forget best-effort
    }
    router.push("/audit");
  };

  return (
    <>
      <div className={styles.targetDisplay}>Auditing {targetUrl}</div>
      <div className={styles.progressSection}>
        <AnimatedPipeline activeStage={stageIndex} />
        <ProgressBar progress={progress} />
        <div className={styles.statusContainer}>
          <div className={styles.statusMessage}>{statusMessage}</div>
          {justCrawled && <div className="body-sm">Just crawled: {justCrawled}</div>}
        </div>
        <div className="display-lg">{progress}%</div>
      </div>
      <Button variant="secondary" onClick={() => setShowCancelModal(true)}>
        Cancel Audit
      </Button>

      <WarningModal 
        isOpen={showCancelModal} 
        onConfirm={handleCancel} 
        onCancel={() => setShowCancelModal(false)}
        title="Cancel Audit"
        description="Are you sure you want to stop this audit? Progress will be lost."
      />
    </>
  );
}

export default function LoadingPage() {
  return (
    <div className={styles.page}>
      <Header minimal />
      <main className={styles.main}>
        <div className={styles.content}>
          <Suspense fallback={<div>Loading...</div>}>
            <LoadingContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
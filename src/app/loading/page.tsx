"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuditStatus, getAuditProgress, deleteAudit } from "@/lib/audit-api";
import { pushHistoryEntry } from "@/lib/audit-history-store";
import { AnimatedPipeline, ProgressBar } from "@/components/ui/LoadingVisuals";
import { WarningModal } from "@/components/ui/Modal";
import { Header } from "@/components/layout/Header";
import styles from "./page.module.css";

const GENERIC_MESSAGES = [
  "Fetching robots.txt...",
  "Parsing HTML...",
  "Analyzing technical SEO...",
  "Evaluating on-page content...",
  "Running Lighthouse tests...",
  "Compiling report..."
];

function mapPhaseToStage(phase: string | null, progress: number): number {
  if (phase) {
    const p = phase.toLowerCase();
    if (p.includes("fetch") || p.includes("discover")) return 0;
    if (p.includes("pars")) return 1;
    if (p.includes("technical") || p.includes("robots") || p.includes("sitemap") || p.includes("canonical")) return 2;
    if (p.includes("on-page") || p.includes("metadata") || p.includes("heading") || p.includes("schema")) return 3;
    if (p.includes("performance") || p.includes("lighthouse") || p.includes("vitals")) return 4;
    if (p.includes("compil") || p.includes("aggregat") || p.includes("report")) return 5;
  }
  
  if (progress < 15) return 0;
  if (progress < 30) return 1;
  if (progress < 50) return 2;
  if (progress < 70) return 3;
  if (progress < 90) return 4;
  return 5;
}

function LoadingState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");
  const url = searchParams.get("url") || "";
  
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState(GENERIC_MESSAGES[0]);
  const [recentUrl, setRecentUrl] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  
  const pollFailures = useRef(0);
  const active = useRef(true);
  
  useEffect(() => {
    if (!auditId) return;
    
    const poll = async () => {
      if (!active.current) return;
      try {
        const status = await getAuditStatus(auditId);
        pollFailures.current = 0;
        
        const pct = Math.round((status.pagesCrawled / Math.max(status.pagesTotal, 1)) * 100);
        const clampedPct = status.status !== "completed" ? Math.min(pct, 99) : pct;
        
        setProgress(clampedPct);
        
        const stage = mapPhaseToStage(status.currentPhase, clampedPct);
        setStageIndex(stage);
        
        if (status.currentPhase) {
          const capitalized = status.currentPhase.charAt(0).toUpperCase() + status.currentPhase.slice(1);
          setStatusMessage(capitalized.length > 50 ? capitalized.substring(0, 47) + "..." : capitalized);
        } else {
          setStatusMessage(GENERIC_MESSAGES[stage]);
        }
        
        try {
          const prog = await getAuditProgress(auditId);
          if (prog.length > 0) {
            setRecentUrl(prog[0].url);
          }
        } catch (e) {
          // Ignore failure for supplementary data
        }
        
        if (status.status === "completed" || status.status === "failed") {
          active.current = false;
          
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
            router.push(`/dashboard?auditId=${encodeURIComponent(auditId)}`);
          } else {
            router.push(`/audit-failed?auditId=${encodeURIComponent(auditId)}&errorCode=${status.errorCode || "unknown"}&url=${encodeURIComponent(url)}`);
          }
        }
      } catch (e) {
        pollFailures.current++;
        if (pollFailures.current >= 3) {
          active.current = false;
          router.push(`/audit-failed?auditId=${encodeURIComponent(auditId)}&errorCode=network_error&url=${encodeURIComponent(url)}`);
        }
      }
    };
    
    poll(); 
    const interval = setInterval(poll, 2000);
    return () => {
      active.current = false;
      clearInterval(interval);
    };
  }, [auditId, router, url]);
  
  const handleCancel = () => {
    if (auditId) {
      deleteAudit(auditId).catch(() => {});
    }
    router.push("/audit");
  };

  return (
    <div className={styles.loadingWrapper}>
      <div className="heading-md">Target: {url}</div>
      <div className="display-lg">{progress}%</div>
      
      <AnimatedPipeline stageIndex={stageIndex} />
      <ProgressBar progress={progress} />
      
      <div className={styles.statusContainer}>
        <div className={styles.statusMessage}>{statusMessage}</div>
        {recentUrl && <div className={styles.recentUrl}>Just crawled: {recentUrl}</div>}
      </div>
      
      <button className={styles.cancelBtn} onClick={() => setIsCanceling(true)}>Cancel</button>
      
      <WarningModal 
        isOpen={isCanceling}
        onClose={() => setIsCanceling(false)}
        onConfirm={handleCancel}
        title="Cancel Audit?"
        description="Are you sure you want to stop the current audit?"
      />
    </div>
  );
}

export default function LoadingPage() {
  return (
    <div className={styles.container}>
      <Header minimal />
      <main className={styles.main}>
        <Suspense fallback={<div>Loading...</div>}>
          <LoadingState />
        </Suspense>
      </main>
    </div>
  );
}
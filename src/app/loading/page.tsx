// src/app/loading/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { AnimatedPipeline, ProgressBar } from '@/components/ui/LoadingVisuals';
import { Button } from '@/components/ui/Button';
import { WarningModal } from '@/components/ui/Modal';

function LoadingOrchestrator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || 'https://unknown.com';
  
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing scan...');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 1. Simulation of Engine progress (Pure state update only)
  useEffect(() => {
    if (isCancelModalOpen) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.5;
        // Just return the clamped value, NO side-effects (like router.push) here!
        if (next >= 100) return 100; 
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isCancelModalOpen]);

  // 2. Navigation side-effect (Triggered when progress hits 100)
  useEffect(() => {
    if (progress >= 100) {
      router.push(`/dashboard?url=${encodeURIComponent(url)}`);
    }
  }, [progress, router, url]);

  // 3. Sync Pipeline Stage & Status Message to Progress
  useEffect(() => {
    if (progress < 15) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStageIndex(0); // Fetching
      setStatusMessage('Requesting document over network...');
    } else if (progress < 30) {
      setStageIndex(1); // Parsing
      setStatusMessage('Parsing HTML and discovering linked assets...');
    } else if (progress < 50) {
      setStageIndex(2); // Technical checks
      setStatusMessage('Checking robots.txt, canonicals, and sitemap...');
    } else if (progress < 70) {
      setStageIndex(3); // On-page checks
      setStatusMessage('Evaluating metadata, headings, and schema...');
    } else if (progress < 90) {
      setStageIndex(4); // Performance checks
      setStatusMessage('Measuring LCP, CLS, and main-thread execution...');
    } else {
      setStageIndex(5); // Compiling report
      setStatusMessage('Aggregating scores and writing final report...');
    }
  }, [progress]);

  const handleCancelAudit = () => {
    router.push('/audit');
  };

  const showEstimate = progress > 15 && progress < 100;

  return (
    <>
      <div className={styles.content}>
        <div className={styles.urlTarget} aria-label="Auditing URL">
          {url}
        </div>

        <AnimatedPipeline currentStageIndex={stageIndex} />

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.percentage} aria-live="polite">
              {Math.floor(progress)}%
            </span>
            {showEstimate && (
              <span className={styles.estimate}>
                ~ {Math.ceil((100 - progress) / 10)}s remaining
              </span>
            )}
          </div>
          
          <ProgressBar progress={progress} />
          
          <div className={styles.statusContainer} aria-live="polite">
            <span key={statusMessage} className={styles.statusMessage}>
              {statusMessage}
            </span>
          </div>
        </div>

        <div className={styles.cancelWrapper}>
          <Button 
            variant="tertiary" 
            size="sm" 
            onClick={() => setIsCancelModalOpen(true)}
          >
            Cancel audit
          </Button>
        </div>
      </div>

      <WarningModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel this audit?"
        content="Are you sure you want to cancel? All progress will be lost and no report will be generated."
        destructiveActionLabel="Cancel audit"
        onDestructiveAction={handleCancelAudit}
      />
    </>
  );
}

export default function LoadingPage() {
  return (
    <main className={styles.pageWrapper}>
      <Suspense fallback={<div className={styles.content} style={{ height: '400px' }} />}>
        <LoadingOrchestrator />
      </Suspense>
    </main>
  );
}
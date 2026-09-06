'use client';

import React from 'react';
import styles from './LoadingVisuals.module.css';

// --- PROGRESS BAR ---
interface ProgressBarProps {
  progress: number | null; // null = indeterminate
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const isIndeterminate = progress === null;
  const clampedProgress = !isIndeterminate ? Math.max(0, Math.min(100, progress)) : 0;

  return (
    <div 
      className={styles.progressBarContainer}
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {isIndeterminate ? (
        <div className={styles.progressBarIndeterminate} />
      ) : (
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${clampedProgress}%` }} 
        />
      )}
    </div>
  );
}

// --- ANIMATED PIPELINE ---
const STAGES = [
  'Fetching',
  'Parsing',
  'Technical checks',
  'On-page checks',
  'Performance checks',
  'Compiling report'
];

interface PipelineProps {
  currentStageIndex: number; // 0 to 5
}

export function AnimatedPipeline({ currentStageIndex }: PipelineProps) {
  return (
    <div className={styles.pipelineContainer} aria-label="Audit progress stages">
      {STAGES.map((stage, index) => {
        const isCompleted = index < currentStageIndex;
        const isActive = index === currentStageIndex;
        
        // Calculate connecting line positioning dynamically
        const segmentLeft = `calc(${(index * 100) / (STAGES.length - 1)}% + 12px)`;
        const segmentWidth = `calc(${100 / (STAGES.length - 1)}% - 24px)`;
        const showLine = index < STAGES.length - 1;

        return (
          <React.Fragment key={stage}>
            <div className={styles.nodeWrapper}>
              <div 
                className={`${styles.nodeCircle} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                aria-hidden="true"
              >
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className={`${styles.nodeLabel} ${isActive || isCompleted ? styles.active : ''}`}>
                {stage}
              </span>
            </div>
            
            {showLine && (
              <div 
                className={styles.lineSegment} 
                style={{ left: segmentLeft, width: segmentWidth }}
                aria-hidden="true"
              >
                <div className={`${styles.lineSegmentFill} ${isCompleted ? styles.drawn : ''}`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
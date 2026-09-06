'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './Tabs.module.css';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  ariaLabel: string;
}

export function Tabs({ tabs, activeTab, onChange, ariaLabel }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeElement = tabRefs.current[activeIndex];
    
    if (activeElement && containerRef.current) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className={styles.container}>
      <div 
        className={styles.tabList} 
        role="tablist" 
        aria-label={ariaLabel}
        ref={containerRef}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
        {/* The sliding amber underline */}
        <div 
          className={styles.indicator} 
          style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px` }} 
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
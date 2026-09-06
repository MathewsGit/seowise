'use client';

import React, { useEffect, useState } from 'react';

export function HeroWaveform() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Parallax logic: update scroll position
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);

  // 0.9x scroll speed for subtle parallax
  const translateY = scrollY * 0.9;

  return (
    <div 
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.12, /* 12% opacity per spec */
      }}
    >
      <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          transform: `translateY(${translateY}px)`,
          willChange: 'transform'
        }}
      >
        <path
          d="M-50 300C150 300 250 100 450 100C650 100 750 500 950 500C1150 500 1250 300 1500 300"
          stroke="var(--signal-amber)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          // We apply the trace animation using inline styles so we don't need a separate CSS file just for this
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: 2000,
            animation: 'traceWaveform 1400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
        {/* We inject the keyframes directly for this highly specific one-time animation */}
        <style>
          {`
            @keyframes traceWaveform {
              to {
                stroke-dashoffset: 0;
              }
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes traceWaveform {
                to { stroke-dashoffset: 0; }
              }
              /* For reduced motion, just instantly show the line */
              svg path {
                animation-duration: 0.01ms !important;
              }
            }
          `}
        </style>
      </svg>
    </div>
  );
}
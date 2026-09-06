'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from './ForceGraph.module.css';

export interface GraphNode {
  url: string;
  status: number;
  inbound: number;
  outbound: number;
  isCenter?: boolean;
}

export interface GraphLink {
  source: string; // URL
  target: string; // URL
}

interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick: (url: string) => void;
  ariaLabel: string;
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  radius: number;
}

export function ForceGraph({ nodes, links, onNodeClick, ariaLabel }: ForceGraphProps) {
  const [layoutNodes, setLayoutNodes] = useState<PositionedNode[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: PositionedNode } | null>(null);

  const width = 800;
  const height = 450;
  const cx = width / 2;
  const cy = height / 2;

  // Run a lightweight force simulation synchronously in memory exactly once
  const computedLayout = useMemo(() => {
    // 1. Initialize node positions at the exact center (for animation start point)
    const simNodes = nodes.map((n, index) => ({
      ...n,
      // Radius: min 6, max 22, scaled by inbound links
      radius: n.isCenter ? 22 : Math.min(Math.max(6, 6 + n.inbound * 2), 22),
      // Use deterministic offsets to keep render-time calculations pure.
      x: cx + ((index % 5) - 2) * 2,
      y: cy + (Math.floor(index / 5) % 5 - 2) * 2,
      vx: 0,
      vy: 0
    }));

    // 2. Run simulation iterations (100 ticks is enough for a stable layout)
    for (let i = 0; i < 100; i++) {
      // Repulsion
      for (const a of simNodes) {
        for (const b of simNodes) {
          if (a === b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          // Coulomb repulsion
          const force = 2000 / (dist * dist);
          a.vx += (dx / dist) * force;
          a.vy += (dy / dist) * force;
        }
      }
      
      // Spring attraction (Links)
      for (const l of links) {
        const a = simNodes.find(n => n.url === l.source);
        const b = simNodes.find(n => n.url === l.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Hooke's law
        const force = (dist - 80) * 0.05;
        a.vx += (dx / dist) * force;
        a.vy += (dy / dist) * force;
        b.vx -= (dx / dist) * force;
        b.vy -= (dy / dist) * force;
      }

      // Gravity & Velocity application
      for (const n of simNodes) {
        if (n.isCenter) {
          n.x = cx; 
          n.y = cy; 
          continue;
        }
        // Pull towards center
        n.vx += (cx - n.x) * 0.02;
        n.vy += (cy - n.y) * 0.02;
        
        n.x += n.vx;
        n.y += n.vy;
        
        // Friction
        n.vx *= 0.5;
        n.vy *= 0.5;
      }
    }
    return simNodes;
  }, [nodes, links, cx, cy]);

  useEffect(() => {
    // Initial render sets nodes at center, then immediately update to computed layout
    // This triggers the CSS transitions on cx/cy, fulfilling the 1.5s visual settle requirement.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayoutNodes(computedLayout.map(n => ({ ...n, x: cx, y: cy })));
    
    // Defer the application of final coordinates by one frame to allow transition to register
    const timer = requestAnimationFrame(() => {
      setLayoutNodes(computedLayout);
      setIsMounted(true);
    });
    
    return () => cancelAnimationFrame(timer);
  }, [computedLayout, cx, cy]);

  const getStatusClass = (status: number, type: 'fill' | 'bg') => {
    if (status >= 200 && status < 300) return type === 'fill' ? styles.status2xx : styles.bg2xx;
    if (status >= 300 && status < 400) return type === 'fill' ? styles.status3xx : styles.bg3xx;
    return type === 'fill' ? styles.status4xx : styles.bg4xx;
  };

  return (
    <div className={styles.container} role="img" aria-label={ariaLabel}>
      {/* Hidden description for screen readers */}
      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        Force directed graph of internal links. The table view adjacent is recommended for screen readers.
      </div>

      <svg 
        className={styles.svg} 
        viewBox={`0 0 ${width} ${height}`} 
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Draw Links */}
        {links.map((link, i) => {
          const source = layoutNodes.find(n => n.url === link.source);
          const target = layoutNodes.find(n => n.url === link.target);
          if (!source || !target) return null;
          return (
            <line
              key={`link-${i}`}
              x1={source.x} y1={source.y}
              x2={target.x} y2={target.y}
              className={styles.link}
            />
          );
        })}

        {/* Draw Nodes */}
        {layoutNodes.map((node) => (
          <circle
            key={node.url}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            className={`${styles.node} ${getStatusClass(node.status, 'fill')}`}
            onClick={() => onNodeClick(node.url)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                x: e.clientX - rect.left + node.x, // Map back to internal coordinate space loosely, or just use pageX
                y: e.clientY - rect.top + node.y,
                node
              });
            }}
          />
        ))}
      </svg>

      {/* Custom Tooltip Overlay */}
      {tooltip && (
        <div 
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className={styles.tooltipUrl}>{tooltip.node.url}</div>
          <div className={styles.tooltipMeta}>
            <span className={`${styles.statusBadge} ${getStatusClass(tooltip.node.status, 'bg')}`}>
              {tooltip.node.status}
            </span>
            <span>In: {tooltip.node.inbound}</span>
            <span>Out: {tooltip.node.outbound}</span>
          </div>
        </div>
      )}
    </div>
  );
}
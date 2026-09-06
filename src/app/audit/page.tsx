"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAudit } from "@/lib/audit-api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import styles from "./page.module.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function AuditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [device, setDevice] = useState("desktop");
  const [depth, setDepth] = useState("standard");
  const [speed, setSpeed] = useState("normal");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsSubmitting(true);
    setError(null);

    // Map form selections to engine expectations
    const maxPages = depth === "quick" ? 1 : depth === "standard" ? 25 : 200;
    // Engine lighthouse strategy: 'auto' encompasses both 'desktop' and 'both'.
    // NOTE: per-device Lighthouse selection needs backend confirmation if they differ.
    const lighthouseStrategy = (device === "desktop" || device === "both") ? "auto" : "none";

    try {
      const result = await startAudit({
        startUrl: url,
        maxPages,
        lighthouseStrategy,
        crawlSpeed: speed, // Passed through for forward-compatibility
      });

      router.push(`/loading?auditId=${result.auditId}&url=${encodeURIComponent(url)}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : "Failed to start audit. Please check the URL and try again.");
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleStartAudit}>
      <Input
        label="Website URL"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isSubmitting}
        required
      />
      {error && <div role="alert">{error}</div>}
      <fieldset>
        <legend>Device</legend>
        <SegmentedControl
          ariaLabel="Device"
          options={[{ label: "Desktop", value: "desktop" }, { label: "Mobile", value: "mobile" }, { label: "Both", value: "both" }]}
          value={device}
          onChange={setDevice}
        />
      </fieldset>
      <fieldset>
        <legend>Crawl Depth</legend>
        <SegmentedControl
          ariaLabel="Crawl depth"
          options={[{ label: "Quick (1 page)", value: "quick" }, { label: "Standard (25 pages)", value: "standard" }, { label: "Deep (200 pages)", value: "deep" }]}
          value={depth}
          onChange={setDepth}
        />
      </fieldset>
      <fieldset>
        <legend>Speed</legend>
        <SegmentedControl
          ariaLabel="Speed"
          options={[{ label: "Normal", value: "normal" }, { label: "Fast", value: "fast" }]}
          value={speed}
          onChange={setSpeed}
        />
      </fieldset>
      <Button type="submit" disabled={isSubmitting || !url}>
        {isSubmitting ? "Starting Audit..." : "Run Audit"}
      </Button>
    </form>
  );
}

export default function AuditPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className="display-lg">New Audit</h1>
          <Suspense fallback={<div>Loading form...</div>}>
            <AuditForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
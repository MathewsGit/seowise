"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAudit } from "@/lib/audit-api";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./page.module.css";

function AuditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";
  
  const [url, setUrl] = useState(initialUrl);
  const [device, setDevice] = useState("desktop");
  const [depth, setDepth] = useState("standard");
  const [speed, setSpeed] = useState("normal");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const maxPages = depth === "quick" ? 1 : depth === "standard" ? 25 : 200;
    // The underlying engine's Lighthouse strategy is not resolved per-device in the assumed shape, 
    // so pass lighthouseStrategy: "auto" whenever device is "desktop" or "both".
    // Note: per-device Lighthouse selection needs backend confirmation.
    const lighthouseStrategy = (device === "desktop" || device === "both") ? "auto" : "none";
    
    try {
      const { auditId } = await startAudit({
        startUrl: url,
        maxPages,
        lighthouseStrategy,
        crawlSpeed: speed,
      });
      router.push(`/loading?auditId=${encodeURIComponent(auditId)}&url=${encodeURIComponent(url)}`);
    } catch (err: any) {
      setError(err.message || "Failed to start audit.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input 
        label="Website URL" 
        placeholder="https://example.com" 
        value={url} 
        onChange={(e) => setUrl(e.target.value)} 
        disabled={isSubmitting} 
        error={error}
      />
      <SegmentedControl 
        label="Device" 
        options={[
          { value: "desktop", label: "Desktop" },
          { value: "mobile", label: "Mobile" },
          { value: "both", label: "Both" }
        ]} 
        value={device} 
        onChange={setDevice} 
        disabled={isSubmitting}
      />
      <SegmentedControl 
        label="Crawl Depth" 
        options={[
          { value: "quick", label: "Quick (1 page)" },
          { value: "standard", label: "Standard (25 pages)" },
          { value: "deep", label: "Deep (200 pages)" }
        ]} 
        value={depth} 
        onChange={setDepth} 
        disabled={isSubmitting}
      />
      <SegmentedControl 
        label="Crawl Speed" 
        options={[
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" }
        ]} 
        value={speed} 
        onChange={setSpeed} 
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Starting Audit..." : "Start Audit"}
      </Button>
    </form>
  );
}

export default function AuditPage() {
  return (
    <div className={styles.container}>
      <Header minimal />
      <main className={styles.main}>
        <h1 className="heading-lg">Run a New Audit</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <AuditForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
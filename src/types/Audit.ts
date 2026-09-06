export interface AuditStatus {
  id: string;
  startUrl: string;
  status: "queued" | "running" | "completed" | "failed";
  pagesCrawled: number;
  pagesTotal: number;
  lighthouseTotal: number;
  lighthouseCompleted: number;
  lighthouseFailed: number;
  currentPhase: string | null;
  errorCode: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface CrawledPage {
  id: string;
  url: string;
  statusCode: number;
  fetchClass: "ok" | "blocked" | "error";
  redirectUrl: string | null;
  title: string;
  metaDescription: string;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  xRobotsTag: string | null;
  headerCanonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  headingOrder: number[];
  wordCount: number;
  contentHash: string | null;
  imagesTotal: number;
  imagesMissingAlt: number;
  images: Array<{ src: string | null; alt: string | null }>;
  links: Array<{ targetUrl: string; anchor: string | null; isInternal: boolean; isNofollow: boolean }>;
  hasStructuredData: boolean;
  hreflangTags: string[];
  isIndexable: boolean;
  responseTimeMs: number;
  crawlDepth: number | null;
  inSitemap: boolean;
}

export interface LighthouseResult {
  url: string;
  pageId: string;
  strategy: "mobile" | "desktop";
  performanceScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  seoScore: number | null;
  lcpMs: number | null;
  cls: number | null;
  inpMs: number | null;
  ttfbMs: number | null;
  errorMessage?: string | null;
}

export interface AuditIssue {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  affectedUrls: string[];
  fixSteps?: string[];
}

export interface AuditResults {
  audit: {
    id: string;
    startUrl: string;
    status: "completed" | "failed" | "running" | "queued";
    pagesCrawled: number;
    pagesTotal: number;
    startedAt: string;
    completedAt: string | null;
    config: { maxPages: number; lighthouseStrategy: "auto" | "none" };
  };
  pages: CrawledPage[];
  lighthouse: LighthouseResult[];
  issues: AuditIssue[];
}

export interface AuditHistoryEntry {
  id: string;
  startUrl: string;
  status: "completed" | "failed" | "running" | "queued";
  pagesCrawled: number;
  pagesTotal: number;
  ranLighthouse: boolean;
  startedAt: string;
  completedAt: string | null;
}
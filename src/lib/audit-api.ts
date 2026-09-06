import { AuditStatus, AuditResults, AuditHistoryEntry } from "@/types/audit";

// TODO(mathew): confirm exact path + auth header name against your deployed worker.
const PATHS = {
  start: "/api/seo/audit/start",
  status: (id: string) => `/api/seo/audit/status?auditId=${encodeURIComponent(id)}`,
  results: (id: string) => `/api/seo/audit/results?auditId=${encodeURIComponent(id)}`,
  progress: (id: string) => `/api/seo/audit/progress?auditId=${encodeURIComponent(id)}`,
  history: "/api/seo/audit/history",
  remove: (id: string) => `/api/seo/audit/${encodeURIComponent(id)}`,
} as const;

export class AuditApiError extends Error {
  public status: number;
  public code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AuditApiError";
    this.status = status;
    this.code = code;
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = "An unknown API error occurred";
    let code = "unknown_error";
    try {
      const errorData = await res.json();
      message = errorData.message || message;
      code = errorData.code || code;
    } catch {
      message = res.statusText || message;
    }
    throw new AuditApiError(res.status, code, message);
  }

  return res.json();
}

export async function startAudit(payload: { startUrl: string; maxPages?: number; lighthouseStrategy?: "auto" | "none"; crawlSpeed?: string }): Promise<{ auditId: string }> {
  return fetchApi<{ auditId: string }>(PATHS.start, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAuditStatus(id: string): Promise<AuditStatus> {
  return fetchApi<AuditStatus>(PATHS.status(id));
}

export async function getAuditResults(id: string): Promise<AuditResults> {
  return fetchApi<AuditResults>(PATHS.results(id));
}

export async function getAuditProgress(id: string): Promise<Array<{ url: string; statusCode: number; title: string; crawledAt: number }>> {
  return fetchApi<Array<{ url: string; statusCode: number; title: string; crawledAt: number }>>(PATHS.progress(id));
}

export async function getAuditHistory(): Promise<AuditHistoryEntry[]> {
  return fetchApi<AuditHistoryEntry[]>(PATHS.history);
}

export async function deleteAudit(id: string): Promise<void> {
  return fetchApi<void>(PATHS.remove(id), { method: "DELETE" });
}
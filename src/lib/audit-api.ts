import { AuditStatus, AuditResults, AuditHistoryEntry } from "@/types/audit";

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

interface McpToolCallResult<T> {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: T;
  isError?: boolean;
}

// Internal wrapper to format the JSON-RPC 2.0 MCP request
async function callMcpTool<T>(toolName: string, args: Record<string, unknown>): Promise<McpToolCallResult<T>> {
  const reqId = crypto.randomUUID();
  
  const res = await fetch("/api/seo/mcp", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      // The frontend must also declare support for SSE
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: reqId,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  if (!res.ok) {
    throw new AuditApiError(res.status, "mcp_error", await res.text());
  }

  const contentType = res.headers.get("content-type") || "";
  let payload: any = null;

  // If the server streams the response, we wait for the stream to finish
  // and extract the JSON-RPC response from the `data:` lines.
  if (contentType.includes("text/event-stream")) {
    const text = await res.text(); 
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.id === reqId && (parsed.result !== undefined || parsed.error !== undefined)) {
            payload = parsed;
          }
        } catch (e) {
          // Ignore partial or malformed stream lines
        }
      }
    }
    if (!payload) {
      throw new AuditApiError(500, "mcp_stream_error", "No JSON-RPC result found in stream");
    }
  } else {
    payload = await res.json();
  }

  if (payload.error) {
    throw new AuditApiError(500, "mcp_tool_error", payload.error.message);
  }
  
  return payload.result as McpToolCallResult<T>;
}

export async function startAudit(payload: { startUrl: string; maxPages?: number; lighthouseStrategy?: "auto" | "none"; crawlSpeed?: string }): Promise<{ auditId: string }> {
  const args = {
    url: payload.startUrl,
    maxPages: payload.maxPages ?? 50,
    runLighthouse: payload.lighthouseStrategy === "auto",
  };
  
  const result = await callMcpTool<{ auditId: string }>("run_site_audit", args);
  if (!result.structuredContent?.auditId) {
    throw new AuditApiError(500, "start_failed", result.content[0]?.text ?? "Audit did not start");
  }
  return result.structuredContent;
}

export async function getAuditStatus(id: string): Promise<AuditStatus> {
  const result = await callMcpTool<any>("get_audit_status", { auditId: id });
  if (!result.structuredContent?.status) {
    throw new AuditApiError(500, "status_failed", "Failed to get audit status");
  }
  return result.structuredContent.status as AuditStatus;
}

export async function getAuditResults(id: string): Promise<AuditResults> {
  const [statusRes, issuesRes, pagesRes] = await Promise.all([
    callMcpTool<any>("get_audit_status", { auditId: id }),
    callMcpTool<any>("get_audit_issues", { auditId: id, limit: 500 }),
    callMcpTool<any>("get_audit_pages", { auditId: id, limit: 500 }),
  ]);

  return {
    audit: {
      id: statusRes.structuredContent?.status?.id,
      startUrl: statusRes.structuredContent?.status?.startUrl,
      status: statusRes.structuredContent?.status?.status,
      pagesCrawled: statusRes.structuredContent?.status?.pagesCrawled,
      pagesTotal: statusRes.structuredContent?.status?.pagesTotal,
      startedAt: statusRes.structuredContent?.status?.startedAt,
      completedAt: statusRes.structuredContent?.status?.completedAt,
      config: { 
        maxPages: statusRes.structuredContent?.status?.pagesTotal ?? 50, 
        lighthouseStrategy: statusRes.structuredContent?.status?.lighthouseTotal > 0 ? "auto" : "none" 
      }
    },
    pages: pagesRes.structuredContent?.pages ?? [],
    issues: issuesRes.structuredContent?.issues ?? [],
    lighthouse: [] 
  };
}

export async function getAuditProgress(id: string): Promise<Array<{ url: string; statusCode: number; title: string; crawledAt: number }>> {
  const result = await callMcpTool<any>("get_audit_pages", { auditId: id, limit: 5 });
  const pages = result.structuredContent?.pages ?? [];
  return pages.map((p: any) => ({
    url: p.url,
    statusCode: p.statusCode,
    title: p.title,
    crawledAt: Date.now() 
  }));
}

export async function getAuditHistory(): Promise<AuditHistoryEntry[]> {
  throw new Error("Audit history not implemented in MCP");
}

export async function deleteAudit(id: string): Promise<void> {
  return Promise.resolve();
}
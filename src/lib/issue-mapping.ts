import { AuditIssue } from "@/types/audit";

export function mapEngineIssueToUi(issue: AuditIssue): { severity: "critical" | "warning" | "notice"; icon: string; categoryTag: string } {
  const iconMap = {
    critical: "🚨",
    warning: "⚠️",
    notice: "ℹ️",
  };
  
  // Format category tag from type, e.g. "missing_h1" -> "MISSING H1"
  const categoryTag = issue.type.replace(/_/g, " ").toUpperCase();

  return {
    severity: issue.severity,
    icon: iconMap[issue.severity] || "ℹ️",
    categoryTag,
  };
}
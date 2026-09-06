import { AuditIssue } from "@/types/audit";

export function mapEngineIssueToUi(issue: AuditIssue | any) {
  const typeStr = (issue.type || issue.issueType || "general");
  
  // The backend uses "critical", "warning", "info".
  // Our UI component explicitly expects "fail", "warning", "notice", "pass".
  let engineSeverity = issue.severity || "info";
  
  let uiSeverity = "notice";
  if (engineSeverity === "critical") uiSeverity = "fail";
  else if (engineSeverity === "warning") uiSeverity = "warning";
  else if (engineSeverity === "info") uiSeverity = "notice";
  
  return {
    severity: uiSeverity, 
    categoryTag: typeStr.split('_').join(' ').toUpperCase(),
    icon: uiSeverity === "fail" ? "⚠️" : uiSeverity === "warning" ? "⚡" : "ℹ️"
  };
}
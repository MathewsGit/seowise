import { AuditHistoryEntry } from "@/types/audit";

const HISTORY_KEY = "seowise:audit-history";
const MAX_ENTRIES = 20;

export function getHistoryEntries(): AuditHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse audit history", e);
    return [];
  }
}

export function pushHistoryEntry(entry: AuditHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistoryEntries();
    const existingIndex = history.findIndex((e) => e.id === entry.id);
    
    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.unshift(entry);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
  } catch (e) {
    console.error("Failed to save audit history", e);
  }
}

export function removeHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistoryEntries();
    const updated = history.filter((e) => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove audit history entry", e);
  }
}
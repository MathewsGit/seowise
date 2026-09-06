import { AuditHistoryEntry } from "@/types/audit";

const STORE_KEY = "seowise:audit-history";
const MAX_ENTRIES = 20;

export function getHistoryEntries(): AuditHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse audit history", e);
    return [];
  }
}

export function pushHistoryEntry(entry: AuditHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const entries = getHistoryEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    if (existingIndex > -1) {
      entries[existingIndex] = entry;
    } else {
      entries.unshift(entry);
    }
    if (entries.length > MAX_ENTRIES) {
      entries.length = MAX_ENTRIES;
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save audit history", e);
  }
}

export function removeHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const entries = getHistoryEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(STORE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to remove audit history", e);
  }
}
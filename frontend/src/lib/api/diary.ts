import { apiRequest } from "../apiClient";
import { userTimeZone } from "../date";
import type { DailySummary, MealEntry, MealEntryCreatePayload, MealEntryUpdatePayload } from "../../types";

export function createEntry(payload: MealEntryCreatePayload) {
  return apiRequest<MealEntry>("/diary/entries", { method: "POST", body: payload });
}

export function updateEntry(id: string, payload: MealEntryUpdatePayload) {
  return apiRequest<MealEntry>(`/diary/entries/${id}`, { method: "PUT", body: payload });
}

export function getRecentEntries() {
  return apiRequest<MealEntry[]>("/diary/recent?limit=8");
}

export function deleteEntry(id: string) {
  return apiRequest<void>(`/diary/entries/${id}`, { method: "DELETE" });
}

export function getDailySummary(day: string) {
  return apiRequest<DailySummary>(`/diary/summary?day=${day}&tz=${encodeURIComponent(userTimeZone)}`);
}

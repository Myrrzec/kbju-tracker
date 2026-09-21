import { apiRequest } from "../apiClient";
import { userTimeZone } from "../date";
import type { DailySummary, MealEntry, MealEntryCreatePayload } from "../../types";

export function createEntry(payload: MealEntryCreatePayload) {
  return apiRequest<MealEntry>("/diary/entries", { method: "POST", body: payload });
}

export function deleteEntry(id: string) {
  return apiRequest<void>(`/diary/entries/${id}`, { method: "DELETE" });
}

export function getDailySummary(day: string) {
  return apiRequest<DailySummary>(`/diary/summary?day=${day}&tz=${encodeURIComponent(userTimeZone)}`);
}

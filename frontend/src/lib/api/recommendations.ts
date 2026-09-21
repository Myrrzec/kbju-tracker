import { apiRequest } from "../apiClient";
import { userTimeZone } from "../date";
import type { Recommendation } from "../../types";

export function getLatestRecommendation() {
  return apiRequest<Recommendation | null>("/recommendations");
}

export function generateRecommendation(periodDays = 7) {
  return apiRequest<Recommendation>(`/recommendations/generate?period_days=${periodDays}&tz=${encodeURIComponent(userTimeZone)}`, {
    method: "POST",
  });
}

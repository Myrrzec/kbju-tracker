import { apiRequest } from "../apiClient";
import type { Recommendation } from "../../types";

export function getLatestRecommendation() {
  return apiRequest<Recommendation | null>("/recommendations");
}

export function generateRecommendation(periodDays = 7) {
  return apiRequest<Recommendation>(`/recommendations/generate?period_days=${periodDays}`, {
    method: "POST",
  });
}

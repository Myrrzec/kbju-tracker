import { apiRequest } from "../apiClient";
import type { DailyTargets, Profile, ProfileUpdatePayload } from "../../types";

export function getProfile() {
  return apiRequest<Profile>("/users/me/profile");
}

export function updateProfile(payload: ProfileUpdatePayload) {
  return apiRequest<Profile>("/users/me/profile", { method: "PUT", body: payload });
}

export function getTargets() {
  return apiRequest<DailyTargets>("/users/me/targets");
}

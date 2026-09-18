import { apiRequest } from "../apiClient";
import type { TokenResponse } from "../../types";

export function register(email: string, password: string) {
  return apiRequest<TokenResponse>("/auth/register", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

export function login(email: string, password: string) {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

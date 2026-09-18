import type { ApiErrorBody, TokenResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "kbju_access_token";
const REFRESH_TOKEN_KEY = "kbju_refresh_token";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (tokens: TokenResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class AuthExpiredError extends Error {}

function extractMessage(body: ApiErrorBody, fallback: string): string {
  if (!body.detail) return fallback;
  if (typeof body.detail === "string") return body.detail;
  return body.detail.map((d) => d.msg).join("; ");
}

async function parseErrorBody(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return extractMessage(body, fallback);
  } catch {
    return fallback;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) return false;

  const tokens = (await response.json()) as TokenResponse;
  tokenStorage.set(tokens);
  return true;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
  skipAuth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false, skipAuth = false } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

    if (!skipAuth) {
      const accessToken = tokenStorage.getAccess();
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await doFetch();

  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      tokenStorage.clear();
      throw new AuthExpiredError("Сессия истекла, войдите заново");
    }
    response = await doFetch();
  }

  if (!response.ok) {
    const message = await parseErrorBody(response, `Ошибка запроса (${response.status})`);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

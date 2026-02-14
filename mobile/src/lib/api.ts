// API client for the SaaS Template mobile app.
// Reads the auth token from SecureStore and attaches it as a Bearer token
// on every request. All responses are parsed as JSON.

import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = "http://localhost:3000";

// Attempt to read from Expo's app config (extra.apiUrl) first, then fall back
// to the default. This lets you set the URL in app.json / app.config.js:
//   { "expo": { "extra": { "apiUrl": "https://api.example.com" } } }
let _baseUrl: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  DEFAULT_BASE_URL;

/** Return the current base URL. */
export function getBaseUrl(): string {
  return _baseUrl;
}

/** Change the API base URL at runtime (e.g. for switching environments). */
export function setBaseUrl(url: string): void {
  // Strip trailing slash so callers can pass paths with a leading slash.
  _baseUrl = url.replace(/\/+$/, "");
}

export const API_BASE_URL = DEFAULT_BASE_URL;

// ---------------------------------------------------------------------------
// Secure-store token key
// ---------------------------------------------------------------------------

export const TOKEN_KEY = "saas_auth_token";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

function buildHeaders(
  token: string | null,
  isJson: boolean
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  headers["Accept"] = "application/json";
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** Error class thrown when the server returns a non-2xx response. */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? (body as { error: string }).error
        : `Request failed with status ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  // Some endpoints (e.g. DELETE) may return 204 No Content.
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let body: unknown;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// Core fetch methods
// ---------------------------------------------------------------------------

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getToken();
  const url = `${_baseUrl}${path}`;
  const hasBody = body !== undefined && body !== null;

  const response = await fetch(url, {
    method,
    headers: buildHeaders(token, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

// ---------------------------------------------------------------------------
// Public API object
// ---------------------------------------------------------------------------

export const api = {
  /** Send a GET request. */
  get<T = unknown>(path: string): Promise<T> {
    return request<T>("GET", path);
  },

  /** Send a POST request with a JSON body. */
  post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return request<T>("POST", path, body);
  },

  /** Send a PUT request with a JSON body. */
  put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return request<T>("PUT", path, body);
  },

  /** Send a DELETE request. */
  delete<T = unknown>(path: string): Promise<T> {
    return request<T>("DELETE", path);
  },
};

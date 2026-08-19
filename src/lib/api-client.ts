/**
 * API client for communicating with the Wagtail/Django backend.
 * All service layer functions use this instead of importing mock data.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.WAGTAIL_API_URL || '';

/** True when no real backend URL is configured */
const isBackendConfigured = API_URL.length > 0 && !API_URL.includes('localhost');

/**
 * Resolve an image URL. If it's a relative path (e.g. /uploads/... or /media/...),
 * prefix it with the backend API URL so it loads from Render.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path — prefix with backend URL
  if (API_URL && (url.startsWith('/uploads/') || url.startsWith('/media/'))) {
    return `${API_URL}${url.startsWith('/media/') ? url : `/media${url}`}`;
  }
  return url;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  /** Skip JSON parsing (for 204 No Content responses) */
  noContent?: boolean;
}

/**
 * Core fetch wrapper with auth, error handling, and JSON parsing.
 * Returns empty/default data gracefully when the backend is unreachable (e.g. during build).
 */
export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers: extraHeaders, noContent } = options;

  // If no backend URL is configured, return empty data for reads, throw for writes
  if (!isBackendConfigured) {
    if (method === 'GET') {
      if (path.includes('/api/v2/')) {
        return { items: [], meta: { total_count: 0 } } as unknown as T;
      }
      return [] as unknown as T;
    }
    throw new ApiError('Backend not configured', 0);
  }

  const headers: Record<string, string> = {
    ...extraHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch (err) {
    // Network error (backend not running) — return empty data for GET, throw for mutations
    if (method === 'GET') {
      console.warn(`[api-client] Backend unreachable for GET ${path} — returning empty data`);
      // Wagtail page API returns { items: [] }, DRF list endpoints return []
      if (path.includes('/api/v2/')) {
        return { items: [], meta: { total_count: 0 } } as unknown as T;
      }
      return [] as unknown as T;
    }
    throw new ApiError(
      `Backend unreachable: ${err instanceof Error ? err.message : 'connection refused'}`,
      0
    );
  }

  if (!res.ok) {
    let message = `API error: ${res.status}`;
    try {
      const data = await res.json();
      message = data.error || data.detail || JSON.stringify(data);
    } catch {
      // response body isn't JSON
    }
    throw new ApiError(message, res.status);
  }

  if (noContent || res.status === 204) {
    return undefined as T;
  }

  // Guard against empty response bodies that would cause JSON.parse to fail
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

// Convenience helpers

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return apiFetch<T>(path, { token });
}

export function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body, token });
}

export function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'PUT', body, token });
}

export function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'PATCH', body, token });
}

export function apiDelete<T = void>(path: string, token?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE', token, noContent: true });
}

/**
 * Upload a file via multipart form data.
 */
export function apiUpload<T>(path: string, file: Blob, filename: string, token?: string): Promise<T> {
  const formData = new FormData();
  formData.append('file', file, filename);
  return apiFetch<T>(path, { method: 'POST', body: formData, token });
}

/**
 * Helper to get token from localStorage (client-side only).
 * Returns empty string if not available (SSR or not logged in).
 */
export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_session') || '';
}

export function getStockistToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('stockist_session') || '';
}

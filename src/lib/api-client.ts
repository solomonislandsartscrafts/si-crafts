/**
 * API client for communicating with the Wagtail/Django backend.
 * All service layer functions use this instead of importing mock data.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.WAGTAIL_API_URL || '';

/**
 * How long a public page may be served from the Cloudflare cache before the
 * data is refetched in the background.
 *
 * This is the single most important number for perceived speed. The backend
 * runs on Render's free tier, which spins down after 15 minutes without
 * traffic and then takes 30-60s to wake. Without caching, every page render
 * blocked on that wake-up, so the first visitor after a quiet spell waited
 * the better part of a minute. With it, the cached HTML is served from the
 * edge and the cold start lands on a background revalidation instead of a
 * customer.
 *
 * Trade-off: content edited in the admin takes up to this long to appear on
 * the public site. Lower it for fresher content at the cost of more traffic
 * to the backend.
 */
export const PUBLIC_REVALIDATE_SECONDS = 300;

/**
 * Ceiling on any single request.
 *
 * This exists to stop a hung request blocking forever, not to fail fast. A
 * sleeping Render dyno accepts the connection long before it can answer, so
 * without a signal the fetch never settles. The budget sits above the observed
 * cold start (measured at 38s on an idle dyno) because a shorter one turns
 * "slow" into "broken" — and on a cached read, into an empty result that then
 * gets cached.
 */
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * True when a backend URL is configured.
 *
 * localhost is deliberately allowed so you can run the Django backend locally
 * and experiment without touching production. Unreachable backends are already
 * handled by the try/catch in apiFetch, so no extra guard is needed here.
 */
const isBackendConfigured = API_URL.length > 0;

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

/**
 * True when the backend actually answers.
 *
 * Failed GETs fall back to empty data (so builds don't break when the backend is
 * asleep), which makes "nothing created yet" and "cannot reach the backend" look
 * identical in the UI. Admin screens use this to tell the two apart before
 * showing an empty state.
 */
export async function isBackendReachable(): Promise<boolean> {
  if (!isBackendConfigured) return false;
  try {
    const res = await fetch(`${API_URL}/api/v2/products/?limit=1`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * True only for a real transport failure — the request never got an answer.
 *
 * Deliberately an allow-list rather than a catch-all. Anything else thrown out
 * of fetch() during a render is a framework signal (see the catch block in
 * apiFetch) and must not be mistaken for the backend being down.
 *
 * - undici raises TypeError("fetch failed") for DNS/connection/TLS errors.
 * - AbortSignal.timeout() raises TimeoutError; an aborted request, AbortError.
 */
function isNetworkFailure(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  const name = (err as { name?: unknown } | null)?.name;
  return name === 'TimeoutError' || name === 'AbortError';
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
  /**
   * Opt this request into Next's data cache for the given number of seconds.
   * Only honoured for un-authenticated server-side GETs — see apiFetch.
   * Prefer apiGetPublic() over setting this by hand.
   */
  revalidate?: number;
}

/**
 * Core fetch wrapper with auth, error handling, and JSON parsing.
 * Returns empty/default data gracefully when the backend is unreachable (e.g. during build).
 */
export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers: extraHeaders, noContent, revalidate } = options;

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

  /**
   * Caching policy. The default is no-store, which is what mutations,
   * authenticated reads and browser fetches all need. A request only becomes
   * cacheable when it opts in explicitly AND is safe to share:
   *
   * - GET only — never cache a write.
   * - No token — a cached response keyed loosely could serve one account's
   *   data to another, and wholesale pricing must never reach the open site.
   * - Server-side only — in the browser `next.revalidate` is meaningless and
   *   dropping no-store would let the HTTP cache hold on to admin data.
   *
   * Caching is opt-in rather than inferred on purpose: getAdminToken() returns
   * '' on the server, so "no token" alone would quietly make admin endpoints
   * look public.
   */
  const isCacheable =
    method === 'GET' && !token && revalidate !== undefined && typeof window === 'undefined';

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      // A hung request used to block a page render indefinitely, because a
      // sleeping Render dyno accepts the connection before it can answer.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...(isCacheable ? { next: { revalidate } } : { cache: 'no-store' as const }),
    });
  } catch (err) {
    /**
     * Next.js signals control flow by THROWING, not just by failing. During
     * prerendering, a `cache: 'no-store'` fetch throws DynamicServerError to
     * tell Next "this route must be dynamic"; notFound() and redirect() throw
     * too. None of these are network faults, and all of them must propagate.
     *
     * Swallowing them is not cosmetic. If DynamicServerError is caught here and
     * empty data is returned instead, Next never learns the route is dynamic,
     * so it prerenders it as STATIC with the empty result — shipping a blank
     * page to production that no amount of live backend data can fix. That also
     * made every build log read "Backend unreachable" while the backend was
     * perfectly healthy, which hid the real problem.
     *
     * So: only genuine transport failures are eligible for the fallback below.
     */
    if (!isNetworkFailure(err)) {
      throw err;
    }

    /**
     * Genuine network error or timeout.
     *
     * A cacheable GET must NOT fall back to empty data. It backs an ISR page,
     * so an empty result would render an empty page and that page would then be
     * cached at the edge for the whole revalidate window — one cold start on
     * Render turning into minutes of a blank catalogue. Throwing instead fails
     * the background revalidation, and Next keeps serving the last good page.
     *
     * Un-cached GETs keep the fallback: they are admin screens and build-time
     * reads, where an empty list is better than a crash, and nothing is stored.
     */
    if (method === 'GET' && !isCacheable) {
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

/**
 * GET a public, un-authenticated resource and allow it to be cached.
 *
 * Use this for data that appears on the open site (products, makers, crafts,
 * articles, site copy). Pages built from these calls become ISR: prerendered
 * at build time, then refreshed in the background every
 * PUBLIC_REVALIDATE_SECONDS, so a visitor's request never waits on the
 * backend.
 *
 * Do NOT use it for anything behind a login — wholesale pricing, stockist
 * accounts, admin data, or session validation. Those must stay on apiGet.
 */
export function apiGetPublic<T>(path: string, revalidate = PUBLIC_REVALIDATE_SECONDS): Promise<T> {
  return apiFetch<T>(path, { revalidate });
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

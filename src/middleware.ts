import { NextResponse, type NextRequest } from 'next/server';
import { SITE_HOST, LEGACY_PRODUCTION_HOST, hasCustomDomain } from '@/lib/metadata';

/**
 * Canonical host enforcement.
 *
 * This is a Next `middleware.ts` running on the EDGE runtime, deliberately NOT
 * the Next 16 `proxy.ts` convention. OpenNext for Cloudflare — the adapter that
 * builds and deploys this site to Workers — does not yet support the Node.js
 * `proxy` runtime: `opennextjs-cloudflare build` aborts with "Node.js
 * middleware is not currently supported", which means the deploy never
 * completes and no new code reaches production (see
 * https://github.com/cloudflare/workers-sdk/issues/13755). Edge middleware is
 * what Workers runs natively, so this file stays on the middleware convention
 * with `runtime = 'edge'` until the adapter gains proxy support.
 *
 * The site can be reached on several hostnames — the custom domain, its www
 * form, the old workers.dev address, and a workers.dev preview URL per branch.
 * Left alone, Google treats each as a separate site serving identical content,
 * splits the ranking signals between them, and picks a "canonical" itself,
 * which may well be the workers.dev one. This collapses them onto a single
 * address.
 *
 * Two deliberate limits:
 *
 * 1. Preview URLs are never redirected, only de-indexed. Sending
 *    `feature-x-si-crafts.siacrafts.workers.dev` to production would defeat the
 *    entire point of a preview deploy.
 * 2. Nothing here fires until NEXT_PUBLIC_SITE_URL names a real domain. While
 *    the site still lives on workers.dev, `hasCustomDomain` is false and the
 *    redirect branch is skipped, so deploying this ahead of the DNS cutover is
 *    inert rather than a redirect loop.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  /**
   * De-index any workers.dev host that is not the current canonical one.
   *
   * The `!== SITE_HOST` half is essential, not defensive. Until the domain
   * cutover, workers.dev IS production and is the only address the site has —
   * tagging it noindex would guarantee it never gets indexed, which is the
   * exact problem being solved. So the rule is "not the canonical host",
   * not "is workers.dev":
   *
   * - before cutover: production workers.dev == SITE_HOST → indexable;
   *   branch previews != SITE_HOST → noindex (closing a live gap, since every
   *   preview deploy is currently crawlable).
   * - after cutover: SITE_HOST is the domain, so every workers.dev host is
   *   noindexed and the production one is redirected as well.
   */
  const isNonCanonicalWorkersDev = host.endsWith('.workers.dev') && host !== SITE_HOST;

  // Send the retired production host and the www form to the canonical apex.
  // 308 (not 302) so the method is preserved and the move is cached as
  // permanent, which is what transfers accumulated ranking signal.
  const shouldRedirect =
    hasCustomDomain && (host === LEGACY_PRODUCTION_HOST || host === `www.${SITE_HOST}`);

  if (shouldRedirect) {
    const target = new URL(request.url);
    target.host = SITE_HOST;
    target.protocol = 'https:';
    target.port = '';
    return NextResponse.redirect(target, 308);
  }

  const response = NextResponse.next();
  if (isNonCanonicalWorkersDev) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

/**
 * Edge runtime — required by OpenNext for Cloudflare (see the file header). Also
 * what the Workers platform runs middleware on natively.
 *
 * `experimental-edge`, not `edge`: on Next 16 the plain `edge` value for a
 * middleware/proxy file is rejected ("the edge runtime for rendering is
 * currently experimental"), and `experimental-edge` is the accepted spelling
 * for the same runtime. The name is historical — the runtime itself is stable
 * and is exactly what Cloudflare Workers execute.
 */
export const runtime = 'experimental-edge';

export const config = {
  /**
   * Skip Next's internals and static assets. Redirecting or tagging a JS chunk
   * achieves nothing and puts this in the path of every asset request.
   * Everything else — pages, sitemap.xml, robots.txt — is covered.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

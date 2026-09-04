import type { MetadataRoute } from 'next';
import { getPublicProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { getAllCrafts } from '@/services/crafts';
import { getPublishedArticles } from '@/services/articles';
import { absoluteUrl } from '@/lib/metadata';
import { ApiError } from '@/lib/api-client';

/**
 * Rendered per request, not at build time.
 *
 * The four list services all use apiGet (cache: 'no-store'), so this route
 * cannot be prerendered. Declaring that explicitly rather than letting Next
 * infer it matters: during a build, an inferred-dynamic route is still rendered
 * once, and if anything swallows the DynamicServerError that Next throws to
 * signal "must be dynamic", the build happily bakes a sitemap containing only
 * the static routes. That is a silent failure — a valid-looking sitemap.xml
 * with every product, maker, craft and article missing.
 *
 * Trade-off: a crawler request can land on a sleeping Render dyno and wait for
 * the cold start. Acceptable — crawlers retry, and an occasional slow sitemap
 * is far better than a permanently incomplete one. `revalidate` is deliberately
 * not set, because a no-store fetch makes it inoperative anyway.
 */
export const dynamic = 'force-dynamic';

/**
 * Static public routes, with a relative priority.
 *
 * Deliberately omitted:
 * - /login and everything under /stockist — login-gated, and disallowed in
 *   robots.ts. Listing a page in a sitemap while blocking it in robots.txt is
 *   a contradiction Search Console reports as an error.
 * - /admin, /api — same.
 * - /p/{code} — QR short links that only redirect to /piece/{code}.
 */
const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/catalogue', priority: 0.9 },
  { path: '/makers', priority: 0.9 },
  { path: '/wholesale', priority: 0.9 },
  { path: '/crafts-and-techniques', priority: 0.8 },
  { path: '/about', priority: 0.7 },
  { path: '/news', priority: 0.7 },
  { path: '/stockists', priority: 0.7 },
  { path: '/contact', priority: 0.6 },
  { path: '/our-promise', priority: 0.6 },
  { path: '/for-makers', priority: 0.5 },
  { path: '/about/team', priority: 0.4 },
  { path: '/care-guide', priority: 0.4 },
  { path: '/faqs-and-shipping', priority: 0.4 },
  { path: '/piece', priority: 0.3 },
];

/**
 * Parse a backend timestamp into a Date, or undefined if it isn't usable.
 *
 * The service mappers default missing timestamps to '' rather than null, and
 * `new Date('')` is an Invalid Date. Passing one to `lastModified` throws a
 * RangeError when Next serialises it to ISO, which would take the whole sitemap
 * down over a single item with no publish date. Anything unparseable is simply
 * omitted — `lastmod` is an optional field.
 */
function toLastModified(...candidates: (string | null | undefined)[]): Date | undefined {
  for (const value of candidates) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
}

/**
 * Run a service call, degrading to an empty list on a genuine data failure.
 *
 * Catches ApiError ONLY, and rethrows everything else. The narrow catch is the
 * whole point, and it mirrors the reasoning behind isNetworkFailure() in
 * api-client.ts: Next signals control flow by throwing. A `no-store` fetch
 * during prerendering throws DynamicServerError to mean "this route must be
 * dynamic"; notFound() and redirect() throw too. Swallowing those and returning
 * [] tells Next the route rendered fine with no content, and it bakes an empty
 * sitemap — which is exactly what a catch-all here did.
 *
 * What remains worth catching: the four collection readers used below have no
 * try/catch of their own, so a reachable backend answering non-2xx (a Wagtail
 * 500, or a 400 on an unrecognised query param) propagates ApiError. Losing one
 * content type from the sitemap is a bad afternoon; a failed build is a blocked
 * deploy.
 */
async function safely<T>(label: string, fetcher: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fetcher();
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    console.warn(`[sitemap] Could not load ${label} — omitting from sitemap: ${err.message}`);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Parallel, not serial. Each request has a 60s ceiling to accommodate Render
  // cold starts, so four sequential calls could stall for four minutes.
  const [products, makers, crafts, articles] = await Promise.all([
    safely('products', getPublicProducts),
    safely('makers', getPublicMakers),
    safely('crafts', getAllCrafts),
    safely('articles', getPublishedArticles),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency: 'monthly',
    priority,
  }));

  // getPublicProducts already filters on published_flag=true server-side. The
  // client-side filter is belt and braces: if that query param is ever dropped
  // or renamed backend-side the failure is silent, and the cost of being wrong
  // is publishing an unreleased piece to Google.
  const productEntries: MetadataRoute.Sitemap = products
    .filter((product) => product.publishedFlag && product.productCode)
    .map((product) => ({
      url: absoluteUrl(`/piece/${encodeURIComponent(product.productCode)}`),
      lastModified: toLastModified(product.updatedAt, product.createdAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  // Consent gating. getPublicMakers queries consent_status=Signed and
  // published_flag=true, and the re-check here mirrors what
  // /piece/[productCode] does at line 69 for the same reason: a maker who has
  // not signed must never reach the public web, and a sitemap is a direct
  // submission to Google. This is a cultural obligation, not an optimisation.
  const makerEntries: MetadataRoute.Sitemap = makers
    .filter((maker) => maker.publishedFlag && maker.consentStatus === 'Signed' && maker.slug)
    .map((maker) => ({
      url: absoluteUrl(`/maker/${maker.slug}`),
      lastModified: toLastModified(maker.updatedAt, maker.createdAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  // Craft has no publish flag and no timestamps, so every craft is listed and
  // lastModified is omitted. culturalContextReviewFlag is a review signal for
  // the copy, not a publishing gate, so it deliberately does not filter here.
  const craftEntries: MetadataRoute.Sitemap = crafts
    .filter((craft) => craft.slug)
    .map((craft) => ({
      url: absoluteUrl(`/craft/${craft.slug}`),
      changeFrequency: 'yearly',
      priority: 0.7,
    }));

  const articleEntries: MetadataRoute.Sitemap = articles
    .filter((article) => article.published && article.slug)
    .map((article) => ({
      url: absoluteUrl(`/news/${article.slug}`),
      lastModified: toLastModified(article.updatedAt, article.publishedAt, article.createdAt),
      changeFrequency: 'yearly',
      priority: 0.6,
    }));

  return [
    ...staticEntries,
    ...productEntries,
    ...makerEntries,
    ...craftEntries,
    ...articleEntries,
  ];
}

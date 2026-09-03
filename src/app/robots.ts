import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/metadata';

/**
 * robots.txt
 *
 * Cloudflare currently serves a default, comment-only robots.txt on this host.
 * It blocks nothing, but it also tells crawlers nothing — most importantly it
 * carries no sitemap pointer. This route replaces it with a real one.
 *
 * Static, so it is emitted at build time and costs nothing to serve.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Admin surfaces and the JSON API — no reason to be in an index, and
          // crawling write endpoints is actively undesirable.
          '/admin/',
          '/api/',

          // Stockist area: wholesale pricing and order requests, login-gated.
          //
          // The trailing slash is load-bearing. robots.txt matching is a plain
          // prefix match, so a bare `/stockist` would also block `/stockists`
          // — the PUBLIC retail stockist directory, which is exactly the kind
          // of page a buyer searches for. Removing the slash silently
          // deindexes it.
          '/stockist/',

          // QR short links. /p/{code} only 307-redirects to /piece/{code};
          // indexing it would split signals across two URLs for one piece.
          '/p/',

          // Auth entry points carry no content worth ranking.
          '/login',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}

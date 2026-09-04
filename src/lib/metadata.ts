import type { Metadata } from 'next';

interface OGMetaParams {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string;
  /**
   * og:type. 'article' unlocks the published/modified time fields that news
   * aggregators read; everything else on this site is a 'website'.
   */
  type?: 'website' | 'article';
  /** ISO timestamps, only meaningful when type is 'article'. */
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Flatten admin-authored copy into a plain sentence fit for a meta description.
 *
 * Maker stories and craft descriptions are stored in the light markup that
 * CmsText understands — `**bold**` and `[label](/path)` — plus hard line breaks
 * for paragraphs. None of that renders in a search snippet, so leaving it in
 * means Google displays literal asterisks and bracketed URLs.
 *
 * Not a general markdown parser, on purpose: it handles exactly the two tokens
 * CmsText handles, because those are the only two that can occur.
 */
export function toPlainDescription(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1') // [label](/path) → label
    .replace(/\*\*([^*\n]+)\*\*/g, '$1') // **bold** → bold
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The origin every absolute URL on the site is built from — canonicals, OG
 * tags, sitemap entries and JSON-LD.
 *
 * Env-driven rather than hardcoded because the site's public home has changed
 * once already and will change again: it currently answers on a workers.dev
 * subdomain, and moves to solomonislandsartsandcrafts.com.au once that domain
 * is registered. A canonical URL pointing at a host that doesn't resolve is
 * worse than none at all — Google follows it, gets NXDOMAIN, and drops the
 * page from the index. So this must always name the host actually serving the
 * content, and the only safe way to guarantee that is to read it from the
 * environment where the build happens.
 *
 * Set NEXT_PUBLIC_SITE_URL in .env.production. Trailing slashes are stripped so
 * `${SITE_URL}${path}` can't produce a double slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://si-crafts.siacrafts.workers.dev'
).replace(/\/+$/, '');

/**
 * Just the hostname of SITE_URL, e.g. "solomonislandsartsandcrafts.com.au".
 *
 * Exported so middleware can compare it against the incoming Host header
 * without re-reading and re-parsing the env var. One derivation, one source of
 * truth — a second copy would eventually disagree with this one.
 */
export const SITE_HOST = new URL(SITE_URL).host;

/**
 * The production workers.dev host the site answered on before it had a domain.
 *
 * Pinned as an exact string rather than matched as a pattern on purpose. The
 * team's preview deploys are also *.workers.dev — LOCAL-DEV.md documents
 * `<branch>-si-crafts.siacrafts.workers.dev` — and redirecting those to
 * production would make it impossible to review a branch before merging. Only
 * this one host is treated as the retired production address.
 */
export const LEGACY_PRODUCTION_HOST = 'si-crafts.siacrafts.workers.dev';

/** True once SITE_URL names a real domain rather than the workers.dev fallback. */
export const hasCustomDomain = !SITE_HOST.endsWith('.workers.dev');

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = ''): string {
  return `${SITE_URL}${path}`;
}

/**
 * Generate consistent Open Graph metadata for any page.
 * og:title capped at 60 chars, og:description at 155 chars.
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  imageUrl,
  type = 'website',
  publishedTime,
  modifiedTime,
}: OGMetaParams): Metadata {
  const ogTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const ogDescription =
    description.length > 155 ? description.slice(0, 152) + '...' : description;
  const url = absoluteUrl(path);

  return {
    title: ogTitle,
    description: ogDescription,
    // Every caller already passes `path`, so declaring the canonical here
    // retrofits one onto all of the static pages at once. Without it, any
    // duplicate route reaching the same content (the /p/* QR redirect, query
    // strings from campaign links) competes with the real URL for indexing.
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      // Only set `images` when the page supplies a real one (e.g. a product or
      // article cover). Omitting it lets Next fall back to the generated card
      // from src/app/opengraph-image.tsx.
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
      siteName: 'Solomon Islands Arts & Crafts',
      type,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
  };
}

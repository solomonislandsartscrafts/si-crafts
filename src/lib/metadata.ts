import type { Metadata } from 'next';

interface OGMetaParams {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string;
}

const SITE_URL = 'https://solomonislandsartsandcrafts.com.au';
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

/**
 * Generate consistent Open Graph metadata for any page.
 * og:title capped at 60 chars, og:description at 155 chars.
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  imageUrl,
}: OGMetaParams): Metadata {
  const ogTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const ogDescription =
    description.length > 155 ? description.slice(0, 152) + '...' : description;
  const url = `${SITE_URL}${path}`;

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      images: [{ url: imageUrl || DEFAULT_OG_IMAGE }],
      siteName: 'Solomon Islands Arts and Crafts',
      type: 'website',
    },
  };
}

import type { Metadata } from 'next';

interface OGMetaParams {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://solomonislandsartsandcrafts.com.au';

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
      // Only set `images` when the page supplies a real one (e.g. a product or
      // article cover). Omitting it lets Next fall back to the generated card
      // from src/app/opengraph-image.tsx.
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
      siteName: 'Solomon Islands Arts Crafts',
      type: 'website',
    },
  };
}

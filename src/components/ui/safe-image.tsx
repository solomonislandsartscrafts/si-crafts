'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { resolveImageUrl } from '@/lib/api-client';

const PLACEHOLDER = '/images/placeholder image.jpg';
const PLACEHOLDER_ALT = 'Placeholder image — content coming soon';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
};

/**
 * A wrapper around next/image that falls back to a placeholder
 * when src is empty/null/undefined or when the image fails to load.
 * Provides a default alt text for placeholder images to ensure accessibility.
 * Automatically resolves relative URLs (e.g. /uploads/...) to absolute backend URLs.
 */
export function SafeImage({ src, alt, onError, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedSrc = resolveImageUrl(src);
  const isPlaceholder = !resolvedSrc || resolvedSrc.trim() === '' || hasError;
  const effectiveSrc = isPlaceholder ? PLACEHOLDER : resolvedSrc;
  const effectiveAlt = isPlaceholder ? PLACEHOLDER_ALT : (alt || PLACEHOLDER_ALT);

  return (
    <Image
      {...props}
      src={effectiveSrc}
      alt={effectiveAlt}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
    />
  );
}

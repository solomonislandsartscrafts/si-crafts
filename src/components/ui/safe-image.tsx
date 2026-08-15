'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { resolveImageUrl } from '@/lib/api-client';

const PLACEHOLDER = '/images/placeholder image.jpg';
const PLACEHOLDER_ALT = 'Placeholder image — content coming soon';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  /** When true, marks the image as decorative (empty alt, role=presentation) */
  decorative?: boolean;
  /** Border radius shorthand: 'none' | 'sm' | 'md' | 'lg' | 'full' */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
};

const RADIUS_MAP: Record<string, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * A wrapper around next/image that follows Cedar REI image guidelines:
 * - Falls back to a placeholder when src is empty/null/undefined or on load error
 * - Defaults to loading="lazy" (override with priority or loading="eager" for above-the-fold)
 * - Supports decorative images (empty alt + role="presentation")
 * - Provides border-radius shorthand via `radius` prop
 * - Automatically resolves relative URLs to absolute backend URLs
 */
export function SafeImage({
  src,
  alt,
  onError,
  decorative = false,
  radius = 'none',
  className = '',
  loading,
  priority,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedSrc = resolveImageUrl(src);
  const isPlaceholder = !resolvedSrc || resolvedSrc.trim() === '' || hasError;
  const effectiveSrc = isPlaceholder ? PLACEHOLDER : resolvedSrc;

  // Decorative images get empty alt + role=presentation per Cedar guidelines
  const effectiveAlt = decorative
    ? ''
    : isPlaceholder
      ? PLACEHOLDER_ALT
      : (alt || PLACEHOLDER_ALT);

  // Combine radius class with provided className
  const radiusClass = RADIUS_MAP[radius] || '';
  const combinedClassName = [radiusClass, className].filter(Boolean).join(' ');

  // Default to lazy loading unless priority is set or explicit loading is provided
  const effectiveLoading = priority ? undefined : (loading || 'lazy');

  return (
    <Image
      {...props}
      src={effectiveSrc}
      alt={effectiveAlt}
      className={combinedClassName}
      loading={effectiveLoading}
      priority={priority}
      {...(decorative && { role: 'presentation' })}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
    />
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api-client';

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
 * - Renders a neutral well when src is empty/null/undefined or on load error
 * - Defaults to loading="lazy" (override with priority or loading="eager" for above-the-fold)
 * - Supports decorative images (empty alt + role="presentation")
 * - Provides border-radius shorthand via `radius` prop
 * - Automatically resolves relative URLs to absolute backend URLs
 *
 * MISSING IMAGES render as a `bg-sand-light` well with a muted glyph, NOT as a
 * shared stock photograph. The old behaviour substituted one placeholder JPG,
 * which failed in two ways at once. Visually, a grid where several items lack
 * photos became a wall of the same picture, which reads as a broken page rather
 * than as content that has not arrived yet. For assistive tech it was worse: card
 * call sites always pass a real `alt`, so a maker with no portrait was announced
 * as "Julie, weaver from Titiana" over a generic image of someone else — which
 * also runs against the cultural rule about not putting words in a maker's mouth.
 * The well conveys nothing and says nothing; the caption beside it still names
 * the subject.
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
  fill,
  width,
  height,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedSrc = resolveImageUrl(src);
  const isPlaceholder = !resolvedSrc || resolvedSrc.trim() === '' || hasError;

  // Combine radius class with provided className
  const radiusClass = RADIUS_MAP[radius] || '';
  const combinedClassName = [radiusClass, className].filter(Boolean).join(' ');

  if (isPlaceholder) {
    // The caller's `className` is deliberately NOT applied here. It is written for
    // an <img> (`object-contain`, `group-hover:scale-105`), and a well that zooms
    // on hover would advertise a photo that does not exist. Radius still applies,
    // though every current call site already clips with its own rounded+overflow
    // container.
    return (
      <div
        className={[
          'flex items-center justify-center bg-sand-light',
          radiusClass,
          // `fill` callers position the image against a relative parent, so the
          // well has to fill that parent the same way.
          fill ? 'absolute inset-0 h-full w-full' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={fill ? undefined : { width, height }}
      >
        <ImageOff className="w-6 h-6 text-warm-gray-400" aria-hidden="true" />
      </div>
    );
  }

  // An empty string is a meaningful alt value: it tells assistive tech to skip
  // an image that adds nothing, which is correct when adjacent text already
  // names it. So only treat it as decorative — never substitute wording for a
  // deliberate `alt=""`.
  const isDecorative = decorative || alt === '';

  // Default to lazy loading unless priority is set or explicit loading is provided
  const effectiveLoading = priority ? undefined : (loading || 'lazy');

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={isDecorative ? '' : alt}
      fill={fill}
      width={width}
      height={height}
      className={combinedClassName}
      loading={effectiveLoading}
      priority={priority}
      {...(isDecorative && { role: 'presentation' })}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
    />
  );
}

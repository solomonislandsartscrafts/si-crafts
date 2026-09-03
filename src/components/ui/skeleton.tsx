/**
 * Loading placeholders — replaces the bare "Loading..." strings that previously
 * stood in for every async state.
 *
 * A skeleton reserves the space the real content will occupy, so the page does
 * not jump when data arrives. Prefer a skeleton whose shape matches the content
 * over a spinner.
 *
 * Motion: `animate-pulse` is disabled automatically by the global
 * prefers-reduced-motion rule in globals.css.
 */

interface SkeletonProps {
  className?: string;
}

/** A single grey block. Compose these into content-shaped placeholders. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-sand rounded animate-pulse ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

interface SkeletonRegionProps {
  /** Announced to screen readers while loading. */
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper that makes a group of skeletons announce correctly to assistive tech.
 * Use this once around a loading area, not around each Skeleton.
 */
export function SkeletonRegion({
  label = 'Loading',
  children,
  className = '',
}: SkeletonRegionProps) {
  return (
    <div aria-live="polite" aria-busy="true" className={className}>
      <p className="sr-only">{label}</p>
      {children}
    </div>
  );
}

/** Placeholder matching the ProductCard / MakerCard shape. */
export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg shadow-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-sm space-y-2xs">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** A grid of card placeholders, matching the standard card grid. */
export function SkeletonCardGrid({ count = 8 }: { count?: number }) {
  return (
    <SkeletonRegion label="Loading items">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Placeholder for a stack of text lines, e.g. a form or detail panel. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <SkeletonRegion label="Loading content">
      <div className="space-y-xs">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    </SkeletonRegion>
  );
}

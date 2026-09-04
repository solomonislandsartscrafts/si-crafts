'use client';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ocean focus:text-white focus:px-sm focus:py-2xs focus:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-light tap-target"
    >
      Skip to main content
    </a>
  );
}

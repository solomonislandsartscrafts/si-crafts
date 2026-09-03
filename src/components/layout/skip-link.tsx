'use client';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ocean focus:text-white focus:px-sm focus:py-2xs focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-light tap-target"
    >
      Skip to main content
    </a>
  );
}

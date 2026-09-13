'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

/**
 * Header search box.
 *
 * KISS: the catalogue already owns the site's product search, so this is a
 * shortcut into it rather than a second search implementation. On submit it
 * navigates to `/catalogue?q=<term>`, and the catalogue seeds its own search
 * field from that param. An empty submit just opens the catalogue.
 *
 * Rendered in the desktop header row and again inside the mobile drawer, so the
 * two share one behaviour. Styling uses the locked tokens (sand borders, ocean
 * focus ring, warm-gray placeholder) so it matches the rest of the chrome.
 */
interface HeaderSearchProps {
  /** Extra classes for the form wrapper — used to size it differently in the
      compact desktop bar vs the full-width mobile drawer. */
  className?: string;
  /** Fired after a successful submit — the mobile drawer passes its close fn so
      the drawer shuts when the search runs. */
  onSubmit?: () => void;
  /** Ref onto the text input — the desktop header uses it to focus the field
      when its search toggle opens. */
  inputRef?: React.Ref<HTMLInputElement>;
}

export function HeaderSearch({ className = '', onSubmit, inputRef }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  // Unique per instance — this renders in both the desktop bar and the mobile
  // drawer, so a hard-coded id would collide.
  const inputId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = query.trim();
    router.push(term ? `/catalogue?q=${encodeURIComponent(term)}` : '/catalogue');
    onSubmit?.();
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search the catalogue
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the catalogue…"
          // 44px tall so it meets the tap-target floor; padded right for the
          // icon button so text never runs under it.
          className="h-11 w-full rounded-md border border-sand-dark bg-white pl-sm pr-11 text-base text-warm-gray-800 placeholder:text-warm-gray-400 transition-colors focus:border-ocean focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
        />
        <button
          type="submit"
          aria-label="Search"
          className="tap-target absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-md text-warm-gray-400 transition-colors hover:text-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PieceLookupProps {
  /**
   * `dark` is for the homepage hero, where this form sits on the green band
   * inside `<HeroCodeToggle tone="dark">`. The submit button defaults to
   * `brand-green` — indistinguishable from that green backdrop — so `dark`
   * swaps it to the ocean/deep-blue fill instead, giving the lookup its own
   * distinct colour rather than disappearing into the hero. The standalone
   * `/piece` lookup page is on white, where green reads fine, so it keeps the
   * default.
   */
  tone?: 'light' | 'dark';
}

export function PieceLookup({ tone = 'light' }: PieceLookupProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter a code');
      return;
    }
    setError('');
    router.push(`/piece/${trimmed}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-stretch border border-sand-dark rounded-md overflow-hidden">
        <label htmlFor="piece-code-hero" className="sr-only">
          Enter piece code
        </label>
        <input
          id="piece-code-hero"
          type="text"
          placeholder="ENTER CODE HERE"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); }}
          className="flex-1 px-xs py-2xs text-xs font-mono uppercase text-center text-warm-gray-800 placeholder:text-warm-gray-400 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean"
          aria-describedby={error ? 'piece-code-hero-error' : undefined}
          aria-invalid={!!error}
        />
        <button
          type="submit"
          className={`tap-target px-sm py-2xs text-white text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 ${
            tone === 'dark'
              ? 'bg-ocean hover:bg-ocean-dark focus-visible:ring-ocean-light'
              : 'bg-brand-green hover:bg-brand-green-dark focus-visible:ring-brand-green-light'
          }`}
        >
          GO
        </button>
      </div>
      {error && (
        <p id="piece-code-hero-error" className="text-xs text-error mt-3xs" aria-live="assertive">
          {error}
        </p>
      )}
    </form>
  );
}

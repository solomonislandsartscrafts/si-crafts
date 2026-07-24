'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PieceLookup() {
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
          className="flex-1 px-3 py-2 text-xs font-mono uppercase text-center text-warm-gray-800 placeholder:text-warm-gray-400 bg-white focus:outline-none"
          aria-describedby={error ? 'piece-code-hero-error' : undefined}
          aria-invalid={!!error}
        />
        <button
          type="submit"
          className="tap-target px-4 py-2 bg-ocean text-white text-xs font-bold uppercase tracking-wider hover:bg-ocean-dark transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          GO
        </button>
      </div>
      {error && (
        <p id="piece-code-hero-error" className="text-xs text-error mt-1" aria-live="assertive">
          {error}
        </p>
      )}
    </form>
  );
}

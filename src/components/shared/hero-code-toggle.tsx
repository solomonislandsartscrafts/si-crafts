'use client';

import { useState } from 'react';
import { PieceLookup } from './piece-lookup';

interface HeroCodeToggleProps {
  /** Background the toggle sits on. `dark` flips the collapsed link to white so
   *  it reads on a coloured banner band, and passes through to `<PieceLookup>`
   *  so its submit button switches from green (invisible on the green hero) to
   *  ocean/deep-blue. */
  tone?: 'light' | 'dark';
}

export function HeroCodeToggle({ tone = 'light' }: HeroCodeToggleProps) {
  const [showInput, setShowInput] = useState(false);

  if (showInput) {
    return (
      <div className="mt-lg max-w-xs">
        <PieceLookup tone={tone} />
      </div>
    );
  }

  const linkClasses =
    tone === 'dark'
      ? 'text-white/80 hover:text-white'
      : 'text-ocean hover:text-ocean-dark';

  return (
    <div className="mt-lg">
      <button
        onClick={() => setShowInput(true)}
        className={`text-sm font-medium transition-colors ${linkClasses}`}
      >
        I have a product code →
      </button>
    </div>
  );
}

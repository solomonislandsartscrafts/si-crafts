'use client';

import { useEffect, useState } from 'react';
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

  // When the lookup is revealed, hand focus to the code input. The trigger
  // button that had focus is removed from the DOM on reveal, so without this a
  // keyboard user is dropped back to the top of the tab order and has to tab
  // forward to reach the field they just asked for (WCAG 2.4.3, focus order).
  useEffect(() => {
    if (showInput) {
      document.getElementById('piece-code-hero')?.focus();
    }
  }, [showInput]);

  if (showInput) {
    return (
      <div id="hero-code-lookup" className="mt-lg max-w-xs">
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
        type="button"
        onClick={() => setShowInput(true)}
        className={`focus-ring press-sink rounded-sm text-sm font-medium transition-colors ${linkClasses}`}
      >
        I have a product code →
      </button>
    </div>
  );
}

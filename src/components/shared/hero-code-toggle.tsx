'use client';

import { useState } from 'react';
import { PieceLookup } from './piece-lookup';

export function HeroCodeToggle() {
  const [showInput, setShowInput] = useState(false);

  if (showInput) {
    return (
      <div className="mt-8 max-w-xs">
        <PieceLookup />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        onClick={() => setShowInput(true)}
        className="text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
      >
        I have a product code →
      </button>
    </div>
  );
}

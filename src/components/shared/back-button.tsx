'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** Fallback URL if there's no browser history (e.g. direct link, QR scan) */
  fallback?: string;
  /** Label text shown next to the arrow */
  label?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Smart back button that uses browser history (router.back()) so users
 * return to wherever they came from — homepage, catalogue, maker page, etc.
 *
 * Falls back to a specified URL if there's no history (direct entry / QR scan).
 */
export function BackButton({
  fallback = '/catalogue',
  label = 'Back',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    // Check if there's actual navigation history.
    // window.history.length > 1 is not fully reliable (browsers pre-seed it),
    // but combined with referrer check it covers most cases.
    if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-3xs text-sm text-ocean hover:text-ocean-dark transition-colors ${className}`.trim()}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}

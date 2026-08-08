'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Floating "scroll to top" button. Appears once the user scrolls past the
 * first viewport, sits directly above the accessibility widget (bottom-24
 * to clear the widget's bottom-6 + h-14).
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check on mount (e.g. back-navigation partway down)
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollUp() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      className="fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full bg-deep-blue text-white shadow-md flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-ocean opacity-100 translate-y-0"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

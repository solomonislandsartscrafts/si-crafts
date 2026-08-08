/**
 * Framer Motion configuration that respects prefers-reduced-motion.
 * Import these helpers when using Framer Motion animations.
 */

/** Transition preset that disables animation when reduced motion is preferred */
export function getTransition(duration = 0.3) {
  if (typeof window === 'undefined') return { duration };
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { duration: prefersReduced ? 0 : duration };
}

/** Fade-in variant that respects reduced motion */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Slide-up variant that respects reduced motion */
export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

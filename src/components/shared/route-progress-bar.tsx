'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * A thin progress bar at the top of the viewport that animates
 * during Next.js App Router route transitions.
 *
 * Uses pathname + searchParams changes to detect navigation start/end.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  function completeAndHide() {
    setProgress(100);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (failsafeRef.current) { clearTimeout(failsafeRef.current); failsafeRef.current = null; }
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
    return hideTimer;
  }

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();

    if (currentPath !== prevPathRef.current) {
      // Navigation completed — finish the bar and scroll to top
      window.scrollTo(0, 0);
      const hideTimer = completeAndHide();
      prevPathRef.current = currentPath;
      return () => clearTimeout(hideTimer);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to detect navigation start
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (anchor.target === '_blank') return;
      if (anchor.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Internal navigation detected — start progress
      const currentPath = pathname + searchParams.toString();
      // Normalize href for comparison by stripping origin if present
      const normalizedHref = href.replace(/^https?:\/\/[^/]+/, '');
      // Don't show bar for same-page navigation
      if (normalizedHref === pathname || normalizedHref === currentPath) return;

      setVisible(true);
      setProgress(20);

      // Gradually increase to simulate loading
      if (timerRef.current) clearInterval(timerRef.current);
      if (failsafeRef.current) clearTimeout(failsafeRef.current);

      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Hard failsafe: force-complete after 8 seconds if navigation hasn't triggered
      failsafeRef.current = setTimeout(() => {
        completeAndHide();
      }, 8000);
    }

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (failsafeRef.current) clearTimeout(failsafeRef.current);
    };
  }, [pathname, searchParams]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-ocean transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100
            ? 'width 200ms ease-out, opacity 300ms ease-out 100ms'
            : 'width 300ms ease-out',
        }}
      />
    </div>
  );
}

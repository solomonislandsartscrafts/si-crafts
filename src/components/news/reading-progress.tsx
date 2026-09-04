'use client';

import { useEffect, useState } from 'react';

/**
 * Reading-progress bar for long-form articles.
 *
 * A thin gold rule pinned to the top of the viewport that fills from 0 to 100%
 * as the reader moves through the article body — cheap wayfinding for a long
 * page ("how far in am I?"). Gold, not ocean, so it never reads as the
 * ocean `RouteProgressBar` that appears during navigation.
 *
 * Progress is measured against a target element (the <article>), not the whole
 * document: the header, sidebar and footer are not part of "the read", so the
 * bar should be empty at the article's first line and full at its last, rather
 * than only completing at the bottom of the page.
 *
 * Purely decorative, so `aria-hidden`. Under `prefers-reduced-motion` the bar
 * still tracks the scroll (that is not motion the user did not initiate) but
 * drops the width transition so it does not lag behind the thumb.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    let frame = 0;

    function update() {
      frame = 0;
      const target = document.getElementById(targetId);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Distance the article top has travelled above the viewport top, over the
      // scrollable span of the article (its height minus one viewport, since the
      // last viewport-worth is on screen once the bottom is reached).
      const scrolled = -rect.top;
      const scrollable = Math.max(rect.height - viewport, 1);
      const pct = (scrolled / scrollable) * 100;
      setProgress(Math.min(100, Math.max(0, pct)));
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 h-1 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className={`h-full bg-accent-gold ${reduceMotion ? '' : 'transition-[width] duration-150 ease-out'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

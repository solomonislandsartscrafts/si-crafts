'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';

/** What the slide is showing. Decides the image fit — see `imageFit` below. */
export type SlideKind = 'product' | 'maker';

export interface SlideItem {
  imageUrl: string;
  imageAlt: string;
  kind: SlideKind;
  /** Product name, or the maker's name. */
  title: string;
  /** Second line: the maker credit on a product, the village on a maker. */
  subtitle?: string;
  /**
   * Small label above the title — the craft on a product slide, "Meet the
   * maker" on a maker slide. Without it the two slide kinds look identical
   * and a portrait reads as just another product photo.
   */
  eyebrow?: string;
  href: string;
  /** CSS object-position to control crop focus (e.g. 'top', '50% 30%'). Admin-set. */
  objectPosition?: string;
}

interface HeroSlideshowProps {
  items: SlideItem[];
  interval?: number;
  /**
   * Background the slideshow sits on. The caption now sits BELOW the frame on
   * that background (not overlaid on the image), so its text colour has to
   * follow the tone: light (white/gold) on the dark hero band, ink
   * (deep-blue/ocean) on a white page. The homepage passes `dark`.
   */
  tone?: 'light' | 'dark';
}

/**
 * Outer width of the whole carousel — centre frame plus the two peeking
 * neighbours. It fills its column and is capped, because the hero has to fit
 * the first viewport on a laptop: past ~620px the centre frame grows tall
 * enough to push the buttons and the sponsor row off screen.
 */
const trackWidth = 'w-full max-w-[620px]';

/**
 * Width of ONE frame, as a share of the track.
 *
 * 68% of the track, so ~13% of the track shows either side as a peek. One
 * share at every width — the track caps at 620px and simply fills a narrower
 * column on a phone, so the peek reads the same and the frame never has to
 * shrink to a different ratio.
 *
 * Changing this number changes the peek width — see `PEEK_STEP`.
 */
const frameWidth = 'w-[64%]';

/**
 * Square (1:1). Shorter than the previous 4:5 portrait, so the centre frame
 * takes less vertical room in the hero — which matters because the hero has to
 * fit the first viewport. A square reads as a neutral gallery tile and suits
 * both a maker portrait (`object-cover`) and a product cut-out
 * (`object-contain`) equally.
 */
const frameAspect = 'aspect-square';

/**
 * How far a neighbour sits from the centre, as a percentage of ONE frame's
 * width (CSS `translateX` percentages resolve against the element's own
 * untransformed box, and every frame is the same width, so the unit is
 * consistent).
 *
 * The track only leaves ~110px either side of the centre frame, so the two
 * competing goals — a GUTTER so the neighbour never clips the centre card, and
 * showing enough of the neighbour to read as a card — are tightly constrained.
 * These values are tuned against a 620px track / 64% centre frame:
 *
 *   step 86 + scale 0.66 → neighbour is ~262px, pushed to ~341px from centre.
 *   Its inner edge lands ~12px PAST the centre frame's edge (a small gutter, no
 *   overlap), and ~100px of it shows inside the track with its rounded corners
 *   and shadow visible — a card sitting behind, not a hard-cropped strip.
 *
 * Raising `PEEK_STEP` pushes the neighbour further out until only a thin
 * straight sliver shows (the strip look); lowering it slides the neighbour over
 * the centre frame's edge (overlap). `PEEK_SCALE` trades the two off: a smaller
 * neighbour fits more of itself inside the track for the same gutter. The active
 * frame also carries `z-10` so it always paints in front regardless of DOM order.
 */
const PEEK_STEP = 86;

/** Neighbours are scaled down so they clearly read as behind/secondary. */
const PEEK_SCALE = 0.66;

/**
 * A maker is photographed as a person, expecting a crop, so the portrait fills
 * the frame. A product is photographed as an object — most shots are cut-outs
 * on white, and a cropped basket handle reads as a defect — so it sits contained
 * inside the frame instead. Same rule the poster cards follow.
 */
function imageFit(kind: SlideKind): string {
  return kind === 'maker' ? 'object-cover' : 'object-contain';
}

/**
 * Where a slide sits relative to the active one: 0 is centre, -1 is the left
 * peek, +1 the right peek. Anything further out is off-stage and not rendered.
 *
 * Wraps the short way round, because the carousel does: on the last slide,
 * index 0 is the neighbour to the RIGHT (+1), not (count - 1) to the left.
 */
function relativeOffset(index: number, active: number, count: number): number {
  const half = Math.floor(count / 2);
  let offset = index - active;
  if (offset > half) offset -= count;
  if (offset < -half) offset += count;
  return offset;
}

/**
 * Hero carousel — one large centre frame with the previous and next slides
 * peeking in either side, products and makers in the same run.
 *
 * The peek is doing a job, not decoration: it shows at a glance that the hero
 * holds more than one piece, and it gives a direct target for the slide either
 * side. The homepage hides the whole slideshow below `lg` (`hidden lg:block` on
 * its wrapper in `page.tsx`) so the mobile sponsor row stays in the first
 * viewport — so it only ever renders where the two-column hero gives it room.
 *
 * The centre slide's caption sits BELOW the frame on a solid background, not
 * overlaid on the image — the house `PosterCard` pattern. An overlaid caption
 * failed on a product cut-out: the object floats on white in the middle of the
 * frame, so text at the bottom landed on the white void with no image behind it
 * to read against, and it covered the very piece a buyer was assessing. Below
 * the frame the text is always legible and the photo is never touched.
 * Neighbours carry no caption; they are dimmed and scaled so the centre reads
 * as the subject.
 *
 * Auto-advances, pausing on hover/focus, and supports swipe and arrow keys.
 * Autoplay is off entirely under `prefers-reduced-motion`. A slim gold progress
 * bar along the bottom edge of the active image shows the advance. There is no
 * pause button (removed at the design's request); hover/focus pausing and the
 * reduced-motion opt-out remain.
 */
export function HeroSlideshow({ items, interval = 5000, tone = 'light' }: HeroSlideshowProps) {
  // The caption sits BELOW the frame on the page background, so its text colour
  // follows `tone`: light on the dark hero band, ink on a white page.
  const [current, setCurrent] = useState(0);
  // Autoplay pauses while the pointer/focus is over the carousel.
  const [hovering, setHovering] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = items.length;

  // Autoplay only runs when nothing is holding it: more than one slide, not
  // hovered/focused, and motion is allowed.
  const autoplaying = count > 1 && !hovering && !reduceMotion;

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  // Start time + last-move time let touchEnd work out swipe velocity, so a fast
  // flick jumps several slides and a slow drag moves just one.
  const touchStartTime = useRef(0);
  const lastMoveTime = useRef(0);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(motionQuery.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    motionQuery.addEventListener('change', onMotionChange);
    return () => motionQuery.removeEventListener('change', onMotionChange);
  }, []);

  const go = useCallback(
    (direction: 1 | -1) => setCurrent((prev) => (prev + direction + count) % count),
    [count]
  );

  // Advance by an arbitrary (signed) number of slides, wrapping. Used by the
  // velocity-based swipe: a fast flick can jump several at once.
  const goBy = useCallback(
    (steps: number) => setCurrent((prev) => (((prev + steps) % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (!autoplaying) return;
    const timer = setInterval(() => go(1), interval);
    return () => clearInterval(timer);
    // `current` is a dependency so the interval is cleared and restarted
    // whenever the active slide changes — including after manual navigation
    // (arrow keys, swipe, or clicking a peek). Without it a manual advance
    // could be followed by an auto-advance almost immediately.
  }, [autoplaying, interval, go, current]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    touchStartTime.current = e.timeStamp;
    lastMoveTime.current = e.timeStamp;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    lastMoveTime.current = e.timeStamp;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const totalDx = touchDeltaX.current;
    const absDx = Math.abs(totalDx);

    // Swipe velocity in px/ms, over the time from touch start to the last move
    // sample (release often lands after a short pause, so measuring to the last
    // MOVE keeps a quick throw reading as fast).
    const flickDt = Math.max(1, lastMoveTime.current - touchStartTime.current);
    const velocity = absDx / flickDt;

    // A swipe counts if it either moved far enough (a slow, deliberate drag) or
    // was thrown fast enough (a short, quick flick). Below both it snaps back.
    const FAST = 0.6; // px/ms — a brisk flick
    const DISTANCE = 40; // px — a slow deliberate drag

    if (absDx >= DISTANCE || velocity >= 0.3) {
      const direction = totalDx < 0 ? 1 : -1; // swipe left → next, right → prev

      // Fast flicks jump multiple slides; the faster the throw, the more it
      // travels — so a hard flick feels fast and a gentle drag moves one.
      let steps = 1;
      if (velocity >= FAST) {
        steps = Math.min(count - 1, 1 + Math.floor((velocity - FAST) / 0.6));
      }
      goBy(direction * steps);
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  }

  if (count === 0) {
    return (
      <div
        className={`${trackWidth} mx-auto ${frameAspect} flex items-center justify-center border border-dashed border-sand-dark bg-card-bg`}
      >
        <p className="px-sm text-center text-base text-warm-gray-400">Images coming soon</p>
      </div>
    );
  }

  // `current` is clamped against the CURRENT item count, not the count it was
  // set against. If items shrink between renders, the stale index would point
  // past the end and `active` would be undefined.
  const safeIndex = current % count;
  const active = items[safeIndex];

  const motion = reduceMotion ? '' : 'transition-all duration-500 ease-out';

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Handmade pieces and the makers behind them"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
      onKeyDown={handleKeyDown}
    >
      {/* The stage. `overflow-hidden` is what turns the neighbours into peeks —
          they are positioned mostly outside the track and clipped to it.
          `py-xs` is not spacing for its own sake: without it the same clip would
          shave the top and bottom of every frame's `shadow-card`. */}
      <div
        className={`relative ${trackWidth} mx-auto overflow-hidden py-xs`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Every frame is absolutely positioned so they can overlap, which
            leaves nothing in flow to give the stage a height. This invisible
            twin of a frame supplies it. */}
        <div className={`${frameWidth} ${frameAspect} invisible`} aria-hidden="true" />

        {items.map((item, index) => {
          const offset = relativeOffset(index, safeIndex, count);
          // Only the centre and its two neighbours are mounted, so the homepage
          // does not request every hero image before the first has painted.
          if (Math.abs(offset) > 1) return null;

          const isActive = offset === 0;

          return (
            // The frame is ALWAYS this same plain div, and its interactive
            // element is a stretched overlay inside it. That split is what makes
            // the motion work: advancing turns the centre frame into a peek and
            // a peek into the centre, so if the frame itself swapped between
            // `<a>` and `<button>` React would tear it down and remount it at
            // its new transform, and every advance would snap instead of slide.
            <div
              key={index}
              className={[
                // `top-xs` matches the stage's `py-xs`: an absolutely positioned
                // child is placed against the padding box, so `top-0` would sit
                // above the height spacer rather than level with it.
                'group absolute left-1/2 top-xs overflow-hidden bg-card-bg shadow-card',
                frameWidth,
                frameAspect,
                motion,
                // The active frame paints in front of the peeks no matter the
                // DOM order, so a neighbour can never clip the hero card's edge.
                // Peeks recede: dimmed and slightly darkened so the eye lands on
                // the centre first, with a hairline edge so the frame reads as a
                // card. Hovering a peek brings it back to full to invite a click.
                isActive
                  ? 'z-10'
                  : 'opacity-70 brightness-90 ring-1 ring-black/5 hover:opacity-100 hover:brightness-100',
              ].join(' ')}
              style={{
                // translateX percentages resolve against the frame's own
                // untransformed width, and scale is applied first, so the two
                // functions do not interfere. -50% centres it; the step pushes a
                // neighbour out to its peek position.
                transform: `translateX(${offset * PEEK_STEP - 50}%) scale(${isActive ? 1 : PEEK_SCALE})`,
              }}
            >
              {/* Image well — the whole frame is now the image. The caption
                  moved OUT to a row below the stage (see after the map), so
                  there is no overlay, no gradient scrim, and no bottom inset on
                  the image any more. */}
              <SafeImage
                src={item.imageUrl}
                // Decorative: the caption below the stage names the piece/maker,
                // and the stretched link/button carries its own accessible name,
                // so a real alt would announce it twice.
                alt=""
                fill
                className={`${imageFit(item.kind)} ${
                  isActive && !reduceMotion
                    ? 'transition-transform duration-300 group-hover:scale-105'
                    : ''
                }`}
                style={{ objectPosition: item.objectPosition || 'center' }}
                // The slideshow only renders from `lg` up, where the frame is
                // ~440px; the small-viewport hint is a conservative fallback.
                sizes="(max-width: 1024px) 70vw, 440px"
                priority={index === 0}
              />

              {/* Autoplay progress — a slim gold bar along the BOTTOM edge of
                  the active image frame, filling over one `interval` before the
                  carousel advances. The one visible signal that the hero moves
                  (the pause button was removed at the design's request; autoplay
                  still pauses on hover/focus and under reduced motion). Re-keyed
                  on `safeIndex` so it restarts from empty on every advance. Gold
                  reads on any image edge well enough as a thin graphical bar.
                  Shown only while actually autoplaying. `origin-left` + `scaleX`
                  keyframe animates width cheaply on the compositor. */}
              {isActive && autoplaying && (
                <span
                  key={safeIndex}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left animate-progress-fill bg-accent-gold"
                  style={{ animationDuration: `${interval}ms` }}
                />
              )}

              {/* Stretched control, covering the whole frame. `ring-inset`
                  because the stage clips its children, so an outward ring on a
                  full-height frame would be shaved off.

                  A neighbour is a button, not a link: its job is to bring that
                  slide to the centre. It must not be a link — a peek is a
                  cropped, unlabelled image, so navigating away from it is a
                  guess. The link/button carries the piece name as its
                  accessible name, since the overlaid label is aria-hidden. */}
              {isActive ? (
                <Link
                  href={item.href}
                  className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean"
                >
                  <span className="sr-only">{item.title}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrent(index)}
                  className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean"
                  aria-label={`Show ${item.title}`}
                />
              )}

            </div>
          );
        })}
      </div>

      {/* Caption row — BELOW the stage now, on the page background rather than
          overlaid on the image (design request: no blue gradient over the
          photo). A single centred line: EYEBROW │ Title. Colour follows `tone`,
          because it sits on the background: light (white title, gold eyebrow) on
          the dark hero band, ink (deep-blue title, ocean eyebrow) on a white
          page. Priority is the title — it never truncates
          (`whitespace-nowrap shrink-0`); the eyebrow gives way first
          (`min-w-0 truncate`). Re-keyed on `safeIndex` so it cross-fades as the
          active slide changes. */}
      {active && (
        <div
          key={safeIndex}
          className="mt-sm flex animate-fade-in-up items-center justify-center gap-2xs overflow-hidden px-sm"
        >
          {active.eyebrow && (
            <>
              <span
                className={`min-w-0 truncate text-xs font-semibold uppercase tracking-wide ${
                  tone === 'dark' ? 'text-accent-gold-light' : 'text-ocean'
                }`}
              >
                {active.eyebrow}
              </span>
              <span
                aria-hidden="true"
                className={`h-3 w-px shrink-0 ${
                  tone === 'dark' ? 'bg-accent-gold-light/50' : 'bg-sand-dark'
                }`}
              />
            </>
          )}
          <span
            className={`shrink-0 whitespace-nowrap font-heading text-base font-semibold leading-title-sm ${
              tone === 'dark' ? 'text-white' : 'text-deep-blue'
            }`}
          >
            {active.title}
          </span>
        </div>
      )}

      {/* Navigation lives on the frames: the whole centre frame is a link, the
          peeks are buttons that recentre, and swipe + arrow keys work. This
          sr-only live region keeps the current slide and position announced for
          screen-reader users. */}
      {count > 1 && (
        <p className="sr-only" aria-live="polite">
          Showing {active.title}, {safeIndex + 1} of {count}
        </p>
      )}
    </div>
  );
}

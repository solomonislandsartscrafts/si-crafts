'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Pause, Play } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { posterBodyClasses } from '@/components/cards/poster-card';

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
}

/**
 * The frame is capped and centred rather than filling its column.
 *
 * The hero has to fit the first viewport on a laptop, and at the hero column's
 * full width a portrait frame would be tall enough to push the buttons and the
 * sponsor row off screen. The cap holds the whole slideshow — frame, caption
 * and controls — inside roughly 700px on every screen. The trade-off is quiet
 * space either side on a wide display.
 */
const frameWidth = 'w-full max-w-[380px] sm:max-w-[420px]';

/**
 * 4:5 rather than the 3:4 the cards use. Same portrait feel, noticeably less
 * height, which is what buys the room to run the frame wider than the cards do.
 */
const frameAspect = 'aspect-[4/5]';

/**
 * Reserves room for eyebrow + title + a two-line credit, so the label rule and
 * the controls below it do not jump when a short caption follows a long one.
 * Raised from 6.5rem when the label gained gallery spacing — the tallest case
 * is now ~119px, and anything under that lets the rule shift between slides.
 */
const captionMinHeight = 'min-h-[7.5rem]';

/**
 * A maker is photographed as a person, expecting a crop, so the portrait fills
 * the frame. A product is photographed as an object — most shots are cut-outs
 * on white, and a cropped basket handle reads as a defect — so it sits contained
 * inside the mat instead. Same rule the poster cards follow.
 */
function imageFit(kind: SlideKind): string {
  return kind === 'maker' ? 'object-cover' : 'object-contain';
}

/**
 * True for the active slide and the one either side of it — the only slides
 * that need to be in the DOM.
 *
 * Wraps at both ends, because the slideshow does: on the last slide the "next"
 * neighbour is index 0. With three or fewer slides every slide is a neighbour,
 * so the window is the whole run.
 */
function isNearby(index: number, active: number, count: number): boolean {
  if (count <= 3) return true;
  const distance = Math.abs(index - active);
  return Math.min(distance, count - distance) <= 1;
}

/**
 * The frame, built as a gallery would hang the work rather than as a web card.
 *
 * Square corners and a hairline rule instead of `rounded-lg` + `shadow-card`:
 * a radius and a cast shadow read as "UI card floating above a page", which is
 * the opposite of a hung work. A single hairline is how a mounted piece meets
 * the wall.
 *
 * The padding is a mat. It is white, not the grey well this used to have —
 * grey turned every cut-out product shot into a framed grey rectangle, whereas
 * a white mat reads as mount board and lets the object's own edge be the edge.
 *
 * `aspect-[4/5]` sits on the border box, so the mat is subtracted from the
 * image area and the outer frame keeps its proportion at every width.
 */
const frameClasses =
  'relative overflow-hidden border border-sand bg-card-bg p-2 sm:p-3 transition-colors duration-200 group-hover:border-warm-gray-400';

/**
 * Hero slideshow — one image at a time, cross-fading, products and makers in
 * the same run.
 *
 * Deliberately not a multi-card or peeking carousel. A craft object's silhouette
 * and a maker's face are both the thing being looked at, so a half-hidden
 * neighbour only reads as a cropped photo. One image, whole, in a portrait frame.
 *
 * Presented as a gallery hangs a work rather than as a web carousel: a square
 * hairline frame with a white mat, a tombstone label beneath it, and a plate
 * number aligned to the frame's left edge. The chrome is kept quiet on purpose
 * — the photograph is the only thing on this side of the hero that should pull
 * the eye. See `frameClasses` for why the radius and shadow are gone.
 *
 * The caption sits below the frame on the page background — the same
 * arrangement as `PosterCard`, and it keeps white text off arbitrary
 * photographs.
 *
 * Auto-advances with an explicit pause control (WCAG 2.2.2), pauses on
 * hover/focus, and supports swipe and arrow keys. Autoplay is off entirely
 * under `prefers-reduced-motion`.
 */
export function HeroSlideshow({ items, interval = 5000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  // Hover/focus pausing and the pause button are tracked separately, so moving
  // the mouse away does not restart a slideshow the user deliberately stopped.
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = items.length;

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

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

  useEffect(() => {
    if (count <= 1 || hovering || userPaused || reduceMotion) return;
    const timer = setInterval(() => go(1), interval);
    return () => clearInterval(timer);
  }, [count, hovering, userPaused, interval, go, reduceMotion]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (touchDeltaX.current < -50) go(1);
    else if (touchDeltaX.current > 50) go(-1);
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
        className={`${frameWidth} mx-auto ${frameAspect} flex items-center justify-center border border-dashed border-sand-dark bg-card-bg`}
      >
        <p className="px-4 text-center text-base text-warm-gray-400">Images coming soon</p>
      </div>
    );
  }

  // `current` is clamped against the CURRENT item count, not the count it was
  // set against. If items shrink between renders, the stale index would point
  // past the end and `active` would be undefined.
  const safeIndex = current % count;
  const active = items[safeIndex];

  // Square rather than `rounded-sm`, to match the frame. No `display` utility
  // baked in: the caller applies `flex`, so this stays usable if a second
  // control is ever added back alongside pause.
  const iconButtonClasses =
    'h-11 w-11 items-center justify-center text-warm-gray-400 transition-colors hover:text-deep-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean';

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
      {/* One link wraps frame and caption, exactly as PosterCard does, and its
          href follows the visible slide. Keeping a single stable link (rather
          than one per slide) means React never tears the node down mid-fade. */}
      <Link
        href={active.href}
        className={`group ${frameWidth} mx-auto block focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`${frameAspect} ${frameClasses}`}>
          {items.map((item, index) => {
            // Only the visible slide and its two neighbours are mounted. The
            // slide count is admin-set, and mounting all of them made the
            // homepage request every hero image before the first one had
            // painted. Both neighbours stay mounted so the cross-fade in either
            // direction still has something to fade to.
            if (!isNearby(index, safeIndex, count)) return null;
            return (
              <SafeImage
                key={index}
                src={item.imageUrl}
                // Decorative on purpose: the caption directly below names the
                // piece or the maker, and it sits inside this same link, so a
                // real alt here would announce every slide twice. The descriptive
                // alt belongs on the detail page.
                alt=""
                fill
                className={`${imageFit(item.kind)} ${
                  index === safeIndex ? 'opacity-100' : 'opacity-0'
                } ${reduceMotion ? '' : 'transition-opacity duration-500 ease-out'}`}
                style={{ objectPosition: item.objectPosition || 'center' }}
                sizes="(max-width: 640px) 380px, 420px"
                priority={index === 0}
              />
            );
          })}
        </div>

        {/* Tombstone label — the caption set the way a gallery captions a work:
            a quiet category line, the work or artist named, then the material
            and place. Sits on the page background with no panel, re-keyed per
            slide so it fades in with the image instead of snapping.

            The category line is deliberately neutral rather than the site's
            ocean accent. On a wall label the text is never the loud element;
            colouring it competes with the photograph directly above it. */}
        <div
          key={safeIndex}
          className={`pt-4 ${captionMinHeight} ${reduceMotion ? '' : 'animate-fade-in-up'}`}
        >
          {active.eyebrow && (
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-warm-gray-400">
              {active.eyebrow}
            </span>
          )}
          {/* Italic for a product, roman for a person: the standard museum
              label distinction between the title of a work and the name of its
              maker. It is the cheapest possible signal that this is a
              catalogued object rather than a listing. */}
          <span
            className={`mt-2 block font-heading text-lg font-semibold leading-tight text-deep-blue transition-colors group-hover:text-ocean ${
              active.kind === 'product' ? 'italic' : ''
            }`}
          >
            {active.title}
          </span>
          {/* The maker credit is the point of the page, so it gets body size
              rather than the 14px it had as a footnote. */}
          {active.subtitle && (
            <span className={`mt-1.5 block ${posterBodyClasses}`}>{active.subtitle}</span>
          )}
        </div>
      </Link>

      {count > 1 && (
        <>
          {/* Control strip, aligned to the frame's own edges under a hairline.
              A gallery aligns the label and the plate number to the left edge
              of the work rather than centring them beneath it, so the whole
              column reads as one hung item. The hairline is the only rule in
              the composition — the frame supplies the other edges. */}
          <div
            className={`${frameWidth} mx-auto mt-1 flex items-center border-t border-sand pt-1`}
          >
            {/* Plate number. Mono and zero-padded so the strip does not reflow
                as the index goes from 9 to 10, and because a catalogue number
                is the one place a gallery does use a monospaced figure. */}
            <span className="font-mono text-xs tabular-nums text-warm-gray-400">
              {String(safeIndex + 1).padStart(2, '0')}
              <span className="px-1">/</span>
              {String(count).padStart(2, '0')}
            </span>

            {/* No prev/next arrows. Ticks already give direct access to every
                slide, swipe covers touch, and the arrow keys are bound on the
                region — so arrows only added a third control type to a 420px
                strip. Eight controls in a row is the opposite of the restraint
                this treatment is going for.

                Scrolls rather than reflows: the slide count is admin-set, and
                past seven the fixed 44px hit boxes would otherwise burst the
                frame width. */}
            <div className="ml-auto flex items-center overflow-x-auto scrollbar-hide">
              {/* Hit boxes stay a full 44px square and sit flush against each
                  other, so every slide is a reliable target on a phone. Only
                  the visible mark changed: a tick that extends when active
                  rather than a dot. Dots read as a generic web carousel; a rule
                  that lengthens reads as an index. */}
              {items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className="group/tick flex h-11 w-11 flex-shrink-0 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                  aria-label={`Show ${item.title}`}
                  aria-current={index === safeIndex}
                >
                  <span
                    className={`h-0.5 transition-all duration-200 ${
                      index === safeIndex
                        ? 'w-5 bg-deep-blue'
                        : 'w-2.5 bg-sand-dark group-hover/tick:bg-warm-gray-400'
                    }`}
                  />
                </button>
              ))}

              {/* Only meaningful while something is actually moving. Under
                  reduced motion the slideshow never advances on its own, so
                  there is nothing to pause. */}
              {!reduceMotion && (
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  className={`flex flex-shrink-0 ${iconButtonClasses}`}
                  aria-label={userPaused ? 'Resume slideshow' : 'Pause slideshow'}
                >
                  {userPaused ? (
                    <Play className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Pause className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {active.title}, {safeIndex + 1} of {count}
          </p>
        </>
      )}
    </div>
  );
}

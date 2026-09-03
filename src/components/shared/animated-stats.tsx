'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: string;
  label: string;
}

interface AnimatedStatsProps {
  stats: Stat[];
  variant?: 'light' | 'dark';
}

export function AnimatedStats({ stats, variant = 'light' }: AnimatedStatsProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(motionQuery.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    motionQuery.addEventListener('change', onChange);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', onChange);
    };
  }, []);

  const borderColor = variant === 'dark' ? 'border-white/20' : 'border-sand';
  const valueColor = variant === 'dark' ? 'text-white' : 'text-deep-blue';
  const labelColor = variant === 'dark' ? 'text-white/60' : 'text-warm-gray-600';
  const dividerColor = variant === 'dark' ? 'bg-white/20' : 'bg-sand';

  return (
    <div ref={ref}>
      {/* Desktop: grid layout (md+) */}
      <div className={`hidden md:grid md:grid-cols-4 border-t border-b ${borderColor}`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`py-md sm:py-lg px-sm sm:px-md text-center ${
              reduceMotion ? '' : 'transition-all duration-700'
            } ${
              index > 0 ? `border-l ${borderColor}` : ''
            } ${
              reduceMotion || visible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={reduceMotion ? undefined : { transitionDelay: `${index * 150}ms` }}
          >
            <p className={`font-heading text-base font-semibold tracking-wide ${valueColor}`}>
              {stat.value}
            </p>
            <p className={`text-sm mt-3xs ${labelColor}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: horizontal scrolling marquee (below md) */}
      <div
        className={`md:hidden overflow-hidden border-t border-b ${borderColor} py-sm transition-opacity duration-700 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {reduceMotion ? (
          /* Single static set when reduced motion is preferred */
          <div className="flex w-max" aria-label="Key facts">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <div className={`w-px h-8 mx-md flex-shrink-0 ${dividerColor}`} aria-hidden="true" />
                )}
                <div className="flex-shrink-0 text-center px-2xs">
                  <p className={`font-heading text-sm font-semibold tracking-wide whitespace-nowrap ${valueColor}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-3xs whitespace-nowrap ${labelColor}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Animated marquee with duplicated set for seamless loop */
          <div className="flex w-max animate-marquee" aria-label="Key facts">
            {/* Accessible set */}
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <div className={`w-px h-8 mx-md flex-shrink-0 ${dividerColor}`} aria-hidden="true" />
                )}
                <div className="flex-shrink-0 text-center px-2xs">
                  <p className={`font-heading text-sm font-semibold tracking-wide whitespace-nowrap ${valueColor}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-3xs whitespace-nowrap ${labelColor}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
            {/* Duplicated set for seamless loop — hidden from assistive tech */}
            {stats.map((stat, index) => (
              <div key={`dup-${index}`} className="flex items-center" aria-hidden="true">
                <div className={`w-px h-8 mx-md flex-shrink-0 ${dividerColor}`} />
                <div className="flex-shrink-0 text-center px-2xs">
                  <p className={`font-heading text-sm font-semibold tracking-wide whitespace-nowrap ${valueColor}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-3xs whitespace-nowrap ${labelColor}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

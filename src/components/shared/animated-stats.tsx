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
    return () => observer.disconnect();
  }, []);

  const borderColor = variant === 'dark' ? 'border-white/20' : 'border-sand';
  const valueColor = variant === 'dark' ? 'text-white' : 'text-deep-blue';
  const labelColor = variant === 'dark' ? 'text-white/60' : 'text-warm-gray-600';

  return (
    <div ref={ref} className={`grid grid-cols-2 md:grid-cols-4 border-t border-b ${borderColor}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`py-6 sm:py-8 px-4 sm:px-6 text-center transition-all duration-700 ${
            index % 2 !== 0 ? `border-l ${borderColor}` : ''
          } ${index >= 2 ? `border-t md:border-t-0 ${borderColor}` : ''} ${index > 0 ? `md:border-l ${borderColor}` : ''} ${
            visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: `${index * 150}ms` }}
        >
          <p className={`font-heading text-sm sm:text-base font-semibold tracking-wide ${valueColor}`}>
            {stat.value}
          </p>
          <p className={`text-xs sm:text-sm mt-1 ${labelColor}`}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

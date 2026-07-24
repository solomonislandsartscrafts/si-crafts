'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: string;
  label: string;
}

interface AnimatedStatsProps {
  stats: Stat[];
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
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

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 divide-x divide-sand">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`py-6 sm:py-8 px-4 sm:px-6 text-center transition-all duration-700 ${
            visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: `${index * 150}ms` }}
        >
          <p className="font-heading text-lg sm:text-xl font-bold text-deep-blue">
            {stat.value}
          </p>
          <p className="text-xs sm:text-sm text-warm-gray-600 mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

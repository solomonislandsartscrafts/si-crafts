'use client';

import Image from 'next/image';

/**
 * Sponsor logos banner displayed below the hero on the homepage.
 *
 * Only verified supporters go in here. The array previously padded itself out
 * to four with the SICA logo repeated under the labels "Sponsor 2", "Sponsor 3",
 * and "Sponsor 4", which claimed backing that does not exist. Add a real entry
 * as each supporter is confirmed; the band hides itself while the list is empty.
 */

const sponsors = [{ id: 'sica', name: 'SICA', logo: '/images/sica logo.png' }];

export function SponsorBanner() {
  if (sponsors.length === 0) return null;

  return (
    <section className="py-5 sm:py-6 lg:py-8 border-b border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-warm-gray-400 text-center mb-3 sm:mb-4">
          Supported by
        </p>
        <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-12 flex-wrap">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex items-center justify-center h-10 sm:h-12 lg:h-14 px-3 sm:px-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              title={sponsor.name}
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={120}
                height={56}
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { AdminLayout } from '@/components/admin';
import { SetupWizard } from '@/components/admin/setup-wizard';
import { AdminGuide, GUIDE_SECTIONS } from '@/components/admin/admin-guide';
import { pageTitleClasses } from '@/components/layout/page-header';
import type { SetupProgress } from '@/types';

/** We pass empty progress since the checklist no longer shows completion state. */
const EMPTY_PROGRESS: SetupProgress = {
  categories: 0, crafts: 0, makers: 0, products: 0, articles: 0, siteImages: 0,
};

export default function GettingStartedPage() {
  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <header className="mb-md">
          <h1 className={pageTitleClasses}>Getting started</h1>
          <p className="text-base text-warm-gray-600 mt-2xs leading-body">
            Everything you need to know to manage this site. Follow the setup checklist first, then
            use the guides below whenever you need them. Nothing on this page changes the site &mdash; it&apos;s
            just a reference.
          </p>
        </header>

        {/* In-page navigation */}
        <nav aria-label="Guide sections" className="mb-md">
          <ul className="flex flex-wrap gap-2xs">
            {GUIDE_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="tap-target inline-flex items-center px-xs py-2xs text-sm font-medium text-ocean bg-white border border-sand rounded-md hover:bg-ocean hover:text-white hover:border-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-md">
          {/* Setup checklist */}
          <section id="setup" className="bg-card-bg rounded-lg shadow-card p-md sm:p-md scroll-mt-6">
            <h2 className="font-heading text-xl md:text-2xl font-medium text-deep-blue">Setup checklist</h2>
            <p className="text-base text-warm-gray-600 mt-2xs leading-body">
              Do these in order. Each step depends on the one before it &mdash; you can&apos;t add a product
              until you&apos;ve added a maker, and you can&apos;t add a maker until you&apos;ve added a craft.
            </p>
            <div className="mt-md">
              <SetupWizard progress={EMPTY_PROGRESS} />
            </div>
          </section>

          <AdminGuide />
        </div>
      </div>
    </AdminLayout>
  );
}

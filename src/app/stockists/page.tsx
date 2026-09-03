import { ExternalLink, MapPin, Phone, Mail, Clock, Store } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageCta, PageHeader } from '@/components/layout';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { getRetailStockistsSafe } from '@/services/retail-stockists';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'Stockists',
  description: 'Find Solomon Islands Arts & Crafts in museum and gallery shops across Australia.',
  path: '/stockists',
});

export default async function StockistsPage() {
  const [stockists, text] = await Promise.all([getRetailStockistsSafe(), getSiteTextSafe()]);

  return (
    <div>
      <PageHeader
        banner="green"
        eyebrow="Where to find us"
        title={text['stockists.title']}
        intro={text['stockists.intro']}
      />

      <div className="site-container pb-section">
        {stockists.length === 0 ? (
          <EmptyState
            icon={Store}
            title={text['stockists.emptyTitle']}
            description={text['stockists.emptyDescription']}
          />
        ) : (
          <div className="space-y-lg">
            {stockists.map((stockist) => (
              <div key={stockist.id} className="bg-card-bg rounded-lg shadow-card p-md md:p-lg">
                <div className="flex items-start justify-between gap-sm mb-sm">
                  <div>
                    {stockist.city && (
                      <p className="text-xs font-medium text-ocean uppercase tracking-wide mb-3xs">
                        {stockist.city}
                      </p>
                    )}
                    <h2 className="font-heading text-lg font-semibold text-deep-blue">
                      {stockist.name}
                    </h2>
                  </div>
                  {stockist.url && (
                    <ButtonLink
                      href={stockist.url}
                      variant="secondary"
                      size="sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      Website
                    </ButtonLink>
                  )}
                </div>

                <div className="space-y-2xs text-base text-warm-gray-600">
                  {stockist.address && (
                    <div className="flex items-start gap-2xs">
                      <MapPin
                        className="w-4 h-4 text-warm-gray-400 mt-3xs flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{stockist.address}</span>
                    </div>
                  )}
                  {stockist.phone && (
                    <div className="flex items-center gap-2xs">
                      <Phone
                        className="w-4 h-4 text-warm-gray-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <a
                        href={`tel:${stockist.phone.replace(/\s/g, '')}`}
                        className="hover:text-ocean transition-colors"
                      >
                        {stockist.phone}
                      </a>
                    </div>
                  )}
                  {stockist.email && (
                    <div className="flex items-center gap-2xs">
                      <Mail
                        className="w-4 h-4 text-warm-gray-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <a
                        href={`mailto:${stockist.email}`}
                        className="hover:text-ocean transition-colors"
                      >
                        {stockist.email}
                      </a>
                    </div>
                  )}
                  {(stockist.hours || stockist.closed) && (
                    <div className="flex items-start gap-2xs">
                      <Clock
                        className="w-4 h-4 text-warm-gray-400 mt-3xs flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        {stockist.hours && <p>{stockist.hours}</p>}
                        {stockist.closed && <p className="text-warm-gray-400">{stockist.closed}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA for stockists who want to stock us */}
      <PageCta heading={text['stockists.ctaHeading']}>
        <ButtonLink href="/wholesale">{text['stockists.ctaButton']}</ButtonLink>
      </PageCta>
    </div>
  );
}

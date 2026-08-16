import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { getRetailStockists } from '@/services/retail-stockists';

export const metadata = generatePageMetadata({
  title: 'Stockists',
  description: 'Find Solomon Islands Arts Crafts in museum and gallery shops across Australia.',
  path: '/stockists',
});

export default async function StockistsPage() {
  const stockists = await getRetailStockists();

  return (
    <div>
      <PageHeader
        title="Stockists"
        intro="Find Solomon Islands Arts Crafts in these museum and gallery shops. Visit in person or contact them to ask about availability."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
      <div className="space-y-8">
        {stockists.map((stockist) => (
          <div key={stockist.name} className="bg-card-bg rounded-lg shadow-card p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-ocean uppercase tracking-wide mb-1">
                  {stockist.city}
                </p>
                <h2 className="font-heading text-lg font-semibold text-deep-blue">
                  {stockist.name}
                </h2>
              </div>
              <a
                href={stockist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-ocean border border-ocean/30 rounded-md hover:bg-ocean/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Website
              </a>
            </div>

            <div className="space-y-2 text-sm text-warm-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-warm-gray-400 mt-0.5 flex-shrink-0" />
                <span>{stockist.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-warm-gray-400 flex-shrink-0" />
                <a href={`tel:${stockist.phone.replace(/\s/g, '')}`} className="hover:text-ocean transition-colors">
                  {stockist.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-warm-gray-400 flex-shrink-0" />
                <a href={`mailto:${stockist.email}`} className="hover:text-ocean transition-colors">
                  {stockist.email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-warm-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{stockist.hours}</p>
                  <p className="text-warm-gray-400">{stockist.closed}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA for stockists who want to stock us */}
      <div className="mt-12 bg-sand-light rounded-lg p-6 text-center">
        <p className="text-warm-gray-600 mb-4">
          Are you a museum or gallery shop interested in stocking SI Crafts?
        </p>
        <Link
          href="/wholesale"
          className="tap-target inline-flex items-center gap-2 px-5 py-3 btn-primary"
        >
          Learn about wholesale
        </Link>
      </div>
      </div>
    </div>
  );
}

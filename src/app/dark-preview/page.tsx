import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageCta } from '@/components/layout/page-cta';
import { FlagDivider } from '@/components/layout/flag-divider';
import { ButtonLink } from '@/components/ui/button';
import { Info } from 'lucide-react';

/**
 * DARK THEME PREVIEW — /dark-preview
 *
 * A standalone, self-contained mock of the homepage rendered under the scoped
 * `.dark-preview` dark palette (see globals.css). This exists ONLY so the dark
 * theme can be reviewed on a real URL before deciding whether to roll it out
 * across the site. It does not touch the live homepage, fetches no data, and
 * reuses the same section rhythm, classes and shared components the real
 * homepage uses so the colours read faithfully.
 *
 * Delete this route (and the `.dark-preview` block in globals.css) if the dark
 * theme is not adopted, or promote the palette to real tokens if it is.
 */

// Keep the preview out of search + sitemaps — it is a throwaway review page.
export const metadata = {
  title: 'Dark theme preview',
  robots: { index: false, follow: false },
};

const sampleProducts = [
  { code: 'P-J-1', name: 'Pandanus fruit bowl', maker: 'Julie, Auki, Malaita', craft: 'Pandanus weaving' },
  { code: 'W-S-3', name: 'Carved nguzunguzu figure', maker: 'Simon, Munda, Western', craft: 'Wood carving' },
  { code: 'S-M-2', name: 'Shell-money necklace', maker: 'Mary, Langalanga, Malaita', craft: 'Shell-money jewellery' },
];

const sampleMakers = [
  { name: 'Julie', place: 'Auki, Malaita', craft: 'Pandanus weaving' },
  { name: 'Simon', place: 'Munda, Western', craft: 'Wood carving' },
  { name: 'Mary', place: 'Langalanga, Malaita', craft: 'Shell-money jewellery' },
];

const sampleNews = [
  { title: 'Meet the weavers of Malaita', date: '18 September 2026' },
  { title: 'New shell-money pieces arrive', date: '2 September 2026' },
];

/** A card frame that stands in for the real ProductCard/MakerCard in the mock. */
function MockCard({ title, sub, meta, pill }: { title: string; sub?: string; meta?: string; pill?: string }) {
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-card-bg shadow-card">
        {/* Stand-in image well — a flat surface so the card chrome/shadow is
            what we are judging, not photography. */}
        <div className="absolute inset-0 flex items-center justify-center bg-card-bg text-warm-gray-400 text-sm">
          Image
        </div>
        {pill && (
          <span className="absolute right-xs top-xs rounded-sm bg-deep-blue px-xs py-3xs text-xs text-white">
            {pill}
          </span>
        )}
      </div>
      <div className="pt-xs">
        <h3 className="font-heading text-base font-semibold text-deep-blue group-hover:text-ocean transition-colors">
          {title}
        </h3>
        {sub && <p className="mt-3xs text-base text-warm-gray-800">{sub}</p>}
        {meta && <p className="mt-2xs text-sm text-warm-gray-600">{meta}</p>}
      </div>
    </div>
  );
}

export default function DarkPreviewPage() {
  return (
    <div className="dark-preview min-h-screen">
      {/* The real site header, rendered inside the dark scope so it picks up the
          scoped dark overrides (see the .dark-preview .header-* rules in
          globals.css). It is the actual <Header> component, not a copy, so what
          you see here is exactly how the live header would re-theme. */}
      <Header />

      {/* A slim notice so it is obvious this is the preview, not the live page. */}
      <div className="site-container py-xs">
        <p className="text-sm text-warm-gray-600">
          Dark theme preview — a throwaway mock of the homepage. The live site is unchanged.
        </p>
      </div>

      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-white">
          <div className="relative site-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-md lg:gap-x-xl items-center lg:items-start py-section">
              <div className="order-1 xl:col-span-3">
                <div className="flex items-center gap-xs mb-sm">
                  <span className="w-8 h-px bg-deep-blue/40" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-widest text-deep-blue/80">
                    Wholesale Solomon Islands handicrafts
                  </span>
                </div>
                <FlagDivider variant="mark" className="mb-sm" />
                <h1 className="font-heading text-3xl sm:text-4xl xl:text-5xl font-medium text-deep-blue leading-heading max-w-xl">
                  Handmade in Solomon Islands
                </h1>
                <p className="mt-2xs text-base text-warm-gray-600 leading-body max-w-md">
                  Every product is handmade. When you buy from us, you invest directly in Solomon Islands
                  artisans, their communities, their traditions, and their futures.
                </p>
                <div className="mt-md flex flex-wrap items-center gap-xs">
                  <ButtonLink href="/dark-preview">Browse Catalogue</ButtonLink>
                  <ButtonLink href="/dark-preview" variant="secondary">
                    Our story
                  </ButtonLink>
                </div>
              </div>
              <div className="hidden lg:block order-2 xl:col-span-2 w-full">
                <div className="aspect-square rounded-lg bg-card-bg shadow-card flex items-center justify-center text-warm-gray-400 text-sm">
                  Hero gallery
                </div>
              </div>
            </div>
          </div>
        </section>

        <FlagDivider />
      </div>

      {/* Featured Products — warm band */}
      <section className="section-y section-band">
        <div className="site-container">
          <div className="flex items-end justify-between mb-stack">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                Featured products
              </h2>
              <FlagDivider variant="mark" className="mt-xs" />
            </div>
            <Link
              href="/dark-preview"
              className="inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid">
            {sampleProducts.map((p) => (
              <MockCard key={p.code} title={p.name} meta={p.maker} pill={p.craft} />
            ))}
          </div>
          <div className="mt-stack max-w-2xl border-l-2 border-ocean pl-sm">
            <div className="flex items-start gap-2xs">
              <Info className="w-4 h-4 text-ocean shrink-0 mt-3xs" aria-hidden="true" />
              <p className="text-sm text-warm-gray-600">
                Wholesale only. Approved stockists sign in to see trade pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Makers — white */}
      <section className="section-y">
        <div className="site-container">
          <div className="flex items-end justify-between mb-stack">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                Meet the makers
              </h2>
              <FlagDivider variant="mark" className="mt-xs" />
            </div>
            <Link
              href="/dark-preview"
              className="inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid">
            {sampleMakers.map((m) => (
              <MockCard key={m.name} title={m.name} sub={m.craft} meta={m.place} />
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <PageCta
        contained
        heading="Stock Solomon Islands craft in your shop"
        description="We supply Australian museum and gallery shops. Get in touch to start a wholesale enquiry."
      >
        <ButtonLink href="/dark-preview">Become a stockist</ButtonLink>
      </PageCta>

      {/* Latest News — white */}
      <section className="section-y">
        <div className="site-container">
          <div className="flex items-end justify-between mb-stack">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                Latest news
              </h2>
              <FlagDivider variant="mark" className="mt-xs" />
            </div>
            <Link
              href="/dark-preview"
              className="hidden sm:inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              All articles
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-grid max-w-3xl">
            {sampleNews.map((n) => (
              <div key={n.title} className="group">
                <div className="aspect-video overflow-hidden rounded-lg bg-card-bg shadow-card flex items-center justify-center text-warm-gray-400 text-sm">
                  Cover
                </div>
                <div className="pt-xs">
                  <p className="text-sm text-warm-gray-600">{n.date}</p>
                  <h3 className="mt-3xs font-heading text-lg font-semibold text-deep-blue group-hover:text-ocean transition-colors">
                    {n.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

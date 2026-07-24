import Link from 'next/link';
import Image from 'next/image';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'About',
  description:
    'Learn about Solomon Islands, the SIAC volunteer team, and why we bring these crafts to Australia.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div>
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-section-lg pb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">
          About
        </h1>
        <p className="text-lg text-warm-gray-600 max-w-2xl leading-relaxed">
          Solomon Islands Arts and Crafts connects makers in Solomon Islands with
          museum and gallery shops in Australia — telling authentic stories and
          building respectful trade relationships.
        </p>
      </div>

      {/* Section 1: About Solomon Islands — image LEFT */}
      <section className="py-section-lg" id="solomon-islands">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 relative aspect-[16/9] md:aspect-[4/5] rounded-lg overflow-hidden bg-sand-light shadow-card">
              <Image
                src="/images/A1_About Solomon Islands.jpg"
                alt="Solomon Islands landscape"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="lg:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
                About Solomon Islands
              </h2>
              <div className="space-y-4 text-warm-gray-600 leading-relaxed">
                <p>
                  Solomon Islands is a sovereign nation of over 990 islands spread across the
                  southwestern Pacific Ocean. It is about three hours by plane from Brisbane.
                  Home to around 700,000 people speaking more than 70 languages, the country holds
                  one of the most diverse cultural heritages in the Pacific region.
                </p>
                <p>
                  The islands are rich with tropical rainforest, coral reefs, and volcanic landscapes.
                  Communities are spread across nine provinces from the large island of Guadalcanal in
                  the south to the remote Temotu Province in the far east. Each province has distinct
                  traditions, art forms, and materials shaped by geography and ancestry. The capital,
                  Honiara, is on Guadalcanal and was a strategic military base during World War II.
                </p>
                <p>
                  Craft traditions — pandanus weaving, wood carving, and shell-money making — are
                  living practices passed through families and communities, not museum artefacts.
                  They carry stories of place, kinship, and identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About the SIAC Team — image RIGHT (alternated) */}
      <section className="py-section-lg bg-sand-light" id="team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
                About the Solomon Islands Arts and Crafts (SIAC) Team
              </h2>
              <div className="space-y-4 text-warm-gray-600 leading-relaxed">
                <p>
                  Solomon Islands Arts and Crafts is run entirely by volunteers who share a
                  connection to Solomon Islands — through family, work, friendship, or simply
                  a deep respect for the culture and its people.
                </p>
                <p>
                  Our team handles importing, quality documentation, photography, liaising with
                  makers, and wholesale distribution to Australian museum and gallery shops.
                  We work directly with makers and their families to ensure every relationship
                  is fair, respectful, and transparent.
                </p>
                <p>
                  We are not a charity. We are a small business built on the principle that
                  these extraordinary crafts deserve to reach a wider audience — and that the
                  makers deserve fair payment and recognition for their work. Solomon Islands
                  Arts and Crafts was founded in 2026 as a volunteer-run social enterprise.
                </p>
                <p className="pt-2">
                  <Link href="/about/team" className="text-ocean hover:text-ocean-dark font-medium transition-colors">
                    Find out more about our team →
                  </Link>
                </p>
              </div>
            </div>
            <div className="lg:col-span-2 relative aspect-[16/9] md:aspect-[4/5] rounded-lg overflow-hidden bg-sand shadow-card order-1 lg:order-2">
              <Image
                src="/images/A2_bout the Solomon Islands Arts and Crafts.jpg"
                alt="The SIAC volunteer team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Why We're Doing This — image LEFT */}
      <section className="py-section-lg" id="mission">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 relative aspect-[16/9] md:aspect-[4/5] rounded-lg overflow-hidden bg-sand-light shadow-card">
              <Image
                src="/images/A3_whywedoingthis.jpg"
                alt="Solomon Islands maker at work"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="lg:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
                Why We&apos;re Doing This
              </h2>
              <div className="space-y-4 text-warm-gray-600 leading-relaxed">
                <p>
                  Solomon Islands makers produce work of extraordinary skill and beauty —
                  pandanus bags that take weeks to weave, shell-money necklaces ground disc by
                  disc, carvings shaped from hardwood and inlaid with pearl shell over days of
                  careful work.
                </p>
                <p>
                  But access to markets outside Solomon Islands is limited. Transport is expensive,
                  connections are few, and the stories behind the work rarely travel with the pieces.
                </p>
                <p>
                  We exist to bridge that gap. Every product we bring to Australia carries the
                  maker&apos;s name, village, and story. Every product tag links to a provenance page
                  that tells you exactly who made your piece and how. We believe knowing the
                  maker transforms an object into a connection to a person and a place.
                </p>
                <p>
                  Providing a wider market for Solomon Islands arts and crafts also helps to
                  maintain cultural traditions and the transfer of skills through generations.
                </p>
                <p>
                  Our goal is simple: more income for makers, more stories shared, more respect
                  for Solomon Islands craft traditions in the wider world.
                </p>
                <p className="pt-2">
                  <Link href="/for-makers" className="text-ocean hover:text-ocean-dark font-medium transition-colors">
                    Are you a maker in Solomon Islands? Learn how to work with us →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

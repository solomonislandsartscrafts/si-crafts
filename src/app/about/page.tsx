import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'About',
  description:
    'Learn about Solomon Islands, the SIAC volunteer team, and why we bring these crafts to Australia.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-12">
        About
      </h1>

      {/* Section 1: About Solomon Islands */}
      <section className="mb-16" id="solomon-islands">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
          About Solomon Islands
        </h2>
        <div className="space-y-4 text-warm-gray-600 leading-relaxed">
          <p>
            Solomon Islands is a sovereign nation of over 900 islands spread across the
            southwestern Pacific Ocean. Home to around 700,000 people speaking more than
            70 languages, the country holds one of the most diverse cultural heritages in
            the Pacific region.
          </p>
          <p>
            The islands are rich with tropical rainforest, coral reefs, and volcanic landscapes.
            Communities are spread across provinces from the large island of Guadalcanal in the
            south to the remote Temotu Province in the east. Each province has distinct
            traditions, art forms, and materials shaped by geography and ancestry.
          </p>
          <p>
            Craft traditions — pandanus weaving, wood carving, and shell-money making — are
            living practices passed through families and communities, not museum artefacts.
            They carry stories of place, kinship, and identity.
          </p>
        </div>
      </section>

      {/* Section 2: About the SIAC Team */}
      <section className="mb-16" id="team">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
          About the SIAC Team
        </h2>
        <div className="space-y-4 text-warm-gray-600 leading-relaxed">
          <p>
            Solomon Islands Arts and Crafts is run entirely by volunteers who share a
            connection to Solomon Islands — through family, work, friendship, or simply
            a deep respect for the culture and its people.
          </p>
          <p>
            Our team handles importing, quality documentation, photography, and wholesale
            distribution to Australian museum and gallery shops. We work directly with
            makers and their families to ensure every relationship is fair, respectful,
            and transparent.
          </p>
          <p>
            We are not a charity. We are a small business built on the principle that
            these extraordinary crafts deserve to reach a wider audience — and that the
            makers deserve fair payment and recognition for their work.
          </p>
        </div>
      </section>

      {/* Section 3: Why We're Doing This */}
      <section id="mission">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
          Why We&apos;re Doing This
        </h2>
        <div className="space-y-4 text-warm-gray-600 leading-relaxed">
          <p>
            Solomon Islands makers produce work of extraordinary skill and beauty —
            pandanus bags that take weeks to weave, shell-money necklaces ground disc by
            disc, carvings shaped from hardwood over days of careful work.
          </p>
          <p>
            But access to markets outside Solomon Islands is limited. Transport is expensive,
            connections are few, and the stories behind the work rarely travel with the pieces.
          </p>
          <p>
            We exist to bridge that gap. Every product we bring to Australia carries the
            maker&apos;s name, village, and story. Every product tag links to a provenance page
            that tells you exactly who made your piece and how. We believe knowing the
            maker transforms an object into a connection.
          </p>
          <p>
            Our goal is simple: more income for makers, more stories told, more respect
            for Solomon Islands craft traditions in the wider world.
          </p>
          <p>
            <a href="/for-makers" className="text-ocean hover:text-ocean-dark font-medium transition-colors">
              Are you a maker in Solomon Islands? Learn how to work with us →
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

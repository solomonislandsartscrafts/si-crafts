import { generatePageMetadata } from '@/lib/metadata';
import { AcknowledgementOfCountry, PageCta, PageHeader } from '@/components/layout';
import { ButtonLink } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { SmartLink } from '@/components/ui/smart-link';
import { getSiteContentSafe } from '@/services/site-content';

export const metadata = generatePageMetadata({
  title: 'About',
  description:
    'Learn about Solomon Islands, the SIAC volunteer team, and why we bring these crafts to Australia.',
  path: '/about',
});

export default async function AboutPage() {
  const siteContent = await getSiteContentSafe();

  // Helper: split CMS text into paragraphs (double-newline separated)
  function renderParagraphs(text: string) {
    return text
      .split(/\n\n+/)
      .filter((p) => p.trim())
      .map((p, i) => <p key={i}>{p.trim()}</p>);
  }

  return (
    <div>
      <PageHeader
        title="About"
        intro={siteContent.aboutPageIntro || "Solomon Islands Arts Crafts connects makers in Solomon Islands with museum and gallery shops in Australia — telling authentic stories and building respectful trade relationships."}
      />

      {/* Section 1: About Solomon Islands — image LEFT */}
      <section className="section-y" id="solomon-islands">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <figure className="lg:col-span-2">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-sand-light shadow-card">
                <SafeImage
                  src={siteContent.aboutSolomonIslandsImage}
                  alt={siteContent.aboutSolomonIslandsImageAlt || "Solomon Islands landscape"}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </figure>
            <div className="lg:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">
                {siteContent.aboutSolomonIslandsHeading || "About Solomon Islands"}
              </h2>
              <div className="space-y-4 text-warm-gray-600 leading-relaxed">
                {siteContent.aboutSolomonIslandsText ? (
                  renderParagraphs(siteContent.aboutSolomonIslandsText)
                ) : (
                  <>
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
                  </>
                )}
                <p className="pt-2">
                  <SmartLink
                    href={siteContent.aboutSolomonIslandsLinkUrl || "https://en.wikipedia.org/wiki/Solomon_Islands"}
                    className="inline-flex items-center gap-1.5 text-ocean hover:text-ocean-dark font-medium transition-colors"
                  >
                    {siteContent.aboutSolomonIslandsLinkText || "Find out more about Solomon Islands"}
                  </SmartLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About the SIAC Team — image RIGHT (alternated) */}
      <section className="section-y bg-sand-light" id="team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">
                {siteContent.aboutTeamHeading || "Our Team"}
              </h2>
              <div className="space-y-4 text-warm-gray-600 leading-relaxed">
                {siteContent.aboutTeamText ? (
                  renderParagraphs(siteContent.aboutTeamText)
                ) : (
                  <>
                    <p>
                      Solomon Islands Arts Crafts is run entirely by volunteers who share a
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
                      Arts Crafts was founded in 2026 as a volunteer-run social enterprise.
                    </p>
                  </>
                )}
                <p className="pt-2">
                  <SmartLink
                    href={siteContent.aboutTeamLinkUrl || "/about/team"}
                    className="inline-flex items-center gap-1.5 text-ocean hover:text-ocean-dark font-medium transition-colors"
                  >
                    {siteContent.aboutTeamLinkText || "Find out more about our team →"}
                  </SmartLink>
                </p>
              </div>
            </div>
            <figure className="lg:col-span-2 order-1 lg:order-2">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-sand-light shadow-card">
                <SafeImage
                  src={siteContent.aboutTeamImage}
                  alt={siteContent.aboutTeamImageAlt || "The SIAC volunteer team"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* Section 3: Why We're Doing This — image LEFT */}
      <section className="section-y" id="mission">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <figure className="lg:col-span-2">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-sand-light shadow-card">
                <SafeImage
                  src={siteContent.whyWeDoThisImage}
                  alt={siteContent.whyWeDoThisImageAlt || "Solomon Islands maker at work"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <figcaption className="text-xs text-warm-gray-400 mt-2">
                Photo by{' '}
                <a href="https://www.djoyobisono.com.au/" target="_blank" rel="noopener noreferrer" className="text-ocean hover:text-ocean-dark underline">
                  Harjono Djoyobisono
                </a>
              </figcaption>
            </figure>
            <div className="lg:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">
                {siteContent.aboutWhyHeading || "Why We\u2019re Doing This"}
              </h2>
              <div className="space-y-4 text-warm-gray-600 leading-relaxed">
                {siteContent.aboutWhyText ? (
                  renderParagraphs(siteContent.aboutWhyText)
                ) : (
                  <>
                    <p>
                      Solomon Islands&apos; makers produce work of extraordinary skill and beauty —
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
                  </>
                )}
                <p className="pt-2">
                  <SmartLink
                    href={siteContent.aboutWhyLinkUrl || "/for-makers"}
                    className="inline-flex items-center gap-1.5 text-ocean hover:text-ocean-dark font-medium transition-colors"
                  >
                    {siteContent.aboutWhyLinkText || "Are you a maker in Solomon Islands? Learn how to work with us →"}
                  </SmartLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <PageCta
        heading="Meet the makers behind the work"
        description="Every product we bring to Australia carries the maker's name, village, and story."
      >
        <ButtonLink href="/makers">Meet the makers</ButtonLink>
        <ButtonLink href="/catalogue" variant="secondary">
          Browse the catalogue
        </ButtonLink>
      </PageCta>

      {/* Section 4: Acknowledgement of Country */}
      <AcknowledgementOfCountry />
    </div>
  );
}

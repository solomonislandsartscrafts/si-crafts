import { generatePageMetadata } from '@/lib/metadata';
import { AcknowledgementOfCountry, PageCta, PageHeader } from '@/components/layout';
import { SmartLink } from '@/components/ui/smart-link';
import { ButtonLink } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { getSiteContentSafe } from '@/services/site-content';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'About',
  description:
    'Learn about Solomon Islands, the SIAC volunteer team, and why we bring these crafts to Australia.',
  path: '/about',
});

export default async function AboutPage() {
  const [siteContent, text] = await Promise.all([getSiteContentSafe(), getSiteTextSafe()]);

  // CMS text is plain: a blank line starts a new paragraph. The FIRST paragraph
  // of a section gets a lead treatment — larger (text-lg) and darker
  // (warm-gray-800) — so each section has a visual entry point instead of a
  // uniform block of muted grey. The rest stay at body size/colour.
  function renderParagraphs(value: string) {
    return value
      .split(/\n\n+/)
      .filter((paragraph) => paragraph.trim())
      .map((paragraph, i) => (
        <p
          key={i}
          className={
            i === 0 ? 'text-lg leading-body-lg text-warm-gray-800' : undefined
          }
        >
          {paragraph.trim()}
        </p>
      ));
  }

  const photoCreditName = text['about.photoCreditName'];
  const photoCreditUrl = text['about.photoCreditUrl'];

  return (
    <div>
      <PageHeader
        banner="green"
        eyebrow="Who we are"
        title={text['about.title']}
        intro={siteContent.aboutPageIntro}
      />

      {/* Section 1: About Solomon Islands — image LEFT. `pb-section` only: the
          banner above already supplies the top gap via its `mb-block`, so this
          section adds no top padding of its own. */}
      <section className="pb-section" id="solomon-islands">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-block items-start">
            <figure className="lg:col-span-2">
              {/* Landscape crop — this is a scenery photo of Solomon Islands. A
                  square crop cut the horizon; 4/3 keeps the scene intact. */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-sand-light shadow-card">
                <SafeImage
                  src={siteContent.aboutSolomonIslandsImage}
                  alt={siteContent.aboutSolomonIslandsImageAlt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </figure>
            <div className="lg:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
                {siteContent.aboutSolomonIslandsHeading}
              </h2>
              <div className="space-y-sm text-warm-gray-600 leading-relaxed">
                {renderParagraphs(siteContent.aboutSolomonIslandsText)}
                {/* Both halves are needed: link text with no URL renders a link
                    to the current page, and a URL with no text renders an
                    invisible one. */}
                {siteContent.aboutSolomonIslandsLinkText && siteContent.aboutSolomonIslandsLinkUrl && (
                  <p className="pt-2xs">
                    <SmartLink
                      href={siteContent.aboutSolomonIslandsLinkUrl}
                      className="inline-flex items-center gap-2xs text-ocean hover:text-ocean-dark font-medium transition-colors"
                    >
                      {siteContent.aboutSolomonIslandsLinkText}
                    </SmartLink>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About the SIAC Team — image RIGHT (alternated) */}
      <section className="section-y bg-sand-light" id="team">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-block items-start">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
                {siteContent.aboutTeamHeading}
              </h2>
              <div className="space-y-sm text-warm-gray-600 leading-relaxed">
                {renderParagraphs(siteContent.aboutTeamText)}
                {siteContent.aboutTeamLinkText && siteContent.aboutTeamLinkUrl && (
                  <p className="pt-2xs">
                    <SmartLink
                      href={siteContent.aboutTeamLinkUrl}
                      className="inline-flex items-center gap-2xs text-ocean hover:text-ocean-dark font-medium transition-colors"
                    >
                      {siteContent.aboutTeamLinkText}
                    </SmartLink>
                  </p>
                )}
              </div>
            </div>
            <figure className="lg:col-span-2 order-1 lg:order-2">
              {/* 4/3 — a group/scene photo, framed expecting a landscape crop. */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-sand-light shadow-card">
                <SafeImage
                  src={siteContent.aboutTeamImage}
                  alt={siteContent.aboutTeamImageAlt}
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
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-block items-start">
            <figure className="lg:col-span-2">
              {/* 4/3 — a workshop/process scene, framed expecting a landscape crop.
                  object-top so the crop favours the top of the photo (the
                  makers' faces) rather than centring and cutting them off. */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-sand-light shadow-card">
                <SafeImage
                  src={siteContent.whyWeDoThisImage}
                  alt={siteContent.whyWeDoThisImageAlt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              {/* Credit is editable alongside the image it belongs to — swapping
                  the photo without updating this would misattribute it. */}
              {photoCreditName && (
                <figcaption className="text-xs text-warm-gray-400 mt-2xs">
                  Photo by{' '}
                  {photoCreditUrl ? (
                    <SmartLink
                      href={photoCreditUrl}
                      className="text-ocean hover:text-ocean-dark underline"
                    >
                      {photoCreditName}
                    </SmartLink>
                  ) : (
                    photoCreditName
                  )}
                </figcaption>
              )}
            </figure>
            <div className="lg:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
                {siteContent.aboutWhyHeading}
              </h2>
              <div className="space-y-sm text-warm-gray-600 leading-relaxed">
                {renderParagraphs(siteContent.aboutWhyText)}
                {siteContent.aboutWhyLinkText && siteContent.aboutWhyLinkUrl && (
                  <p className="pt-2xs">
                    <SmartLink
                      href={siteContent.aboutWhyLinkUrl}
                      className="inline-flex items-center gap-2xs text-ocean hover:text-ocean-dark font-medium transition-colors"
                    >
                      {siteContent.aboutWhyLinkText}
                    </SmartLink>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <PageCta
        heading={text['about.ctaHeading']}
        description={text['about.ctaDescription']}
      >
        <ButtonLink href="/makers">{text['about.ctaPrimaryButton']}</ButtonLink>
        <ButtonLink href="/catalogue" variant="secondary">
          {text['about.ctaSecondaryButton']}
        </ButtonLink>
      </PageCta>

      {/* Section 4: Acknowledgement of Country */}
      <AcknowledgementOfCountry
        heading={text['acknowledgement.heading']}
        text={text['acknowledgement.text']}
        solomonText={text['acknowledgement.solomonText']}
      />
    </div>
  );
}

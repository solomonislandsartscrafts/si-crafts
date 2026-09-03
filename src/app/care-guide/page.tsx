import { generatePageMetadata } from '@/lib/metadata';
import { PageCta, PageHeader } from '@/components/layout';
import { ButtonLink } from '@/components/ui/button';
import { splitCmsList } from '@/components/ui/cms-text';
import { getSiteContentSafe } from '@/services/site-content';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'Care Guide',
  description:
    'How to look after your Solomon Islands handicrafts — pandanus, wood, and shell care tips.',
  path: '/care-guide',
});

export default async function CareGuidePage() {
  const [siteContent, text] = await Promise.all([getSiteContentSafe(), getSiteTextSafe()]);

  /**
   * The three original materials keep their tips on SiteContent (where they were
   * already editable); bush twine, which had no field at all, uses site text.
   * Both appear under the same Care Guide tab in the admin, so the split isn't
   * visible to whoever is editing.
   */
  const sections = [
    { heading: text['careGuide.pandanusHeading'], tips: siteContent.careGuidePandanus },
    { heading: text['careGuide.woodHeading'], tips: siteContent.careGuideWood },
    { heading: text['careGuide.shellHeading'], tips: siteContent.careGuideShell },
    { heading: text['careGuide.bushTwineHeading'], tips: text['careGuide.bushTwineTips'] },
  ]
    .map((section) => ({ heading: section.heading, tips: splitCmsList(section.tips) }))
    .filter((section) => section.heading && section.tips.length > 0);

  return (
    <div>
      <PageHeader
        banner="green"
        eyebrow="Looking after your piece"
        title={text['careGuide.title']}
        intro={siteContent.careGuideIntro}
      />

      <div className="site-container pb-section space-y-block">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
              {section.heading}
            </h2>
            <ul className="space-y-xs text-warm-gray-600 leading-relaxed">
              {section.tips.map((tip, i) => (
                <li key={i} className="flex gap-2xs">
                  <span className="text-brand-green font-bold" aria-hidden="true">
                    •
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <PageCta
        heading={text['careGuide.ctaHeading']}
        description={text['careGuide.ctaDescription']}
      >
        <ButtonLink href="/catalogue">{text['careGuide.ctaButton']}</ButtonLink>
      </PageCta>
    </div>
  );
}

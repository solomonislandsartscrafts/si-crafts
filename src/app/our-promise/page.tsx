import {
  IconAuthenticity,
  IconHandHeart,
  IconCulturalEye,
  IconCommunity,
  IconShellMoney,
  IconWovenQuestion,
} from '@/components/icons/craft-icons';
import { generatePageMetadata } from '@/lib/metadata';
import { PageCta, PageHeader } from '@/components/layout';
import { ButtonLink } from '@/components/ui/button';
import { CmsText, parseCmsInline, splitCmsList } from '@/components/ui/cms-text';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'Our Promise',
  description:
    'Our commitment to authenticity, fair trade, and cultural respect for Solomon Islands makers.',
  path: '/our-promise',
});

/**
 * The icon for each commitment card stays in code.
 *
 * These are hand-drawn craft icons, not a generic icon set — pairing them with
 * the right commitment is a design decision, and exposing an icon picker would
 * let a card end up with artwork that contradicts its text.
 */
const CARD_ICONS = [IconAuthenticity, IconHandHeart, IconCulturalEye, IconCommunity];

export default async function OurPromisePage() {
  const text = await getSiteTextSafe();

  // `n` is the card's position in the manifest, kept through the filter so it
  // can be the React key. Keying on the heading breaks for a body-only card,
  // where the heading is undefined.
  const cards = CARD_ICONS.map((Icon, i) => ({
    Icon,
    n: i + 1,
    heading: text[`ourPromise.card${i + 1}Heading`],
    body: text[`ourPromise.card${i + 1}Body`],
  })).filter((card) => card.heading || card.body);

  const moneyList = splitCmsList(text['ourPromise.moneyList']);
  const questionList = splitCmsList(text['ourPromise.questionList']);

  return (
    <div>
      <PageHeader
        banner="gold"
        eyebrow="Our commitment"
        title={text['ourPromise.title']}
        intro={text['ourPromise.intro']}
      />

      <div className="site-container pb-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-block mb-block">
          {cards.map(({ Icon, n, heading, body }) => (
            <div key={n} className="flex gap-sm">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-deep-blue mb-2xs">
                  {heading}
                </h2>
                <CmsText
                  value={body}
                  className="space-y-xs"
                  paragraphClassName="text-warm-gray-600 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>

        {/* WHERE THE MONEY GOES */}
        <section className="border-t border-sand pt-block mb-block">
          <div className="flex gap-sm mb-stack">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
              <IconShellMoney className="w-6 h-6 text-ocean" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2xs">
                {text['ourPromise.moneyHeading']}
              </h2>
            </div>
          </div>
          <div className="max-w-2xl space-y-sm text-warm-gray-600 leading-relaxed">
            <CmsText value={text['ourPromise.moneyIntro']} className="space-y-sm" />
            {moneyList.length > 0 && (
              <ul className="list-disc pl-md space-y-2xs">
                {moneyList.map((item, i) => (
                  <li key={i}>{parseCmsInline(item)}</li>
                ))}
              </ul>
            )}
            <CmsText value={text['ourPromise.moneyClosing']} className="space-y-sm" />
          </div>
        </section>

        {/* ARE YOU EXPLOITING MAKERS? */}
        <section className="border-t border-sand pt-block">
          <div className="flex gap-sm mb-stack">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
              <IconWovenQuestion className="w-6 h-6 text-ocean" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['ourPromise.questionHeading']}
              </h2>
            </div>
          </div>
          <div className="max-w-2xl space-y-sm text-warm-gray-600 leading-relaxed">
            <CmsText value={text['ourPromise.questionIntro']} className="space-y-sm" />
            {questionList.length > 0 && (
              <ul className="list-disc pl-md space-y-2xs">
                {questionList.map((item, i) => (
                  <li key={i}>{parseCmsInline(item)}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <PageCta
        heading={text['ourPromise.ctaHeading']}
        description={text['ourPromise.ctaDescription']}
      >
        <ButtonLink href="/makers">{text['ourPromise.ctaButton']}</ButtonLink>
      </PageCta>
    </div>
  );
}

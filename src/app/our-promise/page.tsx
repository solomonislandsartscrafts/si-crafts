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
      <PageHeader title={text['ourPromise.title']} intro={text['ourPromise.intro']} />

      <div className="site-container pb-10 lg:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 lg:mb-20">
          {cards.map(({ Icon, n, heading, body }) => (
            <div key={n} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-deep-blue mb-2">
                  {heading}
                </h2>
                <CmsText
                  value={body}
                  className="space-y-3"
                  paragraphClassName="text-warm-gray-600 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>

        {/* WHERE THE MONEY GOES */}
        <section className="border-t border-sand pt-10 mb-10 lg:mb-20">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
              <IconShellMoney className="w-6 h-6 text-ocean" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
                {text['ourPromise.moneyHeading']}
              </h2>
            </div>
          </div>
          <div className="max-w-2xl space-y-4 text-warm-gray-600 leading-relaxed">
            <CmsText value={text['ourPromise.moneyIntro']} className="space-y-4" />
            {moneyList.length > 0 && (
              <ul className="list-disc pl-6 space-y-2">
                {moneyList.map((item, i) => (
                  <li key={i}>{parseCmsInline(item)}</li>
                ))}
              </ul>
            )}
            <CmsText value={text['ourPromise.moneyClosing']} className="space-y-4" />
          </div>
        </section>

        {/* ARE YOU EXPLOITING MAKERS? */}
        <section className="border-t border-sand pt-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
              <IconWovenQuestion className="w-6 h-6 text-ocean" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['ourPromise.questionHeading']}
              </h2>
            </div>
          </div>
          <div className="max-w-2xl space-y-4 text-warm-gray-600 leading-relaxed">
            <CmsText value={text['ourPromise.questionIntro']} className="space-y-4" />
            {questionList.length > 0 && (
              <ul className="list-disc pl-6 space-y-2">
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

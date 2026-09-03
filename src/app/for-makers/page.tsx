import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { CmsText, splitCmsList } from '@/components/ui/cms-text';
import { getSiteTextSafe } from '@/services/site-text';
import { MakerEnquiryForm } from './maker-enquiry-form';

export const metadata = generatePageMetadata({
  title: 'For Makers',
  description:
    'How Solomon Islands Arts & Crafts works with makers — fair pay, consent, and how to get in touch.',
  path: '/for-makers',
});

export default async function ForMakersPage() {
  const text = await getSiteTextSafe();
  const promises = splitCmsList(text['forMakers.promisesList']);

  return (
    <div>
      <PageHeader
        banner="green"
        eyebrow="Working with SIAC"
        title={text['forMakers.title']}
        intro={text['forMakers.intro']}
      />

      <div className="site-container pb-section">
        {/* How we source */}
        <section className="mb-block">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
            {text['forMakers.sourcingHeading']}
          </h2>
          <CmsText
            value={text['forMakers.sourcingBody']}
            className="space-y-sm text-warm-gray-600 leading-relaxed"
          />
        </section>

        {/* Selection process */}
        <section className="mb-block">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
            {text['forMakers.capacityHeading']}
          </h2>
          <CmsText
            value={text['forMakers.capacityBody']}
            className="space-y-sm text-warm-gray-600 leading-relaxed"
          />
        </section>

        {/* Fair pay + consent */}
        {promises.length > 0 && (
          <section className="mb-block">
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
              {text['forMakers.promisesHeading']}
            </h2>
            <ul className="space-y-xs text-warm-gray-600">
              {promises.map((promise, i) => (
                <li key={i} className="flex gap-2xs">
                  <span className="text-brand-green font-bold" aria-hidden="true">
                    •
                  </span>
                  {promise}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Expression of interest form */}
        <MakerEnquiryForm
          heading={text['forMakers.formHeading']}
          intro={text['forMakers.formIntro']}
          successHeading={text['forMakers.successHeading']}
          successBody={text['forMakers.successBody']}
        />

        {/* Back to home */}
        <div className="mt-xl border-t border-sand pt-lg">
          <ButtonLink href="/" variant="secondary">
            ← Back to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

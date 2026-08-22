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
      <PageHeader title={text['forMakers.title']} intro={text['forMakers.intro']} />

      <div className="site-container pb-10 lg:pb-20">
        {/* How we source */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">
            {text['forMakers.sourcingHeading']}
          </h2>
          <CmsText
            value={text['forMakers.sourcingBody']}
            className="space-y-4 text-warm-gray-600 leading-relaxed"
          />
        </section>

        {/* Selection process */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">
            {text['forMakers.capacityHeading']}
          </h2>
          <CmsText
            value={text['forMakers.capacityBody']}
            className="space-y-4 text-warm-gray-600 leading-relaxed"
          />
        </section>

        {/* Fair pay + consent */}
        {promises.length > 0 && (
          <section className="mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">
              {text['forMakers.promisesHeading']}
            </h2>
            <ul className="space-y-3 text-warm-gray-600">
              {promises.map((promise, i) => (
                <li key={i} className="flex gap-2">
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
        <div className="mt-12 border-t border-sand pt-8">
          <ButtonLink href="/" variant="secondary">
            ← Back to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

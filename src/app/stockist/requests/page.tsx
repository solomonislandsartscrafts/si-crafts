'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { validateStockistSession } from '@/lib/auth-client';
import { submitStockistRequest } from '@/services/enquiries';
import type { ReplacementTagRequest, CustomBulkRequest } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Button, ButtonLink } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';
import { SuccessPanel } from '@/components/ui/success-panel';

type RequestKind = 'replacement-tag' | 'custom-bulk';

export default function StockistRequestsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [stockistId, setStockistId] = useState('');
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<RequestKind>('replacement-tag');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Replacement tag fields
  const [tagCode, setTagCode] = useState('');
  const [tagQty, setTagQty] = useState('1');

  // Custom/bulk fields
  const [customProduct, setCustomProduct] = useState('');
  const [customisation, setCustomisation] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customNotes, setCustomNotes] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { router.push('/stockist/login'); return; }
      const stockist = await validateStockistSession(token);
      if (!stockist) { localStorage.removeItem('stockist_session'); router.push('/stockist/login'); return; }
      setStockistId(stockist.id);
      setAuthenticated(true);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (kind === 'replacement-tag') {
      if (!tagCode.trim()) errs.tagCode = 'Product code is required';
      if (!tagQty || Number(tagQty) < 1) errs.tagQty = 'Quantity must be at least 1';
    } else {
      if (!customProduct.trim()) errs.customProduct = 'Product name is required';
      if (!customisation.trim()) errs.customisation = 'Describe the customisation';
      if (!customQty || Number(customQty) < 1) errs.customQty = 'Quantity must be at least 1';
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    let request: ReplacementTagRequest | CustomBulkRequest;
    if (kind === 'replacement-tag') {
      request = { kind: 'replacement-tag', productCode: tagCode.trim().toUpperCase(), quantity: Number(tagQty) };
    } else {
      request = { kind: 'custom-bulk', product: customProduct.trim(), customisation: customisation.trim(), quantity: Number(customQty), notes: customNotes.trim() };
    }

    // Without the finally, a failed submit left the button disabled forever
    // with nothing on screen to explain why.
    try {
      await submitStockistRequest({ stockistId, request });
      setSubmitted(true);
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "We couldn't send your request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated || loading) {
    return (
      <div className="max-w-2xl mx-auto site-px page-y">
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (submitted) {
    return (
      <SuccessPanel
        title="Request submitted"
        description={
          kind === 'replacement-tag'
            ? 'We\'ll post your replacement tags shortly.'
            : 'We\'ll be in touch to discuss your custom/bulk order.'
        }
        actions={
          <ButtonLink href="/stockist/catalogue" variant="secondary">
            Back to catalogue
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Requests"
        intro="Need replacement tags or want to discuss a custom/bulk order? Submit a request below."
        eyebrow={
          <Link href="/stockist/catalogue" className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to catalogue
          </Link>
        }
        width="narrow"
      />

      <div className="max-w-2xl mx-auto site-px pb-16">
        <div className="max-w-lg">
          {/* Type selector.
              Native radios in a fieldset rather than role="radio" buttons: the
              buttons gave the group one tab stop per option and no arrow-key
              movement, so it announced as a radiogroup without behaving like
              one. Real inputs get focus, arrow keys and checked state from the
              browser, so there is no keyboard handling to maintain. The inputs
              are visually hidden and the label carries the segmented styling. */}
          <fieldset className="mb-8">
            <legend className="sr-only">Request type</legend>
            <div className="flex border border-sand-dark rounded-md overflow-hidden">
              {([
                ['replacement-tag', 'Replacement Tags'],
                ['custom-bulk', 'Custom / Bulk Order'],
              ] as const).map(([value, label]) => (
                <label
                  key={value}
                  className={`tap-target flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium text-center cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ocean focus-within:ring-inset ${
                    kind === value
                      ? 'bg-ocean text-white'
                      : 'bg-white text-warm-gray-600 hover:bg-sand-light'
                  }`}
                >
                  <input
                    type="radio"
                    name="request-kind"
                    value={value}
                    checked={kind === value}
                    onChange={() => { setKind(value); setErrors({}); }}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {kind === 'replacement-tag' ? (
              <>
                <FormField label="Product code" htmlFor="tagCode" error={errors.tagCode}>
                  <input id="tagCode" type="text" placeholder="e.g. P-J-1" value={tagCode}
                    onChange={(e) => setTagCode(e.target.value)}
                    className={`${inputClasses} font-mono uppercase placeholder:normal-case`}
                    data-error={!!errors.tagCode || undefined} />
                </FormField>
                <FormField label="Quantity" htmlFor="tagQty" error={errors.tagQty}>
                  <input id="tagQty" type="number" min="1" value={tagQty}
                    onChange={(e) => setTagQty(e.target.value)}
                    className={inputClasses}
                    data-error={!!errors.tagQty || undefined} />
                </FormField>
              </>
            ) : (
              <>
                <FormField label="Product" htmlFor="customProduct" error={errors.customProduct}>
                  <input id="customProduct" type="text" placeholder="e.g. Pandanus Shoulder Bag" value={customProduct}
                    onChange={(e) => setCustomProduct(e.target.value)}
                    className={inputClasses}
                    data-error={!!errors.customProduct || undefined} />
                </FormField>
                <FormField label="Customisation details" htmlFor="customisation" error={errors.customisation}>
                  <input id="customisation" type="text" placeholder="e.g. Gallery name woven into border" value={customisation}
                    onChange={(e) => setCustomisation(e.target.value)}
                    className={inputClasses}
                    data-error={!!errors.customisation || undefined} />
                </FormField>
                <FormField label="Quantity" htmlFor="customQty" error={errors.customQty}>
                  <input id="customQty" type="number" min="1" value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className={inputClasses}
                    data-error={!!errors.customQty || undefined} />
                </FormField>
                <FormField label="Notes (optional)" htmlFor="customNotes">
                  <textarea id="customNotes" rows={3} value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Needed by September for exhibition"
                    className={`${inputClasses} resize-y`} />
                </FormField>
              </>
            )}

            {errors.form && (
              <div
                className="bg-error/10 border border-error/20 text-error text-base rounded-md p-3"
                role="alert"
                aria-live="assertive"
              >
                {errors.form}
              </div>
            )}
            <Button type="submit" loading={submitting} loadingText="Submitting...">
              Submit request
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

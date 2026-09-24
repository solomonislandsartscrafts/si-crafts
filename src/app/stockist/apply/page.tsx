'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { InfoTip } from '@/components/ui/info-tip';
import { SuccessPanel } from '@/components/ui/success-panel';

const DESCRIPTION_LIMIT = 500;

type FormState = {
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
};

type FieldName = keyof FormState;

const EMPTY_FORM: FormState = {
  businessName: '',
  abn: '',
  contactName: '',
  email: '',
  phone: '',
  description: '',
};

// The order errors are checked and focused in — top-to-bottom, matching the
// visual layout, so focus lands on the first thing the eye reaches.
const FIELD_ORDER: FieldName[] = [
  'businessName',
  'abn',
  'contactName',
  'phone',
  'email',
  'description',
];

export default function StockistApplyPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Keep a ref to each control so an invalid submit can move focus to the first
  // field that failed — a keyboard/screen-reader user is otherwise left to hunt
  // for the error themselves.
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  function validate(): Partial<Record<FieldName, string>> {
    const errs: Partial<Record<FieldName, string>> = {};

    if (!form.businessName.trim()) errs.businessName = 'Business name is required';

    if (!form.abn.trim()) {
      errs.abn = 'ABN is required';
    } else if (!/^\d{11}$/.test(form.abn.replace(/\s/g, ''))) {
      errs.abn = 'ABN must be 11 digits';
    }

    if (!form.contactName.trim()) errs.contactName = 'Contact name is required';

    if (!form.phone.trim()) {
      errs.phone = 'Phone is required';
    } else if (form.phone.replace(/[\s()+-]/g, '').length < 8) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!form.description.trim()) {
      errs.description = 'Description is required';
    } else if (form.description.length > DESCRIPTION_LIMIT) {
      errs.description = `Maximum ${DESCRIPTION_LIMIT} characters`;
    }

    return errs;
  }

  // Update a field and clear its error as the user corrects it, so a stale
  // message never sits under a field the user has already fixed.
  function update(field: FieldName, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function focusFirstError(errs: Partial<Record<FieldName, string>>) {
    const first = FIELD_ORDER.find((name) => errs[name]);
    if (first) fieldRefs.current[first]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // An application creates a stockist record, so a double-click must not be
    // able to send a second request while the first is still in flight.
    if (submitting) return;

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/stockists/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          abn: form.abn.replace(/\s/g, ''),
          contactName: form.contactName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          description: form.description.trim(),
        }),
      });
      if (!res.ok) {
        // Prefer the server's wording — "we already have an application for
        // this email" is something the applicant can act on, whereas the
        // generic retry message sends them round the same loop.
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        'We could not reach the server. Check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SuccessPanel
        icon={Send}
        title="Application received"
        description="Thanks for applying. We'll review your application and get back to you within a few business days."
      />
    );
  }

  const descriptionLength = form.description.length;
  const descriptionNearLimit = descriptionLength >= DESCRIPTION_LIMIT - 50;

  return (
    <PageHeader
      title="Apply to Become a Stockist"
      intro="Tell us about your business and we'll get you set up with wholesale access."
      width="narrow"
    >
      {/* No extra max-width here: the form fills the narrow page container
          (max-w-2xl) so the paired columns get real width instead of being
          squeezed into a second, tighter box. */}
      <div className="mt-lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-md">
          {submitError && (
            <div
              className="bg-error/10 border border-error/20 text-error text-base rounded-md p-sm"
              role="alert"
              aria-live="assertive"
            >
              {submitError}
            </div>
          )}

          {/* Short related fields pair up into two columns from sm: up, so the
              form reads as three tight rows on a laptop instead of six stacked
              inputs. Stays single-column on mobile. */}
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <FormField label="Business name" htmlFor="businessName" required reserveErrorSpace error={errors.businessName}>
              <input
                id="businessName"
                type="text"
                value={form.businessName}
                autoComplete="organization"
                ref={(el) => { fieldRefs.current.businessName = el; }}
                onChange={(e) => update('businessName', e.target.value)}
                className={inputClasses}
                data-error={!!errors.businessName || undefined}
                aria-invalid={!!errors.businessName}
              />
            </FormField>

            <FormField
              label="ABN"
              htmlFor="abn"
              required
              reserveErrorSpace
              error={errors.abn}
              inlineAction={
                <InfoTip label="About ABN">
                  Your 11-digit Australian Business Number. Enter the digits with
                  or without spaces — for example, 12&nbsp;345&nbsp;678&nbsp;901.
                </InfoTip>
              }
            >
              <input
                id="abn"
                type="text"
                value={form.abn}
                inputMode="numeric"
                ref={(el) => { fieldRefs.current.abn = el; }}
                onChange={(e) => update('abn', e.target.value)}
                className={inputClasses}
                data-error={!!errors.abn || undefined}
                aria-invalid={!!errors.abn}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <FormField label="Contact name" htmlFor="contactName" required reserveErrorSpace error={errors.contactName}>
              <input
                id="contactName"
                type="text"
                value={form.contactName}
                autoComplete="name"
                ref={(el) => { fieldRefs.current.contactName = el; }}
                onChange={(e) => update('contactName', e.target.value)}
                className={inputClasses}
                data-error={!!errors.contactName || undefined}
                aria-invalid={!!errors.contactName}
              />
            </FormField>

            <FormField label="Phone" htmlFor="phone" required reserveErrorSpace error={errors.phone}>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                autoComplete="tel"
                inputMode="tel"
                ref={(el) => { fieldRefs.current.phone = el; }}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClasses}
                data-error={!!errors.phone || undefined}
                aria-invalid={!!errors.phone}
              />
            </FormField>
          </div>

          <FormField label="Email" htmlFor="email" required reserveErrorSpace error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              autoComplete="email"
              inputMode="email"
              ref={(el) => { fieldRefs.current.email = el; }}
              onChange={(e) => update('email', e.target.value)}
              className={inputClasses}
              data-error={!!errors.email || undefined}
              aria-invalid={!!errors.email}
            />
          </FormField>

          {/* The counter sits outside FormField because FormField clones a
              single child to inject its label/aria wiring; a second child would
              defeat that. The textarea references the counter via
              aria-describedby so its live count is announced. */}
          <div>
            <FormField
              label="About your business"
              htmlFor="description"
              required
              reserveErrorSpace
              error={errors.description}
            >
              <textarea
                id="description"
                rows={4}
                maxLength={DESCRIPTION_LIMIT}
                value={form.description}
                placeholder="Tell us what your shop sells and where you're based."
                ref={(el) => { fieldRefs.current.description = el; }}
                onChange={(e) => update('description', e.target.value)}
                className={`${inputClasses} resize-y`}
                data-error={!!errors.description || undefined}
                aria-invalid={!!errors.description}
                aria-describedby="description-count"
              />
            </FormField>
            <p
              id="description-count"
              className={`text-sm mt-3xs text-right ${descriptionNearLimit ? 'text-warm-gray-600' : 'text-warm-gray-400'}`}
              aria-live="polite"
            >
              {descriptionLength}/{DESCRIPTION_LIMIT}
            </p>
          </div>

          <Button type="submit" fullWidth loading={submitting} loadingText="Submitting...">
            Submit application
          </Button>
        </form>

        <p className="text-base text-warm-gray-600 mt-md text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-ocean hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </PageHeader>
  );
}

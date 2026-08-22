'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SuccessPanel } from '@/components/ui/success-panel';

export default function StockistApplyPage() {
  const [form, setForm] = useState({
    businessName: '',
    abn: '',
    contactName: '',
    email: '',
    phone: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.businessName.trim()) errs.businessName = 'Business name is required';
    if (!form.abn.trim()) {
      errs.abn = 'ABN is required';
    } else if (!/^\d{11}$/.test(form.abn.replace(/\s/g, ''))) {
      errs.abn = 'ABN must be 11 digits';
    }
    if (!form.contactName.trim()) errs.contactName = 'Contact name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.description.trim()) {
      errs.description = 'Description is required';
    } else if (form.description.length > 500) {
      errs.description = 'Maximum 500 characters';
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // An application creates a stockist record, so a double-click must not be
    // able to send a second request while the first is still in flight.
    if (submitting) return;

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/stockists/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          abn: form.abn.replace(/\s/g, ''),
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          description: form.description,
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
      setSubmitError('Something went wrong. Please try again.');
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

  return (
    <PageHeader
      title="Apply to Become a Stockist"
      intro="Tell us about your business and we'll get you set up with wholesale access."
      width="narrow"
    >
      <div className="max-w-lg mt-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField label="Business Name" htmlFor="businessName" error={errors.businessName}>
            <input id="businessName" type="text" value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className={inputClasses}
              data-error={!!errors.businessName || undefined} />
          </FormField>

          <FormField label="ABN (11 digits)" htmlFor="abn" error={errors.abn}>
            <input id="abn" type="text" value={form.abn}
              onChange={(e) => setForm({ ...form, abn: e.target.value })}
              className={inputClasses}
              data-error={!!errors.abn || undefined} />
          </FormField>

          <FormField label="Contact Name" htmlFor="contactName" error={errors.contactName}>
            <input id="contactName" type="text" value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className={inputClasses}
              data-error={!!errors.contactName || undefined} />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <input id="email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClasses}
              data-error={!!errors.email || undefined} />
          </FormField>

          <FormField label="Phone" htmlFor="phone" error={errors.phone}>
            <input id="phone" type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClasses}
              data-error={!!errors.phone || undefined} />
          </FormField>

          <div>
            <FormField
              label="About your business (max 500 characters)"
              htmlFor="description"
              error={errors.description}
            >
              <textarea id="description" rows={4} maxLength={500} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputClasses} resize-y`}
                data-error={!!errors.description || undefined} />
            </FormField>
            <p className="text-xs text-warm-gray-400 mt-1">{form.description.length}/500</p>
          </div>

          {submitError && (
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-3" role="alert" aria-live="assertive">
              {submitError}
            </div>
          )}

          <Button type="submit" fullWidth loading={submitting} loadingText="Submitting...">
            Submit application
          </Button>
        </form>

        <p className="text-base text-warm-gray-600 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-ocean hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </PageHeader>
  );
}

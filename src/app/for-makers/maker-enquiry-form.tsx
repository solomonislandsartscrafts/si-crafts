'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { submitMakerEnquiry } from '@/services/enquiries';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SuccessPanel } from '@/components/ui/success-panel';

/**
 * The expression-of-interest form.
 *
 * Split out of the page so the page itself can stay a server component and read
 * admin-editable copy. Only the headings and the thank-you message are passed
 * in — field labels, placeholders and validation messages stay in code, because
 * an admin rewording "Village is required" would not improve anything and could
 * break the form's accessible error contract.
 */
export function MakerEnquiryForm({
  heading,
  intro,
  successHeading,
  successBody,
}: {
  heading: string;
  intro: string;
  successHeading: string;
  successBody: string;
}) {
  const [form, setForm] = useState({
    name: '',
    village: '',
    province: '',
    craft: '',
    message: '',
    contact: '',
    whatsapp: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.village.trim()) errs.village = 'Village is required';
    if (!form.province.trim()) errs.province = 'Province is required';
    if (!form.craft.trim()) errs.craft = 'Tell us what you make';
    if (!form.contact.trim()) errs.contact = 'We need a way to reach you';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await submitMakerEnquiry(form);
      setSubmitted(true);
    } catch (err) {
      // A failed send used to show the thank-you panel anyway, so the maker
      // walked away believing we had their details.
      setErrors({
        form:
          err instanceof Error && err.message
            ? err.message
            : 'We could not send that just now. Please check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessPanel title={successHeading} icon={CheckCircle} description={successBody} />;
  }

  return (
    <section className="border-t border-sand pt-12">
      <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
        {heading}
      </h2>
      {intro && <p className="text-base text-warm-gray-600 mb-8">{intro}</p>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-md">
        {errors.form && (
          <p
            className="text-base text-error bg-error/10 px-3 py-2 rounded"
            role="alert"
            aria-live="assertive"
          >
            {errors.form}
          </p>
        )}

        <FormField label="Your name" htmlFor="name" error={errors.name}>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClasses}
            data-error={!!errors.name || undefined}
            aria-invalid={!!errors.name}
          />
        </FormField>

        <FormField label="Village" htmlFor="village" error={errors.village}>
          <input
            id="village"
            type="text"
            value={form.village}
            onChange={(e) => setForm({ ...form, village: e.target.value })}
            className={inputClasses}
            data-error={!!errors.village || undefined}
            aria-invalid={!!errors.village}
          />
        </FormField>

        <FormField label="Province" htmlFor="province" error={errors.province}>
          <input
            id="province"
            type="text"
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            className={inputClasses}
            data-error={!!errors.province || undefined}
            aria-invalid={!!errors.province}
          />
        </FormField>

        <FormField
          label="What do you make? (materials, craft)"
          htmlFor="craft"
          error={errors.craft}
        >
          <input
            id="craft"
            type="text"
            placeholder="e.g. pandanus bags, shell jewellery, wood carvings"
            value={form.craft}
            onChange={(e) => setForm({ ...form, craft: e.target.value })}
            className={inputClasses}
            data-error={!!errors.craft || undefined}
            aria-invalid={!!errors.craft}
          />
        </FormField>

        <FormField
          label="How can we reach you? (phone or email)"
          htmlFor="contact"
          error={errors.contact}
        >
          <input
            id="contact"
            type="text"
            placeholder="e.g. +677 7412345 or email"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className={inputClasses}
            data-error={!!errors.contact || undefined}
            aria-invalid={!!errors.contact}
          />
        </FormField>

        <FormField label="WhatsApp number (optional)" htmlFor="whatsapp" error={errors.whatsapp}>
          <input
            id="whatsapp"
            type="text"
            placeholder="e.g. +677 7412345"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className={inputClasses}
          />
        </FormField>

        <FormField label="Message (optional)" htmlFor="message" error={errors.message}>
          <textarea
            id="message"
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={`${inputClasses} resize-y`}
          />
        </FormField>

        <Button type="submit" loading={submitting} loadingText="Sending...">
          Send
        </Button>
      </form>
    </section>
  );
}

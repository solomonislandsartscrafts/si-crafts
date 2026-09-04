'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { submitContactEnquiry } from '@/services/enquiries';
import type { ContactReason } from '@/types';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SuccessPanel } from '@/components/ui/success-panel';

/**
 * The contact form.
 *
 * Split out of the page so the page can stay a server component and read
 * admin-editable copy. The reason options are NOT editable: their values are
 * bound to the ContactReason union and the backend enquiry types, so renaming
 * one in an admin screen would silently break routing of enquiries.
 */
export function ContactForm({
  successHeading,
  successBody,
}: {
  successHeading: string;
  successBody: string;
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    reason: 'general' as ContactReason,
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await submitContactEnquiry(form);
      setSubmitted(true);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessPanel title={successHeading} icon={Send} description={successBody} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-md">
      {errors.form && (
        <div
          className="bg-error/10 border border-error/20 text-error text-base rounded-md p-xs"
          role="alert"
          aria-live="assertive"
        >
          {errors.form}
        </div>
      )}

      <FormField label="Name" htmlFor="name" error={errors.name}>
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

      <FormField label="Email" htmlFor="email" error={errors.email}>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClasses}
          data-error={!!errors.email || undefined}
          aria-invalid={!!errors.email}
        />
      </FormField>

      <FormField label="Phone (optional)" htmlFor="phone">
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Reason for contact" htmlFor="reason">
        <Select
          id="reason"
          value={form.reason}
          onChange={(val) => setForm({ ...form, reason: (val || 'general') as ContactReason })}
          options={[
            { value: 'general', label: 'General enquiry' },
            { value: 'wholesale', label: 'Wholesale enquiry' },
            { value: 'custom-order', label: 'Custom or bulk order' },
            { value: 'media', label: 'Media & press' },
            { value: 'other', label: 'Other' },
          ]}
          placeholder="Select a reason"
          label="Reason for contact"
          fullWidth
        />
      </FormField>

      <FormField label="Message" htmlFor="message" error={errors.message}>
        <textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClasses} resize-y`}
          data-error={!!errors.message || undefined}
          aria-invalid={!!errors.message}
        />
      </FormField>

      <Button type="submit" loading={submitting} loadingText="Sending...">
        Send message
      </Button>
    </form>
  );
}

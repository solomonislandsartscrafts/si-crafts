'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';

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
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const { createApplication } = await import('@/services/stockists');
    await createApplication({
      ...form,
      abn: form.abn.replace(/\s/g, ''),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-section-lg text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <Send className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-deep-blue mb-3">Application received</h1>
        <p className="text-warm-gray-600">
          Thanks for applying. We&apos;ll review your application and get back to you within a few business days.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-section-lg">
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-2">
        Apply to Become a Stockist
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Tell us about your business and we&apos;ll get you set up with wholesale access.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Business Name" id="businessName" error={errors.businessName}>
          <input id="businessName" type="text" value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-describedby={errors.businessName ? 'businessName-error' : undefined}
            aria-invalid={!!errors.businessName} />
        </Field>

        <Field label="ABN (11 digits)" id="abn" error={errors.abn}>
          <input id="abn" type="text" value={form.abn}
            onChange={(e) => setForm({ ...form, abn: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-describedby={errors.abn ? 'abn-error' : undefined}
            aria-invalid={!!errors.abn} />
        </Field>

        <Field label="Contact Name" id="contactName" error={errors.contactName}>
          <input id="contactName" type="text" value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-describedby={errors.contactName ? 'contactName-error' : undefined}
            aria-invalid={!!errors.contactName} />
        </Field>

        <Field label="Email" id="email" error={errors.email}>
          <input id="email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email} />
        </Field>

        <Field label="Phone" id="phone" error={errors.phone}>
          <input id="phone" type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={!!errors.phone} />
        </Field>

        <Field label="About your business (max 500 characters)" id="description" error={errors.description}>
          <textarea id="description" rows={4} maxLength={500} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean resize-y"
            aria-describedby={errors.description ? 'description-error' : undefined}
            aria-invalid={!!errors.description} />
          <p className="text-xs text-warm-gray-400 mt-1">{form.description.length}/500</p>
        </Field>

        <button type="submit"
          className="tap-target w-full flex items-center justify-center gap-2 px-6 py-3 bg-ocean hover:bg-ocean-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light">
          <Send className="w-4 h-4" />
          Submit application
        </button>
      </form>

      <p className="text-sm text-warm-gray-600 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/stockist/login" className="text-ocean hover:underline font-medium">Log in</Link>
      </p>
    </div>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-warm-gray-800 mb-1">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="text-sm text-error mt-1" aria-live="assertive">{error}</p>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { submitMakerEnquiry } from '@/services/enquiries';
import { PageHeader } from '@/components/layout/page-header';

export default function ForMakersPage() {
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
    await submitMakerEnquiry(form);
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 page-y text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-2xl font-medium text-deep-blue mb-3">
          Thank you
        </h1>
        <p className="text-warm-gray-600">
          We have received your expression of interest. If we are able to work together,
          we will reach out using the contact details you provided.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="For Makers"
        intro="If you make crafts in Solomon Islands and would like to sell your work through Solomon Islands Arts Crafts (SIAC), this page explains how it works and how to get in touch."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">

      {/* How we source */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-medium text-deep-blue mb-4">
          How SIAC sources crafts
        </h2>
        <div className="space-y-4 text-warm-gray-600 leading-relaxed">
          <p>
            We buy handmade crafts — pandanus weaving, wood carving, kusa and trays made from
            bush-twine, and shell-money jewellery — directly from makers in Solomon Islands. We
            sell them wholesale to museum and gallery shops in Australia.
          </p>
          <p>
            We know the sort of items that will appeal to customers in Australia. We look for
            items that are unique to Solomon Islands and part of its craft tradition, but will
            also sell in Australia.
          </p>
          <p>
            We visit communities, meet makers in person, and purchase work at the price the
            maker sets. We pay upfront — not on consignment. We want makers to receive a fair
            price but we also try to keep prices reasonable so that museum and gallery shops
            will buy them.
          </p>
        </div>
      </section>

      {/* Selection process */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-medium text-deep-blue mb-4">
          Why not everyone at once
        </h2>
        <div className="space-y-4 text-warm-gray-600 leading-relaxed">
          <p>
            We are a small, volunteer-run operation. We can only work with a limited number
            of makers at a time because each relationship takes time — building trust, documenting
            provenance, arranging freight, and finding the right shops in Australia.
          </p>
          <p>
            If we cannot buy from you right now, it does not mean your work is not good enough.
            It means we have reached our current capacity. We keep every expression of interest
            on file and reach out when we can take on more makers.
            <span className="text-warm-gray-400 italic text-sm"> [NEEDS REVIEW — confirm waitlist/follow-up process]</span>
          </p>
        </div>
      </section>

      {/* Fair pay + consent */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-medium text-deep-blue mb-4">
          What we promise makers
        </h2>
        <ul className="space-y-3 text-warm-gray-600">
          <li className="flex gap-2">
            <span className="text-terracotta font-bold">•</span>
            You set your own price. We do not negotiate down.
          </li>
          <li className="flex gap-2">
            <span className="text-terracotta font-bold">•</span>
            We pay you when we collect the work — upfront, not after it sells.
          </li>
          <li className="flex gap-2">
            <span className="text-terracotta font-bold">•</span>
            Your name, photo, and story only appear on our website if you give written consent.
            You can withdraw consent at any time.
          </li>
          <li className="flex gap-2">
            <span className="text-terracotta font-bold">•</span>
            Your designs and patterns remain yours. We document provenance; we do not own your work.
          </li>
        </ul>
        <p className="text-warm-gray-400 italic text-sm mt-4">
          [NEEDS REVIEW — confirm all terms with SIAC team]
        </p>
      </section>

      {/* Expression of interest form */}
      <section className="border-t border-sand pt-12">
        <h2 className="font-heading text-xl font-medium text-deep-blue mb-2">
          Get in touch
        </h2>
        <p className="text-sm text-warm-gray-600 mb-8">
          Fill in the form below and we will contact you if we are able to work together.
          All fields except &ldquo;Message&rdquo; are required.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-md">
          <Field label="Your name" id="name" error={errors.name}>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={!!errors.name}
            />
          </Field>

          <Field label="Village" id="village" error={errors.village}>
            <input
              id="village"
              type="text"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.village ? 'village-error' : undefined}
              aria-invalid={!!errors.village}
            />
          </Field>

          <Field label="Province" id="province" error={errors.province}>
            <input
              id="province"
              type="text"
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.province ? 'province-error' : undefined}
              aria-invalid={!!errors.province}
            />
          </Field>

          <Field label="What do you make? (materials, craft)" id="craft" error={errors.craft}>
            <input
              id="craft"
              type="text"
              placeholder="e.g. pandanus bags, shell jewellery, wood carvings"
              value={form.craft}
              onChange={(e) => setForm({ ...form, craft: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.craft ? 'craft-error' : undefined}
              aria-invalid={!!errors.craft}
            />
          </Field>

          <Field label="How can we reach you? (phone or email)" id="contact" error={errors.contact}>
            <input
              id="contact"
              type="text"
              placeholder="e.g. +677 7412345 or email"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.contact ? 'contact-error' : undefined}
              aria-invalid={!!errors.contact}
            />
          </Field>

          <Field label="WhatsApp number (optional)" id="whatsapp" error={errors.whatsapp}>
            <input
              id="whatsapp"
              type="text"
              placeholder="e.g. +677 7412345"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
          </Field>

          <Field label="Message (optional)" id="message" error={errors.message}>
            <textarea
              id="message"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="tap-target inline-flex items-center gap-2 px-6 py-3 btn-primary"
          >
            {submitting ? 'Sending...' : 'Send'}
          </button>
        </form>
      </section>

      {/* Back to home */}
      <div className="mt-12 border-t border-sand pt-8">
        <Link
          href="/"
          className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          ← Back to home
        </Link>
      </div>
      </div>
    </div>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-warm-gray-800 mb-1">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-error mt-1" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
}

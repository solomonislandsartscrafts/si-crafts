'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Send } from 'lucide-react';
import { submitContactEnquiry } from '@/services/enquiries';
import type { ContactReason } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Select } from '@/components/ui/select';

export default function ContactPage() {
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
      setErrors({ form: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-y">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-heading text-2xl font-medium text-deep-blue mb-3">
            Message sent
          </h1>
          <p className="text-warm-gray-600">
            Thanks for getting in touch. We&apos;ll get back to you as soon as we can.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Contact"
        intro="Get in touch with the Solomon Islands Arts Crafts team."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
        {/* Contact Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {errors.form && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert" aria-live="assertive">
              {errors.form}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-error mt-1" aria-live="assertive">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-error mt-1" aria-live="assertive">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Phone <span className="text-warm-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Reason for contact
            </label>
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
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
              aria-describedby={errors.message ? 'message-error' : undefined}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p id="message-error" className="text-sm text-error mt-1" aria-live="assertive">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="tap-target inline-flex items-center gap-2 px-6 py-3 btn-primary"
          >
            {submitting ? 'Sending...' : 'Send message'}
          </button>
        </form>

        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-xl font-medium text-deep-blue mb-3">
              Email us
            </h2>
            <a
              href="mailto:hello@siac.com.au"
              className="inline-flex items-center gap-2 text-ocean hover:text-ocean-dark transition-colors"
            >
              <Mail className="w-5 h-5" />
              hello@siac.com.au
            </a>
            <p className="text-sm text-warm-gray-400 mt-2">ABN 82 103 383 042</p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-deep-blue mb-2">Wholesale enquiries</h3>
            <p className="text-sm text-warm-gray-600">
              Interested in stocking Solomon Islands Arts Crafts in your museum or gallery shop?{' '}
              <Link href="/wholesale" className="text-ocean hover:text-ocean-dark font-medium">Visit our Wholesale page →</Link>
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-deep-blue mb-2">Media &amp; press</h3>
            <p className="text-sm text-warm-gray-600">
              For interview requests, features, or press enquiries, select &ldquo;Media &amp; press&rdquo; in the form and we&apos;ll prioritise your message.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-deep-blue mb-2">Customised or bulk orders</h3>
            <p className="text-sm text-warm-gray-600">
              For personalised or bulk orders, select &ldquo;Custom or bulk order&rdquo; in the form and we&apos;ll get in touch.
            </p>
          </div>

          <div className="bg-sand-light rounded-lg p-6">
            <p className="text-sm text-warm-gray-600">
              We&apos;re a small volunteer team based in Sydney, Australia and Dunedin, New Zealand. We aim to respond to all enquiries within 2–3 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

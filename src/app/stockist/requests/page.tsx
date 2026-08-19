'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { validateStockistSession } from '@/lib/auth-client';
import { submitStockistRequest } from '@/services/enquiries';
import type { ReplacementTagRequest, CustomBulkRequest } from '@/types';

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

    await submitStockistRequest({ stockistId, request });
    setSubmitting(false);
    setSubmitted(true);
  }

  if (!authenticated || loading) {
    return <div className="max-w-2xl mx-auto px-4 page-y"><p className="text-warm-gray-400">Loading...</p></div>;
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 page-y text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-2xl font-medium text-deep-blue mb-3">Request submitted</h1>
        <p className="text-warm-gray-600 mb-6">
          {kind === 'replacement-tag'
            ? 'We\'ll post your replacement tags shortly.'
            : 'We\'ll be in touch to discuss your custom/bulk order.'}
        </p>
        <Link href="/stockist/catalogue" className="text-ocean hover:text-ocean-dark font-medium">
          Back to catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 page-y">
      <Link href="/stockist/catalogue" className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to catalogue
      </Link>

      <h1 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
        Requests
      </h1>
      <p className="text-sm text-warm-gray-600 mb-8">
        Need replacement tags or want to discuss a custom/bulk order? Submit a request below.
      </p>

      {/* Type selector */}
      <div className="flex border border-sand-dark rounded-md overflow-hidden mb-8" role="radiogroup" aria-label="Request type">
        <button
          role="radio"
          aria-checked={kind === 'replacement-tag'}
          onClick={() => { setKind('replacement-tag'); setErrors({}); }}
          className={`tap-target flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            kind === 'replacement-tag' ? 'bg-ocean text-white' : 'bg-white text-warm-gray-600 hover:bg-sand-light'
          }`}
        >
          Replacement Tags
        </button>
        <button
          role="radio"
          aria-checked={kind === 'custom-bulk'}
          onClick={() => { setKind('custom-bulk'); setErrors({}); }}
          className={`tap-target flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            kind === 'custom-bulk' ? 'bg-ocean text-white' : 'bg-white text-warm-gray-600 hover:bg-sand-light'
          }`}
        >
          Custom / Bulk Order
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {kind === 'replacement-tag' ? (
          <>
            <Field label="Product code" id="tagCode" error={errors.tagCode}>
              <input id="tagCode" type="text" placeholder="e.g. P-J-1" value={tagCode}
                onChange={(e) => setTagCode(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 font-mono uppercase placeholder:text-warm-gray-400 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.tagCode ? 'tagCode-error' : undefined} aria-invalid={!!errors.tagCode} />
            </Field>
            <Field label="Quantity" id="tagQty" error={errors.tagQty}>
              <input id="tagQty" type="number" min="1" value={tagQty}
                onChange={(e) => setTagQty(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.tagQty ? 'tagQty-error' : undefined} aria-invalid={!!errors.tagQty} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Product" id="customProduct" error={errors.customProduct}>
              <input id="customProduct" type="text" placeholder="e.g. Pandanus Shoulder Bag" value={customProduct}
                onChange={(e) => setCustomProduct(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.customProduct ? 'customProduct-error' : undefined} aria-invalid={!!errors.customProduct} />
            </Field>
            <Field label="Customisation details" id="customisation" error={errors.customisation}>
              <input id="customisation" type="text" placeholder="e.g. Gallery name woven into border" value={customisation}
                onChange={(e) => setCustomisation(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.customisation ? 'customisation-error' : undefined} aria-invalid={!!errors.customisation} />
            </Field>
            <Field label="Quantity" id="customQty" error={errors.customQty}>
              <input id="customQty" type="number" min="1" value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.customQty ? 'customQty-error' : undefined} aria-invalid={!!errors.customQty} />
            </Field>
            <Field label="Notes (optional)" id="customNotes" error={undefined}>
              <textarea id="customNotes" rows={3} value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Needed by September for exhibition"
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y" />
            </Field>
          </>
        )}

        <button type="submit" disabled={submitting}
          className="tap-target inline-flex items-center gap-2 px-6 py-3 btn-primary">
          {submitting ? 'Submitting...' : 'Submit request'}
        </button>
      </form>
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

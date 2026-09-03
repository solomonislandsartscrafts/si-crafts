'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Minus, Plus, AlertTriangle, ArrowLeft, Send, X, MessageSquare, ShoppingCart } from 'lucide-react';
import type { CartItem } from '@/types';
import { getCart, updateQuantity, updateNote, removeFromCart, clearCart, getCartTotal, GST_THRESHOLD } from '@/lib/cart';
import { validateStockistSession } from '@/lib/auth-client';
import { createOrderRequest } from '@/services/orders';
import { formatPrice } from '@/lib/price';
import { PageHeader } from '@/components/layout/page-header';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';
import { SuccessPanel } from '@/components/ui/success-panel';
import { useModalA11y } from '@/lib/use-modal-a11y';

export default function StockistOrdersPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [submitted, setSubmitted] = useState<{ ref: string; time: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { router.push('/stockist/login'); return; }
      const stockist = await validateStockistSession(token);
      if (!stockist) { localStorage.removeItem('stockist_session'); router.push('/stockist/login'); return; }
      setAuthenticated(true);
      setCart(getCart());
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const [noteModalItem, setNoteModalItem] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Focus trap + Escape + focus restore for the note modal, via the shared
  // hook. modalRef attaches to the modal panel below.
  const noteModalRef = useModalA11y(noteModalItem !== null, () => setNoteModalItem(null));

  function openNoteModal(productId: string) {
    const item = cart.find((i) => i.productId === productId);
    setNoteText(item?.note || '');
    setNoteModalItem(productId);
  }

  function saveNote() {
    if (noteModalItem) {
      const updated = updateNote(noteModalItem, noteText.trim());
      setCart([...updated]);
    }
    setNoteModalItem(null);
    setNoteText('');
  }

  const total = getCartTotal(cart);
  const showGstWarning = total > GST_THRESHOLD;

  function handleQuantityChange(productId: string, qty: number) {
    const updated = updateQuantity(productId, qty);
    setCart([...updated]);
  }

  function handleRemove(productId: string) {
    const updated = removeFromCart(productId);
    setCart([...updated]);
  }

  async function handleSubmit() {
    // Submitting creates an order request, so guard against a second click
    // landing while the first is still in flight.
    if (submitting) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('stockist_session');
      if (!token) return;
      const stockist = await validateStockistSession(token);
      if (!stockist) return;

      const order = await createOrderRequest(stockist.id, cart);
      clearCart();
      setSubmitted({ ref: order.referenceNumber, time: order.submittedAt });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't submit your order request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated || loading) {
    return (
      <div className="site-container page-y">
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (submitted) {
    return (
      <SuccessPanel
        icon={Send}
        title="Order request submitted"
        actions={
          <>
            <ButtonLink href="/stockist/order-history" variant="secondary">
              View order history
            </ButtonLink>
            <ButtonLink href="/stockist/catalogue" variant="secondary">
              Continue shopping
            </ButtonLink>
          </>
        }
      >
        <div className="text-center">
          <p className="text-base text-warm-gray-600 mb-2xs">Reference: <strong>{submitted.ref}</strong></p>
          <p className="text-sm text-warm-gray-400 mb-md">{new Date(submitted.time).toLocaleString()}</p>
        </div>
        <div className="bg-sand-light rounded-md p-sm text-base text-warm-gray-600">
          This is an expression of interest. We&apos;ll confirm availability and send bank transfer details by email.
        </div>
        {showGstWarning && (
          <div className="bg-warning/10 border border-warning/20 text-warning-text text-base rounded-md p-xs mt-md flex items-center gap-2xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>This order exceeds A$1,000. GST registration obligations may apply.</span>
          </div>
        )}
      </SuccessPanel>
    );
  }

  return (
    <>
      <PageHeader
        title="Your Order"
        intro="Review your order request. Orders are expressions of interest paid by bank transfer, not confirmed purchases."
        eyebrow={
          <Link href="/stockist/catalogue" className="inline-flex items-center gap-3xs text-sm text-ocean hover:text-ocean-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to catalogue
          </Link>
        }
      />

      <div className="site-container pb-section">
        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your order is empty."
            action={
              <ButtonLink href="/stockist/catalogue" variant="secondary" size="sm">
                Browse the catalogue
              </ButtonLink>
            }
          />
        ) : (
          <>
            {/* Cart items */}
            <div className="divide-y divide-sand mb-lg">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-sm py-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-warm-gray-800 truncate">{item.productName}</p>
                    <p className="text-sm text-warm-gray-600">{item.productCode} · {formatPrice(item.unitPrice)} each</p>
                    {/* Note button */}
                    <div className="mt-3xs">
                      <Button variant="secondary" size="sm" onClick={() => openNoteModal(item.productId)}>
                        {item.note ? (
                          <>
                            <MessageSquare className="w-4 h-4" /> Note added
                          </>
                        ) : (
                          'Add note'
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2xs">
                    <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="tap-target p-2xs rounded-md border border-sand-dark hover:bg-sand-light disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-ocean"
                      aria-label={`Decrease quantity of ${item.productName}`}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= 999}
                      className="tap-target p-2xs rounded-md border border-sand-dark hover:bg-sand-light disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-ocean"
                      aria-label={`Increase quantity of ${item.productName}`}>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="w-20 text-right font-medium text-warm-gray-800">
                    {formatPrice(item.quantity * item.unitPrice)}
                  </p>
                  <button onClick={() => handleRemove(item.productId)}
                    className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                    aria-label={`Remove ${item.productName} from order`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-sm border-t-2 border-deep-blue mb-sm">
              <span className="font-heading font-semibold text-deep-blue text-lg">Total (ex. GST)</span>
              <span className="font-heading font-semibold text-deep-blue text-lg">{formatPrice(total)}</span>
            </div>

            {/* GST Warning */}
            {showGstWarning && (
              <div className="bg-warning/10 border border-warning/20 text-warning-text text-base rounded-md p-xs mb-md flex items-center gap-2xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>This order exceeds A$1,000. GST registration obligations may apply.</span>
              </div>
            )}

            {/* Bank transfer notice */}
            <div className="bg-sand-light rounded-md p-sm text-base text-warm-gray-600 mb-md">
              Orders are expressions of interest paid by bank transfer. This is not a confirmed purchase.
            </div>

            {submitError && (
              <div
                className="bg-error/10 border border-error/20 text-error text-base rounded-md p-xs mb-sm"
                role="alert"
                aria-live="assertive"
              >
                {submitError}
              </div>
            )}
            <Button
              onClick={handleSubmit}
              fullWidth
              loading={submitting}
              loadingText="Submitting..."
            >
              Submit order request
            </Button>
          </>
        )}
      </div>

      {/* Note modal */}
      {noteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-sm bg-deep-blue/50" onClick={() => setNoteModalItem(null)}>
          <div
            ref={noteModalRef}
            className="bg-white rounded-lg shadow-md w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Add note"
          >
            <div className="flex items-center justify-between px-md py-sm border-b border-sand">
              <h3 className="font-heading text-lg font-medium text-deep-blue">Add Note</h3>
              <button onClick={() => setNoteModalItem(null)} className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-md py-sm">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. preferred colour, custom engraving, quantity notes..."
                rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>
            <div className="flex justify-end gap-xs px-md py-sm border-t border-sand">
              <Button variant="secondary" size="sm" onClick={() => setNoteModalItem(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveNote}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

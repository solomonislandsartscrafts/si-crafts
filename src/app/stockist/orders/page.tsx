'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Minus, Plus, AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import type { CartItem } from '@/types';
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal, GST_THRESHOLD } from '@/lib/cart';
import { validateStockistSession } from '@/services/auth';
import { createOrderRequest } from '@/services/orders';

export default function StockistOrdersPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [submitted, setSubmitted] = useState<{ ref: string; time: string } | null>(null);
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
    const token = localStorage.getItem('stockist_session');
    if (!token) return;
    const stockist = await validateStockistSession(token);
    if (!stockist) return;

    const order = await createOrderRequest(stockist.id, cart);
    clearCart();
    setSubmitted({ ref: order.referenceNumber, time: order.submittedAt });
  }

  if (!authenticated || loading) {
    return <div className="max-w-3xl mx-auto px-4 py-section-lg"><p className="text-warm-gray-400">Loading...</p></div>;
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-section-lg text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <Send className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-deep-blue mb-3">Order request submitted</h1>
        <p className="text-warm-gray-600 mb-2">Reference: <strong>{submitted.ref}</strong></p>
        <p className="text-sm text-warm-gray-400 mb-6">{new Date(submitted.time).toLocaleString()}</p>
        <div className="bg-sand-light rounded-md p-4 text-sm text-warm-gray-600 mb-6">
          This is an expression of interest. We&apos;ll confirm availability and send bank transfer details by email.
        </div>
        {showGstWarning && (
          <div className="bg-warning/10 border border-warning/20 text-warning text-sm rounded-md p-3 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>This order exceeds A$1,000. GST registration obligations may apply.</span>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Link href="/stockist/order-history" className="text-ocean hover:underline font-medium">View order history</Link>
          <Link href="/stockist/catalogue" className="text-ocean hover:underline font-medium">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-section-lg">
      <Link href="/stockist/catalogue" className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to catalogue
      </Link>

      <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-2">Your Order</h1>
      <p className="text-sm text-warm-gray-600 mb-8">
        Review your order request. Orders are expressions of interest paid by bank transfer, not confirmed purchases.
      </p>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warm-gray-600 mb-4">Your order is empty.</p>
          <Link href="/stockist/catalogue" className="text-ocean hover:underline font-medium">Browse the catalogue</Link>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div className="divide-y divide-sand mb-8">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-warm-gray-800 truncate">{item.productName}</p>
                  <p className="text-xs text-warm-gray-400">{item.productCode} · A${item.unitPrice.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="tap-target p-2 rounded-md border border-sand-dark hover:bg-sand-light disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-ocean"
                    aria-label={`Decrease quantity of ${item.productName}`}>
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= 999}
                    className="tap-target p-2 rounded-md border border-sand-dark hover:bg-sand-light disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-ocean"
                    aria-label={`Increase quantity of ${item.productName}`}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="w-20 text-right font-medium text-warm-gray-800">
                  A${(item.quantity * item.unitPrice).toFixed(2)}
                </p>
                <button onClick={() => handleRemove(item.productId)}
                  className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                  aria-label={`Remove ${item.productName} from order`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-4 border-t-2 border-deep-blue mb-4">
            <span className="font-heading font-bold text-deep-blue text-lg">Total (ex. GST)</span>
            <span className="font-heading font-bold text-deep-blue text-lg">A${total.toFixed(2)}</span>
          </div>

          {/* GST Warning */}
          {showGstWarning && (
            <div className="bg-warning/10 border border-warning/20 text-warning text-sm rounded-md p-3 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>This order exceeds A$1,000. GST registration obligations may apply.</span>
            </div>
          )}

          {/* Bank transfer notice */}
          <div className="bg-sand-light rounded-md p-4 text-sm text-warm-gray-600 mb-6">
            Orders are expressions of interest paid by bank transfer. This is not a confirmed purchase.
          </div>

          <button onClick={handleSubmit}
            className="tap-target w-full flex items-center justify-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light">
            <Send className="w-4 h-4" />
            Submit order request
          </button>
        </>
      )}
    </div>
  );
}

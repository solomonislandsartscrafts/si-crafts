'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ClipboardList, MessageSquare, LogOut, ShoppingCart } from 'lucide-react';
import type { Stockist } from '@/types';
import { validateStockistSession } from '@/lib/auth-client';
import { getCart } from '@/lib/cart';

export default function StockistAccountPage() {
  const router = useRouter();
  const [stockist, setStockist] = useState<Stockist | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { router.push('/login'); return; }
      const s = await validateStockistSession(token);
      if (!s) { localStorage.removeItem('stockist_session'); router.push('/login'); return; }
      setStockist(s);
      setCartCount(getCart().reduce((sum, i) => sum + i.quantity, 0));
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem('stockist_session');
    if (token) {
      await fetch('/api/auth/stockist/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }
    localStorage.removeItem('stockist_session');
    router.push('/');
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-section-lg"><p className="text-warm-gray-400">Loading...</p></div>;
  }

  if (!stockist) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      {/* Welcome + Logout */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
            Welcome back, {stockist.contactName}
          </h1>
          <p className="text-warm-gray-600 mt-1">{stockist.businessName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-warm-gray-600 border border-sand-dark rounded-md hover:bg-error/5 hover:text-error hover:border-error/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Link href="/catalogue" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow">
          <Package className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-bold text-deep-blue group-hover:text-ocean transition-colors">Browse Catalogue</h3>
          <p className="text-sm text-warm-gray-600 mt-1">View products and add to your order</p>
        </Link>

        <Link href="/stockist/orders" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow relative">
          <ShoppingCart className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-bold text-deep-blue group-hover:text-ocean transition-colors">Current Order</h3>
          <p className="text-sm text-warm-gray-600 mt-1">
            {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''} in your order` : 'Your order is empty'}
          </p>
          {cartCount > 0 && (
            <span className="absolute top-4 right-4 min-w-[20px] h-[20px] flex items-center justify-center bg-terracotta text-white text-xs font-bold rounded-full px-1">
              {cartCount}
            </span>
          )}
        </Link>

        <Link href="/stockist/order-history" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow">
          <ClipboardList className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-bold text-deep-blue group-hover:text-ocean transition-colors">Order History</h3>
          <p className="text-sm text-warm-gray-600 mt-1">View your past orders and status</p>
        </Link>

        <Link href="/stockist/requests" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow">
          <MessageSquare className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-bold text-deep-blue group-hover:text-ocean transition-colors">Requests</h3>
          <p className="text-sm text-warm-gray-600 mt-1">Custom orders and replacement tags</p>
        </Link>
      </div>

      {/* Account details */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <h2 className="font-heading text-lg font-bold text-deep-blue mb-4">Account Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">Business Name</dt>
            <dd className="text-warm-gray-800 font-medium mt-0.5">{stockist.businessName}</dd>
          </div>
          <div>
            <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">ABN</dt>
            <dd className="text-warm-gray-800 font-medium mt-0.5">{stockist.abn}</dd>
          </div>
          <div>
            <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">Contact Name</dt>
            <dd className="text-warm-gray-800 font-medium mt-0.5">{stockist.contactName}</dd>
          </div>
          <div>
            <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">Email</dt>
            <dd className="text-warm-gray-800 font-medium mt-0.5">{stockist.email}</dd>
          </div>
          <div>
            <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">Phone</dt>
            <dd className="text-warm-gray-800 font-medium mt-0.5">{stockist.phone}</dd>
          </div>
          <div>
            <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">Status</dt>
            <dd className="mt-0.5">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success capitalize">
                {stockist.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>

    </div>
  );
}

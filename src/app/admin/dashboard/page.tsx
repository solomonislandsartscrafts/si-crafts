'use client';

import { useState, useEffect } from 'react';
import { Users, Package, Palette, Store, ClipboardList, Inbox } from 'lucide-react';
import { AdminLayout } from '@/components/admin';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ makers: 0, products: 0, crafts: 0, stockists: 0, orders: 0, enquiries: 0 });

  useEffect(() => {
    async function load() {
      const { getAllMakers } = await import('@/services/makers');
      const { getAllProducts } = await import('@/services/products');
      const { getAllCrafts } = await import('@/services/crafts');
      const { getAllStockists } = await import('@/services/stockists');
      const { getAllOrders } = await import('@/services/orders');
      const { listEnquiries } = await import('@/services/enquiries');
      const [m, p, c, s, o, e] = await Promise.all([getAllMakers(), getAllProducts(), getAllCrafts(), getAllStockists(), getAllOrders(), listEnquiries()]);
      setStats({ makers: m.length, products: p.length, crafts: c.length, stockists: s.length, orders: o.length, enquiries: e.filter((i) => !i.data.handled).length });
    }
    load();
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold text-deep-blue mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Inbox} label="Open Enquiries" value={stats.enquiries} />
        <StatCard icon={Users} label="Makers" value={stats.makers} />
        <StatCard icon={Package} label="Products" value={stats.products} />
        <StatCard icon={Palette} label="Crafts" value={stats.crafts} />
        <StatCard icon={Store} label="Stockists" value={stats.stockists} />
        <StatCard icon={ClipboardList} label="Orders" value={stats.orders} />
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-card">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-ocean" />
        <span className="text-sm text-warm-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-deep-blue">{value}</p>
    </div>
  );
}

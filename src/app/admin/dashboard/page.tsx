'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  ClipboardList,
  Store,
  Users,
  Package,
  Newspaper,
  Plus,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { AttentionPanel } from '@/components/admin/attention-panel';
import { ActivityFeed } from '@/components/admin/activity-feed';
import { SetupProgressCard } from '@/components/admin/setup-progress-card';
import { pageTitleClasses } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import { getDashboardSummary } from '@/services/dashboard';
import type { DashboardSummary } from '@/types';

const EMPTY_SUMMARY: DashboardSummary = {
  counts: {
    makers: 0, makersPublished: 0, products: 0, productsPublished: 0,
    crafts: 0, categories: 0, articles: 0, articlesPublished: 0,
    stockists: 0, stockistsApproved: 0, stockistsPending: 0,
    orders: 0, ordersToAction: 0, openEnquiries: 0,
  },
  setup: { categories: 0, crafts: 0, makers: 0, products: 0, articles: 0, siteImages: 0 },
  attention: [],
  activity: [],
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setSummary(EMPTY_SUMMARY))
      .finally(() => setLoading(false));
  }, []);

  const { counts, setup, attention, activity } = summary;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-sm mb-md">
        <div>
          <h1 className={pageTitleClasses}>Dashboard</h1>
          <p className="text-base text-warm-gray-600 mt-3xs">
            What needs your attention, and what changed recently.
          </p>
        </div>
        <div className="flex flex-wrap gap-2xs">
          <ButtonLink href="/admin/getting-started" variant="secondary" size="sm">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Getting started
          </ButtonLink>
          <Link
            href="/"
            className="tap-target inline-flex items-center gap-2xs px-sm py-2xs text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            View site
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* Metrics — actionable numbers first */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-sm mb-md">
            <StatCard
              icon={Inbox}
              label="Open enquiries"
              value={counts.openEnquiries}
              hint="Awaiting a reply"
              href="/admin/inbox"
              urgent={counts.openEnquiries > 0}
            />
            <StatCard
              icon={ClipboardList}
              label="Orders to action"
              value={counts.ordersToAction}
              hint={`${counts.orders} total`}
              href="/admin/orders"
              urgent={counts.ordersToAction > 0}
            />
            <StatCard
              icon={Store}
              label="Stockist applications"
              value={counts.stockistsPending}
              hint={`${counts.stockistsApproved} approved`}
              href="/admin/stockists"
              urgent={counts.stockistsPending > 0}
            />
            <StatCard
              icon={Users}
              label="Makers live"
              value={counts.makersPublished}
              hint={`of ${counts.makers} profiles`}
              href="/admin/makers"
            />
            <StatCard
              icon={Package}
              label="Products live"
              value={counts.productsPublished}
              hint={`of ${counts.products} products`}
              href="/admin/products"
            />
            <StatCard
              icon={Newspaper}
              label="Articles live"
              value={counts.articlesPublished}
              hint={`of ${counts.articles} written`}
              href="/admin/news"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-md">
              <AttentionPanel items={attention} />
              <QuickActions />
            </div>

            {/* Side column */}
            <div className="space-y-md">
              <SetupProgressCard progress={setup} />
              <ActivityFeed items={activity} />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

// --- Pieces ------------------------------------------------------------------

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
  href: string;
  urgent?: boolean;
}

function StatCard({ icon: Icon, label, value, hint, href, urgent = false }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`block rounded-lg p-sm shadow-card transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ocean ${
        urgent ? 'bg-white border-l-4 border-accent-gold' : 'bg-card-bg'
      }`}
    >
      <div className="flex items-center gap-2xs mb-2xs">
        <Icon className="w-4 h-4 text-ocean flex-shrink-0" aria-hidden="true" />
        <span className="text-xs text-warm-gray-600 leading-heading">{label}</span>
      </div>
      <p className="text-2xl font-bold text-deep-blue leading-none">{value}</p>
      <p className="text-xs text-warm-gray-400 mt-3xs">{hint}</p>
    </Link>
  );
}

const QUICK_ACTIONS = [
  { href: '/admin/products', label: 'Add a product', icon: Package },
  { href: '/admin/makers', label: 'Add a maker', icon: Users },
  { href: '/admin/news', label: 'Write an article', icon: Newspaper },
  { href: '/admin/stockists', label: 'Manage stockists', icon: Store },
];

function QuickActions() {
  return (
    <section className="bg-card-bg rounded-lg shadow-card p-md">
      <h2 className="font-heading text-lg font-semibold text-deep-blue mb-xs">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
        {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="tap-target flex items-center gap-xs px-sm py-xs rounded-md border border-sand hover:border-ocean hover:bg-sand-light transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            <Icon className="w-4 h-4 text-ocean flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium text-warm-gray-800">{label}</span>
            <Plus className="w-4 h-4 ml-auto text-warm-gray-400" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <SkeletonRegion label="Loading dashboard" className="space-y-md">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card-bg rounded-lg p-sm shadow-card">
            <Skeleton className="h-3 w-2/3 mb-xs" />
            <Skeleton className="h-6 w-10" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid">
        <div className="lg:col-span-2 bg-card-bg rounded-lg shadow-card h-64" />
        <div className="bg-card-bg rounded-lg shadow-card h-64" />
      </div>
    </SkeletonRegion>
  );
}

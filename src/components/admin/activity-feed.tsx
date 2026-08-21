'use client';

import Link from 'next/link';
import { Users, Package, Newspaper, ClipboardList, Inbox, Store } from 'lucide-react';
import type { ActivityItem } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';

interface ActivityFeedProps {
  items: ActivityItem[];
}

const KIND_ICON = {
  maker: Users,
  product: Package,
  article: Newspaper,
  order: ClipboardList,
  enquiry: Inbox,
  stockist: Store,
} satisfies Record<ActivityItem['kind'], React.ComponentType<{ className?: string }>>;

/** "3 days ago" style label. Falls back to a date beyond a month. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days <= 30) return `${days}d ago`;

  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

/** Most recent changes and submissions across the site. */
export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="bg-card-bg rounded-lg shadow-card p-5">
      <h2 className="font-heading text-lg font-semibold text-deep-blue mb-3">Recent activity</h2>

      {items.length === 0 ? (
        <EmptyState
          title="No activity yet."
          description="Once you add content or receive enquiries they will show here."
          action={
            <ButtonLink href="/admin/getting-started" variant="secondary" size="sm">
              Getting started
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-sand">
          {items.map((item) => {
            const Icon = KIND_ICON[item.kind];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="tap-target flex items-center gap-3 py-3 -mx-2 px-2 rounded-md hover:bg-sand-light focus:outline-none focus:ring-2 focus:ring-ocean"
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-warm-gray-400" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-gray-800 truncate">{item.label}</p>
                    <p className="text-xs text-warm-gray-600 truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-warm-gray-400 flex-shrink-0">{timeAgo(item.at)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, ChevronRight } from 'lucide-react';
import type { AttentionItem, AttentionSeverity } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';

interface AttentionPanelProps {
  items: AttentionItem[];
}

const SEVERITY = {
  error: { Icon: OctagonAlert, icon: 'text-error', badge: 'error', label: 'Fix now' },
  warning: { Icon: AlertTriangle, icon: 'text-accent-gold-dark', badge: 'warning', label: 'To do' },
  info: { Icon: Info, icon: 'text-ocean', badge: 'info', label: 'When you can' },
} satisfies Record<AttentionSeverity, { Icon: React.ComponentType<{ className?: string }>; icon: string; badge: 'error' | 'warning' | 'info'; label: string }>;

/**
 * Lists the things an admin should act on, worst first, each linking
 * straight to the screen where it can be fixed.
 */
export function AttentionPanel({ items }: AttentionPanelProps) {
  if (items.length === 0) {
    return (
      <section className="bg-card-bg rounded-lg shadow-card p-md">
        <h2 className="font-heading text-lg font-semibold text-deep-blue mb-xs">Needs attention</h2>
        <div className="flex items-start gap-xs rounded-md bg-success/5 p-sm">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-base text-warm-gray-800">
            Nothing outstanding. Enquiries are answered, consent is recorded and every image has alt text.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card-bg rounded-lg shadow-card p-md">
      <div className="flex items-baseline justify-between gap-xs mb-xs">
        <h2 className="font-heading text-lg font-semibold text-deep-blue">Needs attention</h2>
        <span className="text-xs text-warm-gray-400">{items.length} items</span>
      </div>

      <ul className="divide-y divide-sand">
        {items.map((item) => {
          const { Icon, icon, badge, label } = SEVERITY[item.severity];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="tap-target group flex items-start gap-xs py-xs -mx-2xs px-2xs rounded-md hover:bg-sand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
              >
                <Icon className={`w-5 h-5 flex-shrink-0 mt-3xs ${icon}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2xs">
                    <p className="text-base font-semibold text-warm-gray-800">{item.label}</p>
                    <StatusBadge status={badge} size="compact">{label}</StatusBadge>
                  </div>
                  <p className="text-base text-warm-gray-600 mt-3xs leading-body">{item.detail}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-3xs text-warm-gray-400 group-hover:text-ocean transition-colors" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

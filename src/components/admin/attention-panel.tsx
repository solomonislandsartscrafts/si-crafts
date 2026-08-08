'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, ChevronRight } from 'lucide-react';
import type { AttentionItem, AttentionSeverity } from '@/types';

interface AttentionPanelProps {
  items: AttentionItem[];
}

const SEVERITY = {
  error: { Icon: OctagonAlert, icon: 'text-error', chip: 'bg-error/10 text-error', label: 'Fix now' },
  warning: { Icon: AlertTriangle, icon: 'text-accent-gold-dark', chip: 'bg-accent-gold/20 text-warm-gray-800', label: 'To do' },
  info: { Icon: Info, icon: 'text-ocean', chip: 'bg-ocean/10 text-ocean', label: 'When you can' },
} satisfies Record<AttentionSeverity, { Icon: React.ComponentType<{ className?: string }>; icon: string; chip: string; label: string }>;

/**
 * Lists the things an admin should act on, worst first, each linking
 * straight to the screen where it can be fixed.
 */
export function AttentionPanel({ items }: AttentionPanelProps) {
  if (items.length === 0) {
    return (
      <section className="bg-card-bg rounded-lg shadow-card p-5">
        <h2 className="font-heading text-lg font-semibold text-deep-blue mb-3">Needs attention</h2>
        <div className="flex items-start gap-3 rounded-md bg-success/5 p-4">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-sm text-warm-gray-800">
            Nothing outstanding. Enquiries are answered, consent is recorded and every image has alt text.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card-bg rounded-lg shadow-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="font-heading text-lg font-semibold text-deep-blue">Needs attention</h2>
        <span className="text-xs text-warm-gray-400">{items.length} items</span>
      </div>

      <ul className="divide-y divide-sand">
        {items.map((item) => {
          const { Icon, icon, chip, label } = SEVERITY[item.severity];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="tap-target group flex items-start gap-3 py-3 -mx-2 px-2 rounded-md hover:bg-sand-light focus:outline-none focus:ring-2 focus:ring-ocean"
              >
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icon}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-warm-gray-800">{item.label}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${chip}`}>{label}</span>
                  </div>
                  <p className="text-xs text-warm-gray-600 mt-1 leading-body">{item.detail}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 text-warm-gray-400 group-hover:text-ocean transition-colors" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

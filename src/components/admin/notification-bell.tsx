'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  AlertTriangle,
  Info,
  OctagonAlert,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import type { AttentionItem, AttentionSeverity } from '@/types';
import { getDashboardSummary } from '@/services/dashboard';

interface NotificationBellProps {
  /**
   * Colour context. `dark` (default) renders a white icon for the deep-blue
   * sidebar/top bar; `light` renders a dark icon for a light surface.
   */
  tone?: 'dark' | 'light';
  /** Called when a notification link is followed — closes the mobile drawer. */
  onNavigate?: () => void;
}

const SEVERITY = {
  error: { Icon: OctagonAlert, icon: 'text-error' },
  warning: { Icon: AlertTriangle, icon: 'text-accent-gold-dark' },
  info: { Icon: Info, icon: 'text-ocean' },
} satisfies Record<
  AttentionSeverity,
  { Icon: React.ComponentType<{ className?: string }>; icon: string }
>;

/**
 * Bell in the admin chrome that surfaces everything an admin might miss or
 * needs to follow up on — the same "needs attention" items the dashboard
 * lists, worst first. Reads from the dashboard service so the two never drift.
 *
 * A badge shows the item count; the dropdown links each item straight to the
 * screen where it can be cleared.
 */
export function NotificationBell({ tone = 'dark', onNavigate }: NotificationBellProps) {
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // Load attention items once, and refresh whenever the admin moves to a new
  // screen (they may have just cleared something).
  useEffect(() => {
    let active = true;
    getDashboardSummary()
      .then((summary) => {
        if (active) setItems(summary.attention);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;

    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const count = items.length;
  const errorCount = items.filter((i) => i.severity === 'error').length;
  const label = count === 0
    ? 'Notifications, nothing outstanding'
    : `Notifications, ${count} ${count === 1 ? 'item' : 'items'} need attention`;

  const iconColor = tone === 'dark' ? 'text-white/70 hover:text-white' : 'text-warm-gray-600 hover:text-deep-blue';
  const ring = tone === 'dark' ? 'focus-visible:ring-accent-gold' : 'focus-visible:ring-ocean';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`tap-target relative flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 ${iconColor} ${ring}`}
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="w-6 h-6" aria-hidden="true" />
        {count > 0 && (
          <span
            className={`absolute top-3xs right-3xs min-w-[18px] h-[18px] px-3xs flex items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${
              errorCount > 0 ? 'bg-error' : 'bg-accent-gold-dark'
            }`}
            aria-hidden="true"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2xs w-[min(92vw,22rem)] max-h-[70vh] overflow-y-auto rounded-lg bg-card-bg shadow-md border border-sand"
        >
          <div className="flex items-baseline justify-between gap-xs px-sm py-xs border-b border-sand">
            <h2 className="font-heading text-base font-semibold text-deep-blue">Notifications</h2>
            {count > 0 && <span className="text-xs text-warm-gray-400">{count} to follow up</span>}
          </div>

          {count === 0 ? (
            <div className="flex items-start gap-xs p-md">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" aria-hidden="true" />
              <p className="text-base text-warm-gray-800 leading-body">
                Nothing outstanding. Enquiries are answered, consent is recorded and every image has alt text.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-sand">
              {items.map((item) => {
                const { Icon, icon } = SEVERITY[item.severity];
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        close();
                        onNavigate?.();
                      }}
                      className="group flex items-start gap-xs px-sm py-xs hover:bg-sand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean"
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-3xs ${icon}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-warm-gray-800">{item.label}</p>
                        <p className="text-sm text-warm-gray-600 mt-3xs leading-body">{item.detail}</p>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 mt-3xs text-warm-gray-400 group-hover:text-ocean transition-colors"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-sand px-sm py-xs">
            <Link
              href="/admin/dashboard"
              onClick={() => {
                close();
                onNavigate?.();
              }}
              className="tap-target flex items-center justify-center text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

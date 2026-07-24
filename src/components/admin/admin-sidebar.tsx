'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, Palette, Store, ClipboardList, Shield, Inbox, Newspaper, LogOut, ExternalLink } from 'lucide-react';
import type { AdminRole } from '@/types';

interface AdminSidebarProps {
  role: AdminRole;
  adminName?: string;
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'editor'] },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox, roles: ['super_admin', 'editor'] },
  { href: '/admin/news', label: 'News', icon: Newspaper, roles: ['super_admin', 'editor'] },
  { href: '/admin/makers', label: 'Makers', icon: Users, roles: ['super_admin', 'editor'] },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['super_admin', 'editor'] },
  { href: '/admin/crafts', label: 'Crafts', icon: Palette, roles: ['super_admin', 'editor'] },
  { href: '/admin/stockists', label: 'Stockists', icon: Store, roles: ['super_admin', 'editor'] },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList, roles: ['super_admin', 'editor'] },
  { href: '/admin/admins', label: 'Admin Users', icon: Shield, roles: ['super_admin'] },
];

export function AdminSidebar({ role, adminName, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-56 flex-shrink-0 bg-deep-blue text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/" className="font-heading text-lg font-bold text-white hover:text-white/80 transition-colors">
          SI Crafts
        </Link>
        <p className="text-xs text-white/40 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-target flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-sand/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Return to Site + User + Logout at bottom */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        <Link
          href="/"
          className="tap-target flex items-center gap-2 px-3 py-2 text-sm font-medium text-ocean-light hover:text-white hover:bg-white/5 rounded-md transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Site
        </Link>
        {adminName && (
          <p className="text-xs text-white/60 truncate">{adminName}</p>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="tap-target w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}

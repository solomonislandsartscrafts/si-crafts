'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, Palette, Store, ClipboardList, Shield, Inbox } from 'lucide-react';
import type { AdminRole } from '@/types';

interface AdminSidebarProps {
  role: AdminRole;
}

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'editor'] },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox, roles: ['super_admin', 'editor'] },
  { href: '/admin/makers', label: 'Makers', icon: Users, roles: ['super_admin', 'editor'] },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['super_admin', 'editor'] },
  { href: '/admin/crafts', label: 'Crafts', icon: Palette, roles: ['super_admin', 'editor'] },
  { href: '/admin/stockists', label: 'Stockists', icon: Store, roles: ['super_admin', 'editor'] },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList, roles: ['super_admin', 'editor'] },
  { href: '/admin/admins', label: 'Admin Users', icon: Shield, roles: ['super_admin'] },
];

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-56 flex-shrink-0 bg-deep-blue text-white min-h-[calc(100vh-4rem)]">
      <nav className="py-4 space-y-1">
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
    </aside>
  );
}

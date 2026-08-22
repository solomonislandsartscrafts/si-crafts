'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UsersRound, Package, Palette, Store, ClipboardList, Shield, Inbox, Newspaper, LogOut, ExternalLink, ImageIcon, Tags, BookOpen, SlidersHorizontal, KeyRound, HelpCircle, MapPin, Handshake } from 'lucide-react';
import type { AdminRole } from '@/types';

interface AdminSidebarProps {
  role: AdminRole;
  adminName?: string;
  onLogout?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AdminRole[];
}

interface NavGroup {
  /** Section header label (shown as small uppercase text) */
  title: string;
  /** Which roles can see this group (group hidden if no items visible) */
  roles: AdminRole[];
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    roles: ['super_admin', 'editor'],
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'editor'] },
    ],
  },
  {
    title: 'Catalogue',
    roles: ['super_admin', 'editor'],
    items: [
      { href: '/admin/categories', label: 'Categories', icon: Tags, roles: ['super_admin', 'editor'] },
      { href: '/admin/crafts', label: 'Crafts', icon: Palette, roles: ['super_admin', 'editor'] },
      { href: '/admin/makers', label: 'Makers', icon: Users, roles: ['super_admin', 'editor'] },
      { href: '/admin/products', label: 'Products', icon: Package, roles: ['super_admin', 'editor'] },
    ],
  },
  {
    title: 'Operations',
    roles: ['super_admin', 'editor'],
    items: [
      { href: '/admin/stockists', label: 'Stockists', icon: Store, roles: ['super_admin', 'editor'] },
      { href: '/admin/orders', label: 'Orders', icon: ClipboardList, roles: ['super_admin', 'editor'] },
      { href: '/admin/retail-stockists', label: 'Where to Buy', icon: MapPin, roles: ['super_admin', 'editor'] },
    ],
  },
  {
    title: 'Content',
    roles: ['super_admin', 'editor'],
    items: [
      { href: '/admin/site-content', label: 'Site Content', icon: ImageIcon, roles: ['super_admin', 'editor'] },
      { href: '/admin/slideshow', label: 'Slideshow', icon: SlidersHorizontal, roles: ['super_admin', 'editor'] },
      { href: '/admin/supporters', label: 'Supporters', icon: Handshake, roles: ['super_admin', 'editor'] },
      { href: '/admin/news', label: 'News', icon: Newspaper, roles: ['super_admin', 'editor'] },
      { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle, roles: ['super_admin', 'editor'] },
      { href: '/admin/inbox', label: 'Inbox', icon: Inbox, roles: ['super_admin', 'editor'] },
    ],
  },
  {
    title: 'Admin',
    roles: ['super_admin'],
    items: [
      { href: '/admin/users', label: 'Accounts', icon: KeyRound, roles: ['super_admin'] },
      { href: '/admin/admins', label: 'Admin Users', icon: Shield, roles: ['super_admin'] },
      { href: '/admin/team', label: 'Team', icon: UsersRound, roles: ['super_admin'] },
      { href: '/admin/getting-started', label: 'Getting Started', icon: BookOpen, roles: ['super_admin', 'editor'] },
    ],
  },
];

interface AdminSidebarNavProps extends AdminSidebarProps {
  /** Called when a nav link is followed — used to close the mobile drawer. */
  onNavigate?: () => void;
}

export function AdminSidebar({
  role,
  adminName,
  onLogout,
  onNavigate,
}: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 lg:w-56 flex-shrink-0 bg-deep-blue text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/" className="font-heading text-lg font-semibold text-white hover:text-white/80 transition-colors">
          SIAC
        </Link>
        <p className="text-xs text-white/40 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation — grouped with section headers */}
      <nav className="flex-1 py-3 overflow-y-auto" aria-label="Admin navigation">
        {NAV_GROUPS.map((group) => {
          // Skip entire group if the current role isn't in group.roles
          if (!group.roles.includes(role)) return null;
          // Filter items by role
          const visibleItems = group.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mt-4 first:mt-0">
              {/* Section header */}
              <h3 className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {group.title}
              </h3>

              {/* Section items */}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`tap-target flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-white/10 text-white border-l-[3px] border-accent-gold'
                            : 'text-white/60 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Return to Site + User + Logout at bottom */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="tap-target flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
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

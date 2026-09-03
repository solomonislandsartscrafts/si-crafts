'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import type { AdminUser } from '@/types';
import { AdminSidebar } from './admin-sidebar';
import { validateAdminSession } from '@/lib/auth-client';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SkeletonText } from '@/components/ui/skeleton';

interface AdminLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | null;
}

export function AdminLayout({ children, requiredRole = null }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback(() => setNavOpen(false), []);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // The drawer is aria-modal, so it has to behave like one: trap Tab inside it,
  // move focus in on open, hand focus back to the menu button on close, close
  // on Escape, and lock body scroll. Same hook the admin form modals use.
  const drawerRef = useModalA11y(navOpen, closeNav);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('admin_session');
      if (!token) { router.push('/'); return; }

      const user = await validateAdminSession(token);
      if (!user) { localStorage.removeItem('admin_session'); router.push('/'); return; }

      if (requiredRole && user.role !== requiredRole) {
        setDenied(true);
        setLoading(false);
        return;
      }

      setAdmin(user);
      setLoading(false);
    }
    checkAuth();
  }, [router, requiredRole]);

  async function handleLogout() {
    try {
      const token = localStorage.getItem('admin_session');
      if (token) {
        await fetch('/api/auth/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } finally {
      localStorage.removeItem('admin_session');
      router.push('/');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-sm">
        <div className="w-full max-w-sm">
          <SkeletonText lines={3} />
        </div>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex items-center justify-center min-h-screen px-sm">
        <div className="text-center">
          <h1 className={`${pageTitleClasses} mb-2xs`}>Insufficient permissions</h1>
          <p className="text-base text-warm-gray-600 mb-md">
            You don&apos;t have access to this section.
          </p>
          <Button variant="secondary" onClick={() => router.push('/admin/dashboard')}>
            Return to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar. Hidden below lg — at 375px a fixed 224px sidebar left
          roughly 100px of usable content width. */}
      <div className="hidden lg:flex">
        <AdminSidebar
          role={admin.role}
          adminName={admin.name}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile drawer */}
      {navOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-deep-blue/50 lg:hidden"
            onClick={closeNav}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            className="fixed inset-y-0 left-0 z-50 overflow-y-auto lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
          >
            <AdminSidebar
              role={admin.role}
              adminName={admin.name}
              onLogout={handleLogout}
              onNavigate={closeNav}
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar with the drawer trigger */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-xs px-md py-xs bg-deep-blue text-white">
          <button
            onClick={() => setNavOpen(true)}
            className="tap-target flex items-center justify-center rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-gold"
            aria-label="Open admin navigation"
            aria-expanded={navOpen}
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
          <span className="font-heading text-base font-semibold">
            SIAC Admin
          </span>
        </div>

        {/* Admin takes the md/lg rungs of the shared scale (24 → 32) but
            deliberately NOT `.site-px`'s 64px desktop gutter — admin is dense
            tabular data, and 128px of side padding would cost real column
            width. Same scale as the public site, two rungs lower. */}
        <div className="flex-1 p-md tabtop:p-lg bg-warm-gray-100 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

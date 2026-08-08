'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { AdminUser } from '@/types';
import { AdminSidebar } from './admin-sidebar';
import { validateAdminSession } from '@/lib/auth-client';

interface AdminLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | null;
}

export function AdminLayout({ children, requiredRole = null }: AdminLayoutProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

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
    return <div className="flex items-center justify-center min-h-screen"><p className="text-warm-gray-400">Loading...</p></div>;
  }

  if (denied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="font-heading text-xl font-medium text-deep-blue mb-2">Insufficient Permissions</h1>
          <p className="text-warm-gray-600 mb-4">You don&apos;t have access to this section.</p>
          <button onClick={() => router.push('/admin/dashboard')} className="text-ocean hover:underline font-medium">
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={admin.role} adminName={admin.name} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-warm-gray-100 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

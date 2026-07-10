'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { AdminUser } from '@/types';
import { AdminSidebar } from './admin-sidebar';
import { validateAdminSession, logoutAdmin } from '@/services/auth';

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
    const token = localStorage.getItem('admin_session');
    if (token) {
      await logoutAdmin(token);
    }
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-warm-gray-400">Loading...</p></div>;
  }

  if (denied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="font-heading text-xl font-bold text-deep-blue mb-2">Insufficient Permissions</h1>
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
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar role={admin.role} />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-sand bg-white">
          <p className="text-sm text-warm-gray-600">
            Logged in as <strong>{admin.name}</strong> ({admin.role === 'super_admin' ? 'Super Admin' : 'Editor'})
          </p>
          <button onClick={handleLogout}
            className="tap-target inline-flex items-center gap-2 px-3 py-2 text-sm text-warm-gray-600 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-md">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        <div className="flex-1 p-6 bg-warm-gray-100 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

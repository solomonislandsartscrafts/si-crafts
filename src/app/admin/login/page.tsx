'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { pageTitleClasses } from '@/components/layout/page-header';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
        <h1 className={`${pageTitleClasses} mb-6 text-center`}>Admin Login</h1>

        <LoginForm defaultAccountType="admin" />

        <p className="text-base text-warm-gray-600 mt-6 text-center">
          Are you a stockist?{' '}
          <Link href="/stockist/login" className="text-ocean hover:underline font-medium">
            Stockist login
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin } from '@/lib/auth-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginAdmin(email, password);

    if (result.success && result.sessionToken) {
      localStorage.setItem('admin_session', result.sessionToken);
      router.push('/admin/dashboard');
    } else {
      setError(result.lockedUntil
        ? 'Account temporarily locked. Try again later.'
        : result.error || 'Invalid email or password');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
        <h1 className="font-heading text-2xl font-medium text-deep-blue mb-6 text-center">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-warm-gray-800 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-warm-gray-800 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean" />
          </div>

          <button type="submit" disabled={loading}
            className="tap-target w-full flex items-center justify-center gap-2 px-6 py-3 bg-deep-blue hover:bg-deep-blue/90 disabled:opacity-50 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-warm-gray-600 mt-6 text-center">
          Are you a stockist?{' '}
          <Link href="/stockist/login" className="text-ocean hover:underline font-medium">
            Stockist login
          </Link>
        </p>
      </div>
    </div>
  );
}

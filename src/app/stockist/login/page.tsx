'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { loginStockist } from '@/services/auth';

export default function StockistLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginStockist(email, password);

    if (result.success && result.sessionToken) {
      localStorage.setItem('stockist_session', result.sessionToken);
      router.push('/stockist/catalogue');
    } else {
      setError(result.error || 'Invalid email or password');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-section-lg">
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-2">
        Stockist Login
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Log in to access wholesale pricing and place orders.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-warm-gray-800 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-warm-gray-800 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="tap-target w-full flex items-center justify-center gap-2 px-6 py-3 bg-ocean hover:bg-ocean-dark disabled:bg-ocean/50 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-warm-gray-600 mt-6 text-center">
        Not a stockist yet?{' '}
        <Link href="/stockist/apply" className="text-ocean hover:underline font-medium">
          Apply for an account
        </Link>
      </p>
    </div>
  );
}

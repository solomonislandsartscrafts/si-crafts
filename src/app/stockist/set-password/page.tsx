'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// useSearchParams needs a Suspense boundary for the page to prerender.
export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 sm:px-6 page-y text-warm-gray-600">Loading…</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 page-y text-center">
        <h1 className="font-heading text-2xl font-medium text-deep-blue mb-4">Invalid Link</h1>
        <p className="text-warm-gray-600 mb-6">
          This password setup link is invalid or missing. Please check the email you received or contact us.
        </p>
        <Link href="/contact" className="text-ocean hover:text-ocean-dark font-medium">
          Contact us
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/stockists/set-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 page-y text-center">
        <div className="bg-success/10 border border-success/20 rounded-lg p-6 mb-6">
          <h1 className="font-heading text-2xl font-medium text-deep-blue mb-2">Password Set!</h1>
          <p className="text-warm-gray-600">
            Your password has been set successfully. You can now log in to access the wholesale catalogue.
          </p>
        </div>
        <button
          onClick={() => router.push('/stockist/login')}
          className="tap-target inline-flex items-center justify-center px-6 py-3 btn-primary"
        >
          Log in now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 page-y">
      <h1 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
        Set Your Password
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Your stockist account has been approved. Choose a password to get started.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-warm-gray-800 mb-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-warm-gray-800 mb-1">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="tap-target w-full flex items-center justify-center px-6 py-3 btn-primary"
        >
          {loading ? 'Setting password...' : 'Set Password'}
        </button>
      </form>
    </div>
  );
}

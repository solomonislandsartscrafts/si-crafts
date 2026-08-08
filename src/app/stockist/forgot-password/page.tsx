'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/stockists/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong.');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 page-y text-center">
        <h1 className="font-heading text-2xl font-medium text-deep-blue mb-4">Check Your Email</h1>
        <p className="text-warm-gray-600 mb-6">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          Check your inbox (and spam folder) and follow the link to set a new password.
        </p>
        <Link href="/login" className="text-ocean hover:text-ocean-dark font-medium">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 page-y">
      <h1 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
        Forgot Password
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Enter your email address and we&apos;ll send you a link to reset your password.
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

        <button
          type="submit"
          disabled={loading}
          className="tap-target w-full flex items-center justify-center px-6 py-3 btn-primary"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-sm text-warm-gray-600 mt-6 text-center">
        <Link href="/login" className="text-ocean hover:underline font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
}

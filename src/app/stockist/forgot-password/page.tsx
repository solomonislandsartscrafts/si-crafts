'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button, ButtonLink } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SuccessPanel } from '@/components/ui/success-panel';

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
      <SuccessPanel
        icon={Mail}
        title="Check Your Email"
        description={
          <>
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            Check your inbox (and spam folder) and follow the link to set a new password.
          </>
        }
        actions={
          <ButtonLink href="/login" variant="secondary">
            Back to login
          </ButtonLink>
        }
      />
    );
  }

  return (
    <PageHeader
      title="Forgot Password"
      intro="Enter your email address and we'll send you a link to reset your password."
      width="narrow"
    >
      <div className="max-w-md mt-lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-md">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-xs" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <FormField label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClasses}
            />
          </FormField>

          <Button type="submit" fullWidth loading={loading} loadingText="Sending...">
            Send Reset Link
          </Button>
        </form>

        <p className="text-base text-warm-gray-600 mt-md text-center">
          <Link href="/login" className="text-ocean hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </PageHeader>
  );
}

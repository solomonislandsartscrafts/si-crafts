'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button, ButtonLink } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';
import { SuccessPanel } from '@/components/ui/success-panel';

// useSearchParams needs a Suspense boundary for the page to prerender.
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto site-px page-y">
          <SkeletonText lines={4} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <PageHeader
        title="Invalid Link"
        intro="This password reset link is invalid or missing. Please request a new one."
        align="center"
        width="narrow"
      >
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/stockist/forgot-password" variant="secondary">
            Request new reset link
          </ButtonLink>
        </div>
      </PageHeader>
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
        setError(data.error || 'Something went wrong.');
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
      <SuccessPanel
        title="Password Reset!"
        description="Your password has been updated. You can now log in with your new password."
        actions={
          <ButtonLink href="/stockist/login" variant="secondary">
            Log in now
          </ButtonLink>
        }
      />
    );
  }

  return (
    <PageHeader
      title="Reset Your Password"
      intro="Choose a new password for your stockist account."
      width="narrow"
    >
      <div className="max-w-md mt-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-3" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <FormField label="New Password" htmlFor="password">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              className={inputClasses}
            />
          </FormField>

          <FormField label="Confirm Password" htmlFor="confirm-password">
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClasses}
            />
          </FormField>

          <Button type="submit" fullWidth loading={loading} loadingText="Resetting...">
            Reset Password
          </Button>
        </form>
      </div>
    </PageHeader>
  );
}

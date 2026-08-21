'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

export type AccountType = 'stockist' | 'admin';

interface LoginFormProps {
  /** Show the Stockist / Admin selector. When false the form is stockist-only. */
  showAccountTypeChooser?: boolean;
  defaultAccountType?: AccountType;
}

const ENDPOINTS: Record<AccountType, string> = {
  stockist: '/api/auth/stockist/login',
  admin: '/api/auth/admin/login',
};

const DESTINATIONS: Record<AccountType, string> = {
  stockist: '/stockist/catalogue',
  admin: '/admin/dashboard',
};

const SESSION_KEYS: Record<AccountType, string> = {
  stockist: 'stockist_session',
  admin: 'admin_session',
};

export function LoginForm({
  showAccountTypeChooser = false,
  defaultAccountType = 'stockist',
}: LoginFormProps) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>(defaultAccountType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function chooseAccountType(type: AccountType) {
    setAccountType(type);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(ENDPOINTS[accountType], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await res.json();

      if (result.success && result.sessionToken) {
        // Clear the other role's session so the header and pricing gates
        // don't disagree about who is logged in.
        const otherType: AccountType = accountType === 'admin' ? 'stockist' : 'admin';
        localStorage.removeItem(SESSION_KEYS[otherType]);
        localStorage.setItem(SESSION_KEYS[accountType], result.sessionToken);
        router.push(DESTINATIONS[accountType]);
      } else {
        setError(
          result.lockedUntil
            ? 'Account temporarily locked. Try again later.'
            : result.error || 'Invalid email or password'
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  }

  const isStockist = accountType === 'stockist';

  return (
    <>
      {showAccountTypeChooser && (
        <div
          role="group"
          aria-label="Account type"
          className="flex gap-1 p-1 mb-6 bg-sand-light rounded-md"
        >
          <button
            type="button"
            onClick={() => chooseAccountType('stockist')}
            aria-pressed={isStockist}
            className={`tap-target flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
              isStockist
                ? 'bg-white text-deep-blue shadow-card'
                : 'text-warm-gray-600 hover:text-deep-blue'
            }`}
          >
            <Store className="w-4 h-4" />
            Stockist
          </button>
          <button
            type="button"
            onClick={() => chooseAccountType('admin')}
            aria-pressed={!isStockist}
            className={`tap-target flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
              !isStockist
                ? 'bg-white text-deep-blue shadow-card'
                : 'text-warm-gray-600 hover:text-deep-blue'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div
            className="bg-error/10 border border-error/20 text-error text-base rounded-md p-3"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <FormField label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClasses}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClasses}
          />
        </FormField>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Logging in..."
        >
          {isStockist ? 'Log in to wholesale' : 'Log in'}
        </Button>
      </form>

      {isStockist && (
        <>
          <p className="text-base text-warm-gray-600 mt-6 text-center">
            Not a stockist yet?{' '}
            <Link href="/stockist/apply" className="text-ocean hover:underline font-medium">
              Apply for an account
            </Link>
          </p>
          <p className="text-base text-warm-gray-600 mt-2 text-center">
            <Link href="/stockist/forgot-password" className="text-ocean hover:underline">
              Forgot your password?
            </Link>
          </p>
        </>
      )}
    </>
  );
}

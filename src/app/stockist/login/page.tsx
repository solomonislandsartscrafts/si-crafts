import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Stockist login',
  description: 'Log in to view wholesale pricing and place order requests.',
};

export default function StockistLoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 page-y">
      <h1 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
        Stockist Login
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Log in to view wholesale pricing and place orders.
      </p>

      <LoginForm defaultAccountType="stockist" />

      <p className="text-sm text-warm-gray-400 mt-8 text-center">
        Site administrator?{' '}
        <Link href="/admin/login" className="text-ocean hover:underline">
          Admin login
        </Link>
      </p>
    </div>
  );
}

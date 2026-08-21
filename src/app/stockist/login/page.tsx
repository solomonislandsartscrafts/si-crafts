import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { PageHeader } from '@/components/layout/page-header';

export const metadata = {
  title: 'Stockist login',
  description: 'Log in to view wholesale pricing and place order requests.',
};

export default function StockistLoginPage() {
  return (
    <PageHeader
      title="Stockist Login"
      intro="Log in to view wholesale pricing and place orders."
      width="narrow"
    >
      <div className="max-w-md mt-8">
        <LoginForm defaultAccountType="stockist" />

        <p className="text-base text-warm-gray-400 mt-8 text-center">
          Site administrator?{' '}
          <Link href="/admin/login" className="text-ocean hover:underline">
            Admin login
          </Link>
        </p>
      </div>
    </PageHeader>
  );
}

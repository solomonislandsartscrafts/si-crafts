import { LoginForm } from '@/components/auth/login-form';
import { PageHeader } from '@/components/layout/page-header';

export const metadata = {
  title: 'Log in',
  description: 'Stockist and admin login for Solomon Islands Arts & Crafts.',
};

export default function LoginPage() {
  return (
    <PageHeader
      title="Log in"
      intro="Choose your account type. Stockists log in to see wholesale pricing and place order requests."
      width="narrow"
    >
      <div className="max-w-md mt-lg">
        <LoginForm showAccountTypeChooser defaultAccountType="stockist" />
      </div>
    </PageHeader>
  );
}

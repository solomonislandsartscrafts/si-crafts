import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Log in',
  description: 'Stockist and admin login for Solomon Islands Arts & Crafts.',
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 page-y">
      <h1 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
        Log in
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Choose your account type. Stockists log in to see wholesale pricing and place
        order requests.
      </p>

      <LoginForm showAccountTypeChooser defaultAccountType="stockist" />
    </div>
  );
}

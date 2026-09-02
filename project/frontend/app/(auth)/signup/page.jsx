'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import SocialAuthButtons from '@/components/ui/SocialAuthButtons';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { validateEmail, validateName, validatePassword } from '@/lib/validators';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null); // { message, code }
  const [socialNotice, setSocialNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(form);
      // Fire off the email verification code, then move to the OTP screen.
      await authApi.sendVerificationOtp(form.email).catch(() => undefined);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setFormError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Introducing WizJobAI"
      subtitle="Enter your details — it only takes a minute to get started."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      {formError?.code === 'EMAIL_IN_USE' ? (
        <Alert type="info" className="mb-5">
          This email is already connected to an account.{' '}
          <Link href="/login" className="font-semibold underline underline-offset-2">
            Go to sign in
          </Link>
        </Alert>
      ) : (
        <Alert type="error" className="mb-5">
          {formError?.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Jordan Ade"
          value={form.name}
          onChange={update('name')}
          error={errors.name}
        />
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          showRules
        />
        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>
        <p className="text-center text-xs leading-relaxed text-ink-400">
          By creating an account, you agree to WizJobAI&apos;s{' '}
          <Link href="/terms" className="underline hover:text-ink-600">
            Terms and conditions
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-ink-600">
            Privacy policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-3 text-xs font-medium text-ink-400">
          <span className="h-px flex-1 bg-ink-100" />
          Or sign up with
          <span className="h-px flex-1 bg-ink-100" />
        </div>

        {socialNotice && (
          <Alert type="info">
            {socialNotice} isn&apos;t connected yet — please sign up with email above.
          </Alert>
        )}
        <SocialAuthButtons onUnavailable={setSocialNotice} />
      </form>
    </AuthLayout>
  );
}

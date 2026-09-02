'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import SocialAuthButtons from '@/components/ui/SocialAuthButtons';
import { useAuth } from '@/context/AuthContext';
import { validateEmail } from '@/lib/validators';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState('email'); // 'email' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [socialNotice, setSocialNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;
    setStep('password');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setFormError('Enter your password to continue.');
      return;
    }
    setFormError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.isOnboarded ? '/dashboard' : '/onboarding');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 'email' ? 'Sign into WizJobAI' : 'Enter Password'}
      subtitle={step === 'email' ? 'New or returning user? Authorize right here.' : email}
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </>
      }
    >
      {step === 'email' ? (
        <form onSubmit={handleContinue} className="space-y-5" noValidate>
          {socialNotice && (
            <Alert type="info">
              {socialNotice} isn&apos;t connected yet — continue with your email below.
            </Alert>
          )}

          <SocialAuthButtons onUnavailable={setSocialNotice} />

          <div className="flex items-center gap-3 text-xs font-medium text-ink-400">
            <span className="h-px flex-1 bg-ink-100" />
            Or better yet login with...
            <span className="h-px flex-1 bg-ink-100" />
          </div>

          <Input
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />

          <p className="text-center text-xs leading-relaxed text-ink-400">
            By continuing, you agree with the{' '}
            <Link href="/terms" className="font-medium underline hover:text-ink-600">
              Terms of Service
            </Link>{' '}
            and the{' '}
            <Link href="/privacy" className="font-medium underline hover:text-ink-600">
              Privacy Policy
            </Link>
            .
          </p>

          <Button type="submit" fullWidth>
            Continue with email
          </Button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-600"
          >
            <ArrowLeft size={15} /> Change email
          </button>

          <Alert type="error">{formError}</Alert>

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Continue with email
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

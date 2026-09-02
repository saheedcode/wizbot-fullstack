'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import OtpInput from '@/components/ui/OtpInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { authApi } from '@/lib/api';
import { validateOtp } from '@/lib/validators';

const RESEND_COOLDOWN = 30;

function VerifyEmailForm() {
  const router = useRouter();
  const email = useSearchParams().get('email') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const err = validateOtp(otp);
    setError(err);
    if (err) return;

    setIsLoading(true);
    try {
      await authApi.verifyEmailOtp(email, otp);
      router.push('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setInfo('');
    setError('');
    setIsResending(true);
    try {
      const res = await authApi.sendVerificationOtp(email);
      setInfo(res.meta?.devOtp ? `Code sent. Dev OTP: ${res.meta.devOtp}` : 'A new code has been sent to your email.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <>
          Wrong email?{' '}
          <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Start over
          </Link>
        </>
      }
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
          <MailCheck size={26} />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Check your email</h1>
        <p className="mt-2 text-sm text-ink-600">
          We sent a 6-digit code to <span className="font-medium text-ink-900">{email || 'your email'}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5" noValidate>
        <Alert type="error">{error}</Alert>
        <Alert type="info">{info}</Alert>

        <OtpInput value={otp} onChange={setOtp} />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Verify email
        </Button>

        <div className="text-center text-sm text-ink-600">
          Didn&apos;t get a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="font-semibold text-brand-600 hover:text-brand-700 disabled:text-ink-400"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}

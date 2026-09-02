'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import OtpInput from '@/components/ui/OtpInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { authApi } from '@/lib/api';
import { validateEmail, validateOtp, validatePassword } from '@/lib/validators';

const STEPS = { EMAIL: 'email', OTP: 'otp', RESET: 'reset', DONE: 'done' };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.EMAIL);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    setFieldError(err);
    if (err) return;

    setFormError('');
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setInfo(res.meta?.devOtp ? `Dev OTP: ${res.meta.devOtp}` : '');
      setStep(STEPS.OTP);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const err = validateOtp(otp);
    setFieldError(err);
    if (err) return;

    setFormError('');
    setIsLoading(true);
    try {
      const res = await authApi.verifyResetOtp(email, otp);
      setResetToken(res.data.resetToken);
      setStep(STEPS.RESET);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const err = validatePassword(password);
    setFieldError(err);
    if (err) return;

    setFormError('');
    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, resetToken, password });
      setStep(STEPS.DONE);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        {
          [STEPS.EMAIL]: 'Forgot password?',
          [STEPS.OTP]: 'Enter the code',
          [STEPS.RESET]: 'Set a new password',
          [STEPS.DONE]: 'Password reset',
        }[step]
      }
      subtitle={
        {
          [STEPS.EMAIL]: "No worries, we'll send you reset instructions.",
          [STEPS.OTP]: `We sent a 6-digit code to ${email}`,
          [STEPS.RESET]: 'Choose a strong password you have not used before.',
          [STEPS.DONE]: 'You can now sign in with your new password.',
        }[step]
      }
      footer={
        step !== STEPS.DONE && (
          <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-ink-600 hover:text-brand-600">
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        )
      }
    >
      <Alert type="error" className="mb-5">
        {formError}
      </Alert>
      {info && step === STEPS.OTP && (
        <Alert type="info" className="mb-5">
          {info}
        </Alert>
      )}

      {step === STEPS.EMAIL && (
        <form onSubmit={handleSendCode} className="space-y-5" noValidate>
          <Input
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError}
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Send reset code
          </Button>
        </form>
      )}

      {step === STEPS.OTP && (
        <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
          <OtpInput value={otp} onChange={setOtp} error={fieldError} />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Verify code
          </Button>
        </form>
      )}

      {step === STEPS.RESET && (
        <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
          <PasswordInput
            label="New password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldError}
            showRules
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Reset password
          </Button>
        </form>
      )}

      {step === STEPS.DONE && (
        <Button fullWidth onClick={() => router.push('/login')}>
          Continue to sign in
        </Button>
      )}
    </AuthLayout>
  );
}

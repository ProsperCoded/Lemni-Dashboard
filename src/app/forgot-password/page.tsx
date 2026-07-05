'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { authApi, ApiError } from '@/lib/api-client';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setStep('otp');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to send verification code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyResetOtp(email, code);
      setResetToken(response.token);
      setStep('reset');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Invalid or expired code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!resetToken) throw new Error('No reset token');
      await authApi.resetPasswordWithToken(resetToken, newPassword);
      setStep('done');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to reset password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      {/* Header bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-card-border">
        <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Back Home</span>
        </Link>
      </header>

      {/* Main card section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-card-bg border border-card-border rounded-xl shadow-lg p-8">

          {/* Logo element */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold select-none" style={{ color: "#2DCA73" }}>
                ∞
              </span>
              <span className="font-cursive text-3xl font-bold tracking-wide">
                Lemni
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
              Reset Password
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{error}</p>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send Code"
                )}
              </button>

              <div className="text-center text-xs text-muted">
                <Link href="/login" className="font-semibold text-accent hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-lg text-sm text-center font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
                <p className="text-xs text-muted mt-2">Check your email for the 6-digit code</p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center text-xs text-muted">
                <button
                  type="button"
                  onClick={() => {
                    setCode('');
                    setStep('email');
                  }}
                  className="font-semibold text-accent hover:underline"
                >
                  Use Different Email
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Step */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {/* Done Step */}
          {step === 'done' && (
            <div className="space-y-5 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-success-bg border border-success-border rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Password Reset Successful</h3>
                <p className="text-xs text-muted">Your password has been updated successfully.</p>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

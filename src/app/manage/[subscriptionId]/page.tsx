'use client';

import React, { useState, use } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import { checkoutApi, ApiError } from '@/lib/api-client';

type Tab = 'cancel' | 'update-card';
type CancelStep = 'email' | 'otp' | 'confirmed';

export default function ManageSubscriptionPage({ params }: { params: Promise<{ subscriptionId: string }> }) {
  const { subscriptionId } = use(params);
  const [tab, setTab] = useState<Tab>('cancel');

  // Shared email state
  const [email, setEmail] = useState('');

  // Cancel flow state
  const [cancelStep, setCancelStep] = useState<CancelStep>('email');
  const [code, setCode] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Update payment method state
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const handleTabSwitch = (newTab: Tab) => {
    setTab(newTab);
    setEmail('');
    setCancelStep('email');
    setCode('');
    setCancelError(null);
    setUpdateError(null);
  };

  const handleUnsubscribeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelLoading(true);
    setCancelError(null);
    try {
      await checkoutApi.unsubscribeRequest(subscriptionId, email);
      setCancelStep('otp');
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : 'Failed to send verification code');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUnsubscribeConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelLoading(true);
    setCancelError(null);
    try {
      await checkoutApi.unsubscribeConfirm(subscriptionId, code);
      setCancelStep('confirmed');
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : 'Invalid or expired code');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const result = await checkoutApi.updatePaymentMethod(subscriptionId, email);
      setRedirecting(true);
      window.location.href = result.checkoutUrl;
    } catch (err) {
      if (err instanceof ApiError && err.status === 502) {
        setUpdateError('Something went wrong, please try again.');
      } else {
        setUpdateError(err instanceof ApiError ? err.message : 'Failed to update payment method');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  if (redirecting) {
    return (
      <PublicPageShell>
        <div className="text-center py-8">
          <span className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4 block" />
          <h1 className="text-lg font-bold mb-1 text-foreground">Redirecting to secure payment...</h1>
          <p className="text-xs text-muted">Please wait, you&apos;ll be redirected to update your card.</p>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 tracking-tight">Manage Subscription</h1>
        <p className="text-xs text-muted font-medium">Cancel your subscription or update your payment method.</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => handleTabSwitch('cancel')}
          className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'cancel'
              ? 'bg-white text-foreground border border-card-border shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
              : 'text-muted border border-transparent hover:bg-muted-bg'
          }`}
        >
          Cancel Subscription
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('update-card')}
          className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'update-card'
              ? 'bg-white text-foreground border border-card-border shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
              : 'text-muted border border-transparent hover:bg-muted-bg'
          }`}
        >
          Update Payment Method
        </button>
      </div>

      {/* Cancel Subscription Tab */}
      {tab === 'cancel' && (
        <>
          {cancelError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{cancelError}</p>
            </div>
          )}

          {cancelStep === 'email' && (
            <form onSubmit={handleUnsubscribeRequest} className="space-y-5">
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
                disabled={cancelLoading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {cancelLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          )}

          {cancelStep === 'otp' && (
            <form onSubmit={handleUnsubscribeConfirm} className="space-y-5">
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
                disabled={cancelLoading || code.length !== 6}
                className="w-full py-2.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {cancelLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </form>
          )}

          {cancelStep === 'confirmed' && (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-success-bg border border-success-border rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Subscription Canceled</h3>
                <p className="text-xs text-muted">Your subscription has been canceled successfully.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Update Payment Method Tab */}
      {tab === 'update-card' && (
        <>
          {updateError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{updateError}</p>
            </div>
          )}

          <form onSubmit={handleUpdatePaymentMethod} className="space-y-5">
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
              disabled={updateLoading}
              className="w-full py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {updateLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Update Card
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </PublicPageShell>
  );
}

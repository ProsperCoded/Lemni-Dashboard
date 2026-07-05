'use client';

import React, { useState, useEffect, use } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import { checkoutApi, ApiError } from '@/lib/api-client';

interface PlanDetails {
  name: string;
  amount: number;
  billingModel: string;
  interval: string | null;
  trialDays: number;
}

type PageStatus = 'loading' | 'form' | 'submitting' | 'redirecting' | 'error';

export default function CheckoutPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await checkoutApi.getPlanDetails(planId);
        setPlan(data);
        setStatus('form');
      } catch (err) {
        setErrorMessage(err instanceof ApiError ? err.message : 'This checkout link is no longer valid.');
        setStatus('error');
      }
    };

    loadPlan();
  }, [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const result = await checkoutApi.publicPlanCheckout(planId, { email });
      setStatus('redirecting');
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setStatus('form');
    }
  };

  const formatPrice = (val: number) => `₦${val.toLocaleString('en-NG')}`;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans text-foreground">
        <span className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-muted tracking-widest uppercase">Loading checkout...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <PublicPageShell>
        <div className="text-center py-8">
          <h1 className="text-xl font-bold mb-2 text-foreground">Checkout Unavailable</h1>
          <p className="text-sm text-muted">{errorMessage}</p>
        </div>
      </PublicPageShell>
    );
  }

  if (status === 'redirecting') {
    return (
      <PublicPageShell>
        <div className="text-center py-8">
          <span className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4 block" />
          <h1 className="text-lg font-bold mb-1 text-foreground">Redirecting to secure payment...</h1>
          <p className="text-xs text-muted">Please wait, you&apos;ll be redirected to complete your payment.</p>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>
      {/* Checkout Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 tracking-tight">Complete Your Subscription</h1>
        <p className="text-xs text-muted font-medium">Enter your email to proceed to secure payment.</p>
      </div>

      {/* Plan Summary */}
      {plan && (
        <div className="space-y-2 mb-8">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Subscription Summary</div>
          <div className="bg-muted-bg border border-card-border p-4 rounded-xl space-y-1">
            <div className="flex justify-between items-start">
              <div className="pr-2">
                <div className="text-sm font-bold text-foreground">{plan.name}</div>
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="text-base font-extrabold text-foreground">{formatPrice(plan.amount)}</div>
                {plan.billingModel === 'recurring' && plan.interval && (
                  <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
                    / {plan.interval}
                  </div>
                )}
              </div>
            </div>
            {plan.trialDays > 0 && (
              <p className="text-[10px] text-success font-semibold mt-2">
                {plan.trialDays}-day free trial included
              </p>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <p className="text-xs font-semibold text-rose-500">{errorMessage}</p>
        </div>
      )}

      {/* Email form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
          disabled={status === 'submitting'}
          className="w-full py-3.5 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === 'submitting' ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </PublicPageShell>
  );
}

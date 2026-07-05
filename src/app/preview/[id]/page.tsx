'use client';

import React, { useState, useEffect, use } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import { checkoutApi, ApiError } from '@/lib/api-client';

interface PlanDetails {
  name: string;
  amount: number;
  billingModel: string;
  interval: string | null;
  trialDays: number;
}

export default function PreviewCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await checkoutApi.getPlanDetails(id);
        setPlan(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Plan not found');
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [id]);

  const formatPrice = (val: number) => `₦${val.toLocaleString('en-NG')}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans text-foreground">
        <span className="text-5xl font-extrabold animate-pulse mb-4" style={{ color: "#2DCA73" }}>∞</span>
        <p className="text-xs font-bold text-muted tracking-widest uppercase">Initializing Lemni Checkout...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <PublicPageShell>
        <div className="text-center py-8">
          <h1 className="text-xl font-bold mb-2 text-foreground">Plan Not Found</h1>
          <p className="text-sm text-muted">{error}</p>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      headerRight={
        <button
          onClick={() => window.close()}
          className="text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-transparent hover:border-card-border hover:bg-muted-bg"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Close Preview
        </button>
      }
    >
      {/* Checkout Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 tracking-tight">Lemni Checkout Preview</h1>
        <p className="text-xs text-muted font-medium">This is a merchant-only preview of your live checkout page.</p>
      </div>

      {/* Subscription Summary */}
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

      {/* Input form mockup */}
      <div className="space-y-4 mb-8">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Card Details</div>
        <div className="border border-card-border rounded-xl p-1 shadow-sm bg-background">
          <input
            type="text"
            placeholder="0000 0000 0000 0000"
            className="w-full bg-transparent text-sm border-0 p-3 focus:ring-0 placeholder:text-muted/50 font-medium outline-none"
          />
          <div className="flex border-t border-card-border">
            <input
              type="text"
              placeholder="MM/YY"
              className="w-1/2 bg-transparent text-sm border-0 p-3 focus:ring-0 placeholder:text-muted/50 font-medium outline-none border-r border-card-border"
            />
            <input
              type="text"
              placeholder="CVC"
              className="w-1/2 bg-transparent text-sm border-0 p-3 focus:ring-0 placeholder:text-muted/50 font-medium outline-none pl-4"
            />
          </div>
        </div>
      </div>

      {/* Submit button mock */}
      <div className="space-y-4 mt-10">
        <button
          type="button"
          onClick={() => alert('This is a simulated Lemni checkout layer! Real customers see the /checkout/[planId] page instead.')}
          className="w-full py-3.5 text-sm font-bold text-white bg-[#12B76A] hover:bg-[#0e9f5d] rounded-xl transition-all hover:shadow-lg hover:shadow-[#12B76A]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          Subscribe Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </PublicPageShell>
  );
}

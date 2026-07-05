'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PreviewCheckoutPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading plan data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans text-foreground">
        <span className="text-5xl font-extrabold animate-pulse mb-4" style={{ color: "#2DCA73" }}>∞</span>
        <p className="text-xs font-bold text-muted tracking-widest uppercase">Initializing Lemni Checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold" style={{ color: "#2DCA73" }}>∞</span>
          <span className="font-cursive text-2xl font-bold tracking-wide">Lemni</span>
        </div>
        <button onClick={() => window.close()} className="text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-transparent hover:border-card-border hover:bg-muted-bg">
          <ArrowLeft className="w-3.5 h-3.5" /> Close Preview
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px] bg-card-bg border border-card-border rounded-[1.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] p-8 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DCA73]/10 rounded-bl-full -z-10 blur-xl" />

          {/* Checkout Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Lemni Checkout</h1>
            <p className="text-xs text-muted font-medium">Complete your subscription securely.</p>
          </div>

          {/* Subscription Summary */}
          <div className="space-y-2 mb-8">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Subscription Summary</div>
            <div className="bg-muted-bg border border-card-border p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-start">
                <div className="pr-2">
                  <div className="text-sm font-bold text-foreground">Premium Membership</div>
                  <div className="text-[10px] text-muted font-medium mt-1 leading-relaxed">Full 24/7 access, trainer consulting, and spa perks.</div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="text-base font-extrabold text-foreground">₦12,500</div>
                  <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">/ Monthly</div>
                </div>
              </div>
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
              onClick={() => alert('This is a simulated Lemni checkout layer!')}
              className="w-full py-3.5 text-sm font-bold text-white bg-[#12B76A] hover:bg-[#0e9f5d] rounded-xl transition-all hover:shadow-lg hover:shadow-[#12B76A]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              Subscribe Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2DCA73]" />
              Secure checkout layer by Lemni
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

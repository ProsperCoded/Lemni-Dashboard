'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PublicPageShellProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  maxWidth?: string;
}

export default function PublicPageShell({ children, headerRight, maxWidth = '420px' }: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold" style={{ color: "#2DCA73" }}>∞</span>
          <span className="font-cursive text-2xl font-bold tracking-wide">Lemni</span>
        </div>
        {headerRight}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full bg-card-bg border border-card-border rounded-[1.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] p-8 relative overflow-hidden"
          style={{ maxWidth }}
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DCA73]/10 rounded-bl-full -z-10 blur-xl" />

          {children}

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted mt-8">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2DCA73]" />
            Secure checkout layer by Lemni
          </div>
        </div>
      </main>
    </div>
  );
}

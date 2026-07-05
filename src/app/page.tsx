'use client';

import React from "react";
import Link from "next/link";
import { CreditCard, RefreshCw, Activity } from "lucide-react";
import GradientCanvas from "@/components/GradientCanvas";

import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Header / Nav */}
      <header className="absolute top-0 left-0 w-full px-6 md:px-12 lg:px-16 py-6 flex items-center justify-between no-print bg-transparent z-[100]">
        <div className="flex items-center gap-3">
          {/* Infinity Symbol Logo in #2DCA73 */}
          <span 
            className="text-3xl font-extrabold select-none transition-transform hover:scale-110 duration-200" 
            style={{ color: "#2DCA73" }}
          >
            ∞
          </span>
          <span className="font-cursive text-3xl tracking-wide select-none font-bold">
            Lemni
          </span>
        </div>

        {/* Empty Nav Area (Removed Features, Nomba Bridge, and Pricing links) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-semibold bg-white text-black border border-card-border rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>
          
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-[#12B76A] hover:bg-[#0e9f5d] rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="relative flex-1 flex flex-col lg:flex-row items-center h-[calc(100vh-64px)] overflow-hidden max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-16 pt-24">
        
        {/* Left Column / Hero Text (65% Width) */}
        <div className="w-full lg:w-[65%] py-8 z-10 flex flex-col justify-center h-full order-1 lg:order-none">
          <p className="text-[28px] sm:text-[36px] md:text-[40px] leading-[1.2] tracking-tight mb-10 max-w-2xl pr-4">
            <span className="text-[#0A2540] font-medium">Billing infrastructure to scale your subscription revenue.</span>{" "}
            <span className="text-[#425466] font-medium">Automate revenue recovery and deploy flexible billing plans.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-[#12B76A] hover:bg-[#0e9f5d] rounded-lg transition-all shadow-md shadow-[#12B76A]/10 cursor-pointer w-fit"
            >
              Enter Merchant Dashboard
            </Link>
            
            <Link
              href="/login"
              className="flex items-center justify-center px-6 py-3.5 text-sm font-semibold bg-white text-black border border-card-border rounded-lg hover:bg-gray-100 transition-colors w-fit"
            >
              Sign In to Lemni
            </Link>
          </div>
        </div>

        {/* Right Column (or Bottom on Mobile) / Infinity 3D Text Mask (35% Width) */}
        <div className="w-full lg:w-[35%] h-[40vh] lg:h-full relative flex items-center justify-center overflow-hidden z-0 order-2 lg:order-none lg:-translate-x-12">
          
          {/* The WebGL Canvas */}
          <div className="absolute inset-0 w-full h-full scale-125">
            <GradientCanvas />
          </div>

          {/* CSS Mix-Blend Cutout Mask (White background, transparent infinity symbol) */}
          <div className="absolute inset-0 bg-background text-black mix-blend-screen flex items-center justify-center pointer-events-none select-none">
            <span className="text-[15rem] sm:text-[18rem] md:text-[22rem] lg:text-[28rem] leading-none font-black tracking-tighter pb-10">
              ∞
            </span>
          </div>

        </div>

        {/* Bottom Right "Powered by Nomba" Capsule */}
        <div className="absolute bottom-8 right-8 z-20 hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-card-border/50 bg-white/80 backdrop-blur-md shadow-lg text-[10px] font-bold tracking-wider uppercase text-muted">
          <Image src="/nomba_logo.png" alt="Nomba" width={16} height={16} className="object-contain" />
          Powered by Nomba
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  ArrowRight, 
  ChevronRight, 
  Play, 
  PenLine, 
  FileText, 
  Check, 
  Menu, 
  X 
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function AssistHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full bg-white text-neutral-900 overflow-hidden font-sans select-none antialiased">
      {/* ── Background Ambient Aura (Radial Sky & Electric Blue Spotlights) ── */}
      <div className="absolute inset-0 pointer-events-none select-none -z-10 overflow-hidden">
        {/* Sky spotlight top-center/right */}
        <div className="absolute top-[8%] left-[45%] w-[540px] h-[540px] bg-[#60B1FF]/20 rounded-full blur-[110px]" />
        {/* Electric blue ambient aura behind right column */}
        <div className="absolute top-[26%] right-[10%] w-[480px] h-[480px] bg-[#319AFF]/20 rounded-full blur-[120px]" />
        {/* Soft fill on left copy */}
        <div className="absolute top-[18%] left-[8%] w-[400px] h-[400px] bg-[#60B1FF]/15 rounded-full blur-[100px]" />
      </div>

      {/* ── Section A: Floating Liquid-Glass Navigation Bar ── */}
      <div className="fixed top-[20px] sm:top-[28px] left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="w-full max-w-[1280px] h-12 rounded-[16px] pointer-events-auto transition-all duration-300 bg-white/75 backdrop-blur-[24px] border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] px-4 sm:px-6 py-2 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Logo (Fustat ExtraBold) */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Bot className="w-6 h-6 text-[#0084FF] transition-transform group-hover:scale-110" />
            <span className="font-['Fustat',sans-serif] font-extrabold text-[22px] tracking-tight text-black">
              Assist.
            </span>
          </Link>

          {/* Desktop Inter Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[14px] font-medium text-black/60 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/programs" className="text-[14px] font-medium text-black/60 hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/personnel" className="text-[14px] font-medium text-black/60 hover:text-black transition-colors">
              Company
            </Link>
            <Link href="/news" className="text-[14px] font-medium text-black/60 hover:text-black transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Call-to-Action Pill, Language Switcher & Mobile Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="border border-black/10 rounded-lg px-0.5 py-0.5 bg-black/5">
              <LanguageSwitcher className="text-black hover:text-black" />
            </div>

            <Link
              href="/programs"
              className="group h-9 px-4 sm:px-5 rounded-[12px] bg-black/5 hover:bg-black/10 border border-black/10 text-[13px] sm:text-[14px] font-semibold flex items-center gap-1.5 sm:gap-2 text-black transition-all hover:shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-black/70 hover:text-black hover:bg-black/5 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile Sliding Drawer ── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed top-0 right-0 bottom-0 w-[260px] bg-white/95 backdrop-blur-[40px] border-l border-black/10 p-6 flex flex-col gap-6 shadow-2xl pt-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 text-left">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-neutral-900 hover:text-[#0084FF] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/programs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-neutral-600 hover:text-[#0084FF] transition-colors"
              >
                Features
              </Link>
              <Link
                href="/personnel"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-neutral-600 hover:text-[#0084FF] transition-colors"
              >
                Company
              </Link>
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-neutral-600 hover:text-[#0084FF] transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Dual Column Hero Grid ── */}
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-20 pt-[80px] md:pt-[80px] pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ── Section B: Left Column (Copy, Social Proof & CTAs) ── */}
          <div className="lg:col-span-5 flex flex-col justify-center items-start text-left max-w-[620px] lg:pr-6">
            
            {/* Social Proof Badge with Layered Avatars */}
            <div className="px-3 py-1.5 rounded-full bg-black/5 border border-black/5 flex items-center gap-3 w-fit shadow-xs hover:bg-black/[0.07] transition-all">
              <div className="flex -space-x-2 select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
                  alt="User 1"
                  className="w-6 h-6 rounded-full border-1.5 border-white object-cover shadow-xs"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                  alt="User 2"
                  className="w-6 h-6 rounded-full border-1.5 border-white object-cover shadow-xs"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
                  alt="User 3"
                  className="w-6 h-6 rounded-full border-1.5 border-white object-cover shadow-xs"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"
                  alt="User 4"
                  className="w-6 h-6 rounded-full border-1.5 border-white object-cover shadow-xs"
                />
              </div>
              <span className="text-[12px] text-black/80 font-normal">
                Trusted by <strong className="font-bold text-[#171717]">10,000+ users</strong> worldwide
              </span>
            </div>

            {/* Main Display Heading (Outfit Black) */}
            <h1 className="font-['Outfit',sans-serif] font-black text-[36px] sm:text-[44px] lg:text-[60px] leading-[1.08] tracking-[-3px] mt-6 select-none text-black">
              Your All in One <br />
              <span className="text-black">Assist.</span>
            </h1>

            {/* Body Paragraph (Inter Regular) */}
            <p className="text-[18px] text-black/60 tracking-[-0.5px] leading-relaxed mt-5 max-w-[480px]">
              Ask questions, get answers, automate tasks, and boost your productivity with the power of AI.
            </p>

            {/* Button Container */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {/* Primary Button ("Try Assist.") */}
              <Link
                href="/programs"
                className="group relative pl-6 pr-2 py-2 rounded-[16px] flex items-center gap-4 text-sm font-bold bg-[#0084FF] hover:bg-[#0074E0] text-white transition-all w-fit active:scale-98 hover:scale-[1.02]"
                style={{
                  boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.35), 0 10px 25px -5px rgba(0, 132, 255, 0.25)"
                }}
              >
                <span>Try Assist.</span>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0084FF] shadow-xs group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </Link>

              {/* Watch Demo Link */}
              <button
                type="button"
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => {
                  const videoEl = document.getElementById("assist-hero-video") as HTMLVideoElement | null;
                  if (videoEl) {
                    videoEl.currentTime = 0;
                    videoEl.play().catch(() => {});
                  }
                }}
              >
                <span className="w-9 h-9 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center border border-blue-100 transition-colors shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-[#0084FF] text-[#0084FF] ml-0.5" />
                </span>
                <span className="text-[14px] font-bold text-[#0084FF] group-hover:text-[#0074E0] transition-colors">
                  Watch Demo
                </span>
              </button>
            </div>

          </div>

          {/* ── Section C: Right Column (Robot Companion Video & Floating Badges) ── */}
          <div className="lg:col-span-7 relative w-full flex items-center justify-center lg:justify-end py-6 sm:py-10">
            
            {/* Decorative Orbit Aura Background */}
            <div className="absolute top-[30%] left-[20%] w-[420px] h-[420px] bg-sky-400/15 rounded-full blur-[110px] -z-10 animate-pulse pointer-events-none" />

            {/* Orbit Concentric Thin Lines Blueprint */}
            <div className="absolute w-[360px] sm:w-[500px] lg:w-[620px] h-[360px] sm:h-[500px] lg:h-[620px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] -z-10 opacity-35 pointer-events-none">
              <svg viewBox="0 0 600 600" fill="none" className="w-full h-full">
                <circle cx="300" cy="300" r="280" stroke="url(#skyGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
                <circle cx="300" cy="300" r="220" stroke="url(#electricGrad)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="300" cy="300" r="160" stroke="#319AFF" strokeWidth="0.75" strokeOpacity="0.3" />
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60B1FF" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#319AFF" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="electricGrad" x1="600" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0084FF" stopOpacity="0.7" />
                    <stop offset="1" stopColor="#60B1FF" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Central Video Container */}
            <div className="relative w-full max-w-[560px] rounded-[24px] overflow-hidden select-none">
              <video
                id="assist-hero-video"
                src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_robo_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                className="w-full h-auto rounded-[24px] block select-none"
                style={{
                  filter: "brightness(1.02) contrast(1.04)"
                }}
              />
            </div>

            {/* ── Dynamic Floating Badges (Custom Liquid-Glass Panels) ── */}

            {/* 1. "Write an email" Badge (Top Right) */}
            <div 
              className="absolute top-[10%] sm:top-[16%] -right-2 sm:-right-6 md:-right-10 z-20 animate-float-email"
            >
              <div 
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-[20px] flex items-center gap-3 bg-gradient-to-br from-white/85 to-white/55 backdrop-blur-[20px] border border-white/80 ring-1 ring-black/5 shadow-[0_12px_32px_-4px_rgba(0,132,255,0.18)] hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer"
                style={{
                  boxShadow: "inset 0 2.5px 4px rgba(255,255,255,0.8), 0 12px 32px -4px rgba(0,132,255,0.14)"
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0084FF] to-[#0066CC] flex items-center justify-center shadow-[0_4px_12px_rgba(0,132,255,0.3)] shrink-0">
                  <PenLine className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-sans font-black text-[13px] text-neutral-900 tracking-tight">
                    Write an email
                  </span>
                  <span className="font-sans font-semibold text-[10px] text-neutral-500 mt-0.5">
                    for meeting
                  </span>
                </div>
              </div>
            </div>

            {/* 2. "Summarize document" Badge (Center Left) */}
            <div 
              className="absolute top-[46%] sm:top-[48%] -left-3 sm:-left-8 md:-left-12 z-20 animate-float-summarize"
            >
              <div 
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-[20px] flex items-center gap-3 bg-gradient-to-br from-white/85 to-white/55 backdrop-blur-[20px] border border-white/80 ring-1 ring-black/5 shadow-[0_12px_32px_-4px_rgba(16,185,129,0.18)] hover:scale-105 hover:-rotate-1 transition-all duration-300 cursor-pointer"
                style={{
                  boxShadow: "inset 0 2.5px 4px rgba(255,255,255,0.8), 0 12px 32px -4px rgba(16,185,129,0.14)"
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)] shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-sans font-black text-[13px] text-neutral-900 tracking-tight">
                    Summarize
                  </span>
                  <span className="font-sans font-semibold text-[10px] text-neutral-500 mt-0.5">
                    this document
                  </span>
                </div>
              </div>
            </div>

            {/* 3. "Create a to-do list" Badge (Bottom Right) */}
            <div 
              className="absolute bottom-[14%] sm:bottom-[16%] -right-2 sm:-right-4 md:-right-8 z-20 animate-float-todo"
            >
              <div 
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-[20px] flex items-center gap-3 bg-gradient-to-br from-white/85 to-white/55 backdrop-blur-[20px] border border-white/80 ring-1 ring-black/5 shadow-[0_12px_32px_-4px_rgba(147,51,234,0.18)] hover:scale-105 hover:rotate-1.5 transition-all duration-300 cursor-pointer"
                style={{
                  boxShadow: "inset 0 2.5px 4px rgba(255,255,255,0.8), 0 12px 32px -4px rgba(147,51,234,0.14)"
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9333EA] to-[#7E22CE] flex items-center justify-center shadow-[0_4px_12px_rgba(147,51,234,0.3)] shrink-0">
                  <Check className="w-4 h-4 text-white stroke-[3px]" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-sans font-black text-[13px] text-neutral-900 tracking-tight">
                    Create a to-do list
                  </span>
                  <span className="font-sans font-semibold text-[10px] text-neutral-500 mt-0.5">
                    for today
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

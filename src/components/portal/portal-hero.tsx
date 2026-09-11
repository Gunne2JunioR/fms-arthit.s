"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Cpu,
  Zap,
  Globe2,
  Sparkles,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortalHeroProps {
  facultyTitle: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  exploreProgramsLabel: string;
  allNewsLabel: string;
  badgeNewLabel: string;
  liveStatusLabel: string;
  gradSuccessLabel: string;
  chipAiLabel: string;
  chipBizLabel: string;
  chipCloudLabel: string;
  scriptTag?: string;
  getStartedLabel?: string;
  heroCallLabel?: string;
  heroPhone?: string;
  heroAddress?: string;
  videoBgUrl?: string;
  imageBgUrl?: string;
  metrics: {
    bachelorCount: string;
    bachelorLabel: string;
    studentsCount: string;
    studentsLabel: string;
    facultyCount: string;
    facultyLabel: string;
    employmentRate: string;
    employmentLabel: string;
  };
}

export function PortalHero({
  facultyTitle,
  heroTitle1,
  heroTitle2,
  heroDesc,
  exploreProgramsLabel,
  allNewsLabel,
  badgeNewLabel,
  liveStatusLabel,
  gradSuccessLabel,
  chipAiLabel,
  chipBizLabel,
  chipCloudLabel,
  scriptTag = "We are Creative",
  getStartedLabel = "Get Started",
  heroCallLabel = "สอบถามข้อมูลเพิ่มเติม",
  heroPhone = "+66 2 878 787 1234",
  heroAddress = "อาคารคณะการจัดการและเทคโนโลยีสารสนเทศ วิทยาเขตหลัก",
  imageBgUrl = "/images/hero/hero-people.png",
  metrics,
}: PortalHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseOffset({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
  }, []);

  const parallaxX = mouseOffset.x * 12;
  const parallaxY = mouseOffset.y * 10;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-22 transition-colors"
    >
      {/* Subtle Ambient Background Mesh */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] sm:w-[980px] h-[520px] rounded-full opacity-25 dark:opacity-20 blur-3xl transition-transform duration-700 ease-out"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--brand) 0%, var(--brand2, var(--brand-light)) 40%, transparent 70%)",
          transform: `translate3d(calc(-50% + ${parallaxX * 1.5}px), ${parallaxY * 1.5}px, 0)`,
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-24 w-88 h-88 rounded-full opacity-20 dark:opacity-15 blur-3xl transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, var(--brand-light) 0%, transparent 70%)",
          transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* ══════ 2-Column Clean Hero: Typography Left, Concentric Radial Illustration Right ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[500px]">
          
          {/* ──── Left Column: Text, Script Tag, and Call-to-Action ──── */}
          <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
            {/* Faculty Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--glass)] border border-[var(--glass-border)] shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-[var(--brand-ink)] tracking-tight">
                {badgeNewLabel}
              </span>
              <span className="text-muted-foreground/30 hidden sm:inline">•</span>
              <span className="text-[11px] text-[var(--text-2)] hidden sm:inline">
                {facultyTitle}
              </span>
            </div>

            {/* Handwritten Script Tag: "We are Creative" (from reference image) */}
            <div className="pt-1">
              <span className="font-creative text-3xl sm:text-4xl lg:text-5xl text-[var(--brand)] dark:text-[var(--brand-light)] font-normal tracking-wide inline-block transform -rotate-1 select-none">
                {scriptTag}
              </span>
            </div>

            {/* Large Bold Headline (2 Lines, e.g. "Digital Marketing / Agency") */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text)] leading-[1.12]">
              {heroTitle1}{" "}
              <span className="bg-gradient-to-r from-[var(--brand)] via-[var(--brand-light)] to-[var(--brand2,var(--brand-light))] bg-clip-text text-transparent block sm:inline">
                {heroTitle2}
              </span>
            </h1>

            {/* Subtitle / Description Paragraph */}
            <p className="text-base sm:text-lg text-[var(--text-2)] max-w-xl leading-relaxed">
              {heroDesc}
            </p>

            {/* Action Buttons: Clean Rounded-Full "Get Started" as in Reference Image */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-[var(--on-brand)] font-semibold shadow-lg shadow-[var(--brand)]/20 transition-all hover:scale-[1.03] active:scale-[0.98] border border-[var(--brand-light)]/30"
              >
                <Link href="/programs">
                  <span>{getStartedLabel || exploreProgramsLabel}</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 rounded-full bg-[var(--glass)] border-[var(--glass-border)] text-[var(--text)] hover:bg-[var(--glass-hover)] backdrop-blur-md shadow-xs transition-all hover:scale-[1.02]"
              >
                <Link href="/news">
                  <span>{allNewsLabel}</span>
                </Link>
              </Button>
            </div>

            {/* Specialization Tags / Tech Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-2)]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-xs">
                <Cpu className="h-3.5 w-3.5 text-[var(--brand)]" />
                <span>{chipAiLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-xs">
                <Zap className="h-3.5 w-3.5 text-[var(--brand-light)]" />
                <span>{chipBizLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-xs">
                <Globe2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{chipCloudLabel}</span>
              </span>
            </div>
          </div>

          {/* ──── Right Column: Concentric Circles, Layered Geometric Shapes, and Person Cutout ──── */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-1 lg:order-2">
            <div
              className="relative w-full aspect-[1/1] max-w-[480px] sm:max-w-[520px] flex items-center justify-center transition-transform duration-500 ease-out will-change-transform"
              style={{
                transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
              }}
            >
              {/* 1. Concentric Thin Ripple Circles (from Reference Image) */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate3d(${-parallaxX * 0.4}px, ${-parallaxY * 0.4}px, 0)`,
                }}
              >
                <div className="w-[100%] h-[100%] rounded-full border border-[var(--brand-light)]/20 dark:border-white/10 absolute animate-pulse duration-1000" />
                <div className="w-[88%] h-[88%] rounded-full border border-[var(--brand-light)]/25 dark:border-white/12 absolute" />
                <div className="w-[76%] h-[76%] rounded-full border border-[var(--brand-light)]/30 dark:border-white/15 absolute" />
                <div className="w-[64%] h-[64%] rounded-full border border-[var(--brand-light)]/35 dark:border-white/20 absolute" />
                <div className="w-[52%] h-[52%] rounded-full border border-[var(--brand-light)]/40 dark:border-white/25 absolute" />
                <div className="w-[40%] h-[40%] rounded-full border border-[var(--brand-light)]/45 dark:border-white/30 absolute" />
              </div>

              {/* 2. Abstract Geometric Rounded Backdrop Shapes (Warm Gold & Brand Color) */}
              {/* Yellow / Golden-Orange Rounded Pill Shape (Slanted behind person) */}
              <div
                className="absolute w-36 sm:w-44 h-72 sm:h-84 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 dark:from-amber-600 dark:to-yellow-500 shadow-xl opacity-95 transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(35deg) translate3d(24px, -18px, 0)`,
                }}
              />

              {/* Blue / Brand Vibrant Rounded Shape (Contrast layer) */}
              <div
                className="absolute w-32 sm:w-38 h-60 sm:h-72 rounded-full bg-[var(--brand)] shadow-2xl opacity-95 transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(35deg) translate3d(-20px, 32px, 0)`,
                }}
              />

              {/* 3. Professional Person Standing / Cutout (Sharp, Clean Overlay) */}
              <div className="relative z-10 w-[78%] h-[92%] flex items-end justify-center overflow-visible select-none pointer-events-none drop-shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageBgUrl}
                  alt="Faculty Academic Leader"
                  className="w-full h-full object-contain object-bottom filter contrast-105 transform hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* 4. Floating Satellites & Badges (Liyon Glassmorphic Pill Satellites) */}
              {/* Top Floating Graduation / Success Badge */}
              <div
                className="absolute top-4 -left-2 sm:left-2 px-3.5 py-2 rounded-2xl bg-[var(--glass-strong)] border border-[var(--glass-border)] backdrop-blur-xl shadow-xl flex items-center gap-2.5 z-20 transition-transform duration-500 ease-out"
                style={{
                  transform: `translate3d(${-parallaxX * 0.8}px, ${-parallaxY * 0.8}px, 0)`,
                }}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    {gradSuccessLabel}
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold text-[var(--text)]">
                    {metrics.employmentRate}
                  </p>
                </div>
              </div>

              {/* Bottom Floating 24/7 Status Badge */}
              <div
                className="absolute bottom-4 -right-2 sm:right-2 px-3.5 py-2 rounded-2xl bg-[var(--glass-strong)] border border-[var(--glass-border)] backdrop-blur-xl shadow-xl flex items-center gap-2.5 z-20 transition-transform duration-500 ease-out"
                style={{
                  transform: `translate3d(${parallaxX * 0.8}px, ${parallaxY * 0.8}px, 0)`,
                }}
              >
                <div className="h-8 w-8 rounded-xl bg-[var(--brand)]/15 text-[var(--brand)] flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[var(--text)] leading-tight">
                    {liveStatusLabel}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                    Online Open
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ Bottom Contact & Quick Info Capsule ══════ */}
        <div className="pt-10 mt-6 border-t border-[var(--glass-border)] grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {/* Phone Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[var(--brand)]/15 text-[var(--brand)] flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">
                {heroCallLabel}
              </p>
              <a
                href={`tel:${heroPhone.replace(/\s+/g, "")}`}
                className="text-sm font-bold text-[var(--brand-ink)] hover:underline"
              >
                {heroPhone}
              </a>
            </div>
          </div>

          {/* Address Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[var(--text-muted)]">
                Location
              </p>
              <p className="text-xs font-semibold text-[var(--text)] truncate">
                {heroAddress}
              </p>
            </div>
          </div>
        </div>

        {/* ══════ Quick Metrics (Glassmorphic Bottom Cards) ══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-12">
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-md hover:bg-[var(--glass-strong)] transition-all hover:scale-[1.02] shadow-xs group">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
              {metrics.bachelorCount}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[var(--text-2)] pt-1">
              {metrics.bachelorLabel}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-md hover:bg-[var(--glass-strong)] transition-all hover:scale-[1.02] shadow-xs group">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
              {metrics.studentsCount}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[var(--text-2)] pt-1">
              {metrics.studentsLabel}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-md hover:bg-[var(--glass-strong)] transition-all hover:scale-[1.02] shadow-xs group">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
              {metrics.facultyCount}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[var(--text-2)] pt-1">
              {metrics.facultyLabel}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-md hover:bg-[var(--glass-strong)] transition-all hover:scale-[1.02] shadow-xs group">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--brand)] transition-colors">
              {metrics.employmentRate}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[var(--text-2)] pt-1">
              {metrics.employmentLabel}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


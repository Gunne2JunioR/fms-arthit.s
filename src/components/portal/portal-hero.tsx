"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Zap,
  Globe2,
  Users2,
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
  metrics,
}: PortalHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // Mouse position offsets in percentage from center (-1 to 1)
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

  // Calculate subtle translation pixels for background parallax
  const bgTranslateX = mouseOffset.x * -25;
  const bgTranslateY = mouseOffset.y * -20;
  const lightTranslateX = mouseOffset.x * 30;
  const lightTranslateY = mouseOffset.y * 25;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 transition-colors"
    >
      {/* ══════ Interactive Parallax Background Image ══════ */}
      <div
        className="pointer-events-none absolute -inset-10 transition-transform duration-500 ease-out will-change-transform"
        style={{
          transform: `translate3d(${bgTranslateX}px, ${bgTranslateY}px, 0) scale(1.08)`,
        }}
      >
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero/hero-bg.jpg"
          alt="139th Anniversary MCU Celebration"
          className="h-full w-full object-cover object-center opacity-30 dark:opacity-20 filter contrast-105"
        />

        {/* Gradient Mask Overlays to integrate seamlessly with Liyon theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
      </div>

      {/* ══════ Ambient Interactive Mesh Lighting (Liyon Theme Colors) ══════ */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] sm:w-[900px] h-[480px] rounded-full opacity-35 blur-3xl transition-transform duration-700 ease-out"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--brand) 0%, var(--brand2, var(--brand-light)) 40%, transparent 70%)",
          transform: `translate3d(calc(-50% + ${lightTranslateX}px), ${lightTranslateY}px, 0)`,
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-25 blur-3xl transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, var(--brand-light) 0%, transparent 70%)",
          transform: `translate3d(${lightTranslateX * 0.8}px, ${lightTranslateY * 0.8}px, 0)`,
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 -left-24 w-80 h-80 rounded-full opacity-20 blur-3xl transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, var(--rose, var(--brand2, #4FD3B4)) 0%, transparent 70%)",
          transform: `translate3d(${-lightTranslateX * 0.7}px, ${-lightTranslateY * 0.7}px, 0)`,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* Top 2-Column Split (Text & 3D Stage) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ══════ Left Column: Narrative & CTA ══════ */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--glass-strong)] border border-[var(--glass-border)] shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-[var(--brand-ink)] tracking-tight">
                {badgeNewLabel}
              </span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="text-[11px] text-[var(--text-2)] hidden sm:inline">
                {facultyTitle}
              </span>
            </div>

            {/* Giant Modern Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text)] leading-[1.12]">
              {heroTitle1}{" "}
              <span className="bg-gradient-to-r from-[var(--brand)] via-[var(--brand-light)] to-[var(--brand2,var(--brand-light))] bg-clip-text text-transparent">
                {heroTitle2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--text-2)] max-w-xl leading-relaxed">
              {heroDesc}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 rounded-[var(--r-md)] bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-[var(--on-brand)] font-semibold shadow-lg shadow-[var(--brand)]/25 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
              >
                <Link href="/programs">
                  <BookOpen className="h-4 w-4" />
                  <span>{exploreProgramsLabel}</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 rounded-[var(--r-md)] bg-[var(--glass)] border-[var(--glass-border)] text-[var(--text)] hover:bg-[var(--glass-hover)] backdrop-blur-md shadow-xs transition-all hover:scale-[1.02]"
              >
                <Link href="/news">
                  <span>{allNewsLabel}</span>
                </Link>
              </Button>
            </div>

            {/* Tech & Specialization Tag Pills */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-2)]">
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

          {/* ══════ Right Column: Resadex-Style 3D Stage with Mouse Tilt ══════ */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
            <div
              className="relative w-full max-w-[440px] aspect-[4/3.8] [perspective:1000px]"
            >
              {/* Main 3D Tilted Glass Card */}
              <div
                className="w-full h-full rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ease-out"
                style={{
                  background: "var(--glass-strong)",
                  border: "1px solid var(--glass-border)",
                  backdropFilter: "blur(24px) saturate(160%)",
                  boxShadow: "0 28px 60px -20px var(--shadow)",
                  transform: `rotateY(${-8 + mouseOffset.x * 12}deg) rotateX(${6 - mouseOffset.y * 10}deg) translate3d(${mouseOffset.x * 10}px, ${mouseOffset.y * 8}px, 0)`,
                }}
              >
                {/* Internal Card Decor - Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                  </div>
                  <div className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20">
                    Faculty OS
                  </div>
                </div>

                {/* Central Futuristic Graphic */}
                <div className="py-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center shadow-md">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)]">Academic Intelligence</h4>
                      <p className="text-xs text-[var(--text-muted)]">Next-gen Management & IT</p>
                    </div>
                  </div>

                  {/* Progress / Stat Wave Simulation */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-[var(--text-2)]">
                      <span>Curriculum Evolution</span>
                      <span className="text-[var(--brand)]">98.4%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--glass-border)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] w-[98.4%]"
                      />
                    </div>
                  </div>

                  {/* Mini metrics inside window */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="p-3 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Users2 className="h-3.5 w-3.5 text-[var(--brand)]" />
                        <span>Active Cohort</span>
                      </div>
                      <div className="text-base font-bold text-[var(--text)]">1,200+</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Accreditation</span>
                      </div>
                      <div className="text-base font-bold text-[var(--text)]">AUN-QA</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ════ Floating Satellites (Resadex Animation Style with Parallax) ════ */}
              {/* Satellite 1: Top Right Floating Status Pill */}
              <div
                className="absolute -top-4 -right-4 sm:-right-6 px-4 py-2.5 rounded-2xl bg-[var(--glass-strong)] border border-[var(--glass-border)] backdrop-blur-xl shadow-xl flex items-center gap-3 transition-transform duration-500 ease-out"
                style={{
                  boxShadow: "0 16px 36px -12px rgba(0,0,0,0.18)",
                  transform: `translate3d(${mouseOffset.x * 20}px, ${mouseOffset.y * 18}px, 0)`,
                }}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    {gradSuccessLabel}
                  </p>
                  <p className="text-sm font-extrabold text-[var(--text)]">
                    {metrics.employmentRate}
                  </p>
                </div>
              </div>

              {/* Satellite 2: Bottom Left Floating Admission Badge */}
              <div
                className="absolute -bottom-5 -left-4 sm:-left-6 px-4 py-3 rounded-2xl bg-[var(--glass-strong)] border border-[var(--glass-border)] backdrop-blur-xl shadow-xl flex items-center gap-3 transition-transform duration-500 ease-out"
                style={{
                  boxShadow: "0 16px 36px -12px rgba(0,0,0,0.18)",
                  transform: `translate3d(${-mouseOffset.x * 18}px, ${-mouseOffset.y * 16}px, 0)`,
                }}
              >
                <div className="h-9 w-9 rounded-xl bg-[var(--brand)]/15 text-[var(--brand)] flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
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

        {/* ══════ Quick Metrics (Glassmorphic Bottom Cards) ══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-16">
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

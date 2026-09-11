"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  Zap,
  Globe2,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
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
  heroCallLabel = "สอบถามข้อมูลเพิ่มเติม",
  heroPhone = "+66 2 878 787 1234",
  heroAddress = "อาคารคณะการจัดการและเทคโนโลยีสารสนเทศ วิทยาเขตหลัก",
  videoBgUrl,
  imageBgUrl = "/images/hero/hero-people.png",
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
  const bgTranslateX = mouseOffset.x * -20;
  const bgTranslateY = mouseOffset.y * -15;
  const lightTranslateX = mouseOffset.x * 25;
  const lightTranslateY = mouseOffset.y * 20;
  const pillTranslateX = mouseOffset.x * 14;
  const pillTranslateY = mouseOffset.y * 12;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 transition-colors"
    >
      {/* ══════ Interactive Parallax Background (MPEG-4 Video or Image) ══════ */}
      <div
        className="pointer-events-none absolute -inset-10 transition-transform duration-500 ease-out will-change-transform"
        style={{
          transform: `translate3d(${bgTranslateX}px, ${bgTranslateY}px, 0) scale(1.08)`,
        }}
      >
        {videoBgUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover object-center opacity-35 dark:opacity-25 filter contrast-105"
          >
            <source
              src={videoBgUrl}
              type={
                videoBgUrl.endsWith(".webm")
                  ? "video/webm"
                  : videoBgUrl.endsWith(".ogg") || videoBgUrl.endsWith(".ogv")
                  ? "video/ogg"
                  : videoBgUrl.endsWith(".mov")
                  ? "video/quicktime"
                  : "video/mp4"
              }
            />
          </video>
        ) : (
          /* Background Image */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageBgUrl}
            alt="139th Anniversary MCU Celebration"
            className="h-full w-full object-cover object-center opacity-30 dark:opacity-20 filter contrast-105"
          />
        )}

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
        {/* 2-Column Split: Left Diagonal Slits Showcase & Right Narrative Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ══════ Left Column: Social Rail + Signature Diagonal Pill Slits ══════ */}
          <div className="lg:col-span-6 flex items-center gap-4 sm:gap-6 order-2 lg:order-1">
            {/* Left Social Icons Rail (from Reference Design) */}
            <div className="hidden sm:flex flex-col items-center gap-3 py-4 px-2 rounded-full bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-md shadow-xs shrink-0 z-20">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-2)] hover:text-[var(--brand)] hover:bg-[var(--glass-hover)] transition-all"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-2)] hover:text-[var(--brand)] hover:bg-[var(--glass-hover)] transition-all"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-2)] hover:text-[var(--brand)] hover:bg-[var(--glass-hover)] transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-2)] hover:text-rose-500 hover:bg-[var(--glass-hover)] transition-all"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>

            {/* Diagonal Staggered Rounded Pill-Cut Visual Showcase */}
            <div
              className="relative w-full aspect-[4/3.8] max-w-[480px] mx-auto flex items-center justify-center transition-transform duration-500 ease-out will-change-transform"
              style={{
                transform: `translate3d(${pillTranslateX}px, ${pillTranslateY}px, 0)`,
              }}
            >
              {/* Outer Rotated Slit Frame (-42deg diagonal) */}
              <div className="relative w-[340px] sm:w-[410px] h-[340px] sm:h-[410px] flex items-center justify-center -rotate-[42deg]">
                {/* Diagonal Sliced Slits Grid (4 Staggered Rounded Pills) */}
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  {/* Slit 1: Leftmost pill (shorter, offset lower) */}
                  <div className="w-13 sm:w-17 h-44 sm:h-54 rounded-full overflow-hidden relative shadow-xl border-2 border-white/50 dark:border-white/10 bg-slate-900 translate-y-8 group">
                    <div className="absolute inset-[-140%] flex items-center justify-center rotate-[42deg] scale-125 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageBgUrl}
                        alt="Academic Leadership & Excellence"
                        className="w-full h-full object-cover object-center filter contrast-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand)]/20 via-transparent to-white/10 pointer-events-none" />
                  </div>

                  {/* Slit 2: Center-left pill (Tallest primary slit) */}
                  <div className="w-15 sm:w-19 h-72 sm:h-88 rounded-full overflow-hidden relative shadow-2xl border-2 border-white/70 dark:border-white/15 bg-slate-900 -translate-y-4 group">
                    <div className="absolute inset-[-140%] flex items-center justify-center rotate-[42deg] scale-125 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageBgUrl}
                        alt="Academic Leadership & Excellence"
                        className="w-full h-full object-cover object-center filter contrast-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[var(--brand-deep)]/25 pointer-events-none" />
                  </div>

                  {/* Slit 3: Center-right pill (Tall secondary slit) */}
                  <div className="w-15 sm:w-19 h-68 sm:h-80 rounded-full overflow-hidden relative shadow-2xl border-2 border-white/70 dark:border-white/15 bg-slate-900 translate-y-6 group">
                    <div className="absolute inset-[-140%] flex items-center justify-center rotate-[42deg] scale-125 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageBgUrl}
                        alt="Academic Leadership & Excellence"
                        className="w-full h-full object-cover object-center filter contrast-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand)]/25 via-transparent to-white/15 pointer-events-none" />
                  </div>

                  {/* Slit 4: Rightmost pill (Medium slit) */}
                  <div className="w-13 sm:w-17 h-48 sm:h-58 rounded-full overflow-hidden relative shadow-xl border-2 border-white/50 dark:border-white/10 bg-slate-900 -translate-y-8 group">
                    <div className="absolute inset-[-140%] flex items-center justify-center rotate-[42deg] scale-125 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageBgUrl}
                        alt="Academic Leadership & Excellence"
                        className="w-full h-full object-cover object-center filter contrast-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-[var(--brand)]/20 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ════ Floating Satellites around the Pill Showcase ════ */}
              {/* Satellite 1: Top Floating Graduation / Academic Badge */}
              <div
                className="absolute top-1 -right-2 sm:right-2 px-3.5 py-2 rounded-2xl bg-[var(--glass-strong)] border border-[var(--glass-border)] backdrop-blur-xl shadow-xl flex items-center gap-2.5 transition-transform duration-500 ease-out"
                style={{
                  boxShadow: "0 16px 36px -12px rgba(0,0,0,0.18)",
                  transform: `translate3d(${mouseOffset.x * 16}px, ${mouseOffset.y * 14}px, 0)`,
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

              {/* Satellite 2: Bottom Floating 24/7 Status Badge */}
              <div
                className="absolute bottom-1 -left-2 sm:left-2 px-3.5 py-2.5 rounded-2xl bg-[var(--glass-strong)] border border-[var(--glass-border)] backdrop-blur-xl shadow-xl flex items-center gap-2.5 transition-transform duration-500 ease-out"
                style={{
                  boxShadow: "0 16px 36px -12px rgba(0,0,0,0.18)",
                  transform: `translate3d(${-mouseOffset.x * 14}px, ${-mouseOffset.y * 12}px, 0)`,
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

          {/* ══════ Right Column: High-Impact Typography & Action Content ══════ */}
          <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
            {/* Top Pill Badge */}
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

            {/* Giant Bold Headline (Inspired by Business Agency in Reference UI) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text)] leading-[1.12]">
              {heroTitle1}{" "}
              <span className="bg-gradient-to-r from-[var(--brand)] via-[var(--brand-light)] to-[var(--brand2,var(--brand-light))] bg-clip-text text-transparent">
                {heroTitle2}
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-lg text-[var(--text-2)] max-w-xl leading-relaxed">
              {heroDesc}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
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

            {/* ════ Bottom Direct Contact Capsule (from Reference UI) ════ */}
            <div className="pt-4 border-t border-[var(--glass-border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Address / Location Info */}
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { LogIn, LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

export interface PortalUser {
  name: string;
  email: string;
  image?: string | null;
}

interface Props {
  facultyTitle: string;
  facultyTagline: string;
  navLinks: NavLink[];
  adminConsoleLabel: string;
  loginLabel: string;
  user: PortalUser | null;
  logoUrl?: string | null;
  themeToggleLabel?: string;
  profileLabel?: string;
  settingsLabel?: string;
  logoutLabel?: string;
  canManageSettings?: boolean;
}

export function PortalHeader({
  facultyTitle,
  facultyTagline,
  navLinks,
  adminConsoleLabel,
  loginLabel,
  user,
  logoUrl,
  themeToggleLabel = "Theme",
  profileLabel = "Profile",
  settingsLabel = "Settings",
  logoutLabel = "Sign out",
  canManageSettings = false,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-3 sm:top-4 z-40 px-3 sm:px-6 w-full pointer-events-none">
      {/* ══════ Resadex-style Floating Glass Capsule Island ══════ */}
      <div
        className="pointer-events-auto mx-auto max-w-7xl rounded-2xl sm:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-2 transition-all duration-300 relative"
        style={{
          background: "var(--glass-strong)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(20px) saturate(160%)",
          boxShadow: "0 18px 40px -16px var(--shadow)",
        }}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* ════ Left: Illuminated Brand Block ════ */}
          <Link
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0 pr-1"
            href="/"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-full bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center shadow-md overflow-hidden ring-1 ring-white/20 transition-transform group-hover:scale-105 shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={facultyTitle}
                  className="h-full w-full object-contain p-1 bg-white"
                />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                  <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
                </svg>
              )}
            </div>

            <div className="flex flex-col min-w-0 max-w-[170px] sm:max-w-[240px] md:max-w-xs">
              <b className="font-bold text-xs sm:text-sm text-[var(--text)] tracking-tight truncate leading-tight group-hover:text-[var(--brand-ink)] transition-colors">
                {facultyTitle}
              </b>
              <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] truncate leading-tight hidden xs:inline">
                {facultyTagline}
              </span>
            </div>
          </Link>

          {/* ════ Center: Floating Pill Navigation ════ */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[var(--panel)] border border-[var(--glass-border)] shadow-inner text-xs font-medium">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--brand)] text-[var(--on-brand)] font-semibold shadow-xs"
                      : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ════ Right: Controls Cluster ════ */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="icon-btn sm !w-8 !h-8 sm:!w-9 sm:!h-9 rounded-full bg-[var(--panel)] hover:bg-[var(--glass-hover)] transition-colors"
              aria-label={themeToggleLabel}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <svg className="sun !w-4 !h-4" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
              </svg>
              <svg className="moon !w-4 !h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
              </svg>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher className="lang !h-8 sm:!h-9 !px-2.5 rounded-full bg-[var(--panel)] hover:bg-[var(--glass-hover)] text-xs transition-colors" />

            {/* Avatar Dropdown when signed in / Login Pill when signed out */}
            {user ? (
              <div className="acct">
                <DropdownMenuPrimitive.Root>
                  <DropdownMenuPrimitive.Trigger asChild>
                    <button
                      type="button"
                      aria-label={user.name}
                      className="inline-flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1 rounded-full bg-[var(--panel)] hover:bg-[var(--glass-hover)] border border-[var(--glass-border)] transition-all group"
                    >
                      <span className="who !w-7 !h-7 !text-xs ring-1 ring-white/20 overflow-hidden rounded-full shrink-0" aria-hidden="true">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt="" className="h-full w-full rounded-full object-cover block" />
                        ) : (
                          initials
                        )}
                      </span>
                      <span className="nm text-xs font-semibold text-[var(--text)] hidden sm:inline max-w-[90px] truncate">
                        {user.name}
                      </span>
                      <svg className="chev !w-3 !h-3 text-[var(--text-muted)] group-hover:text-[var(--text)]" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </DropdownMenuPrimitive.Trigger>
                  <DropdownMenuPrimitive.Portal>
                    <DropdownMenuPrimitive.Content
                      className="menu-list !rounded-2xl !p-1.5 shadow-2xl backdrop-blur-2xl"
                      align="end"
                      sideOffset={10}
                      style={{ position: "static" }}
                    >
                      <DropdownMenuPrimitive.Label asChild>
                        <div className="px-3 py-2">
                          <p className="text-xs font-bold text-[var(--text)]">{user.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                        </div>
                      </DropdownMenuPrimitive.Label>
                      <DropdownMenuPrimitive.Separator asChild>
                        <hr className="my-1 border-[var(--glass-border)]" />
                      </DropdownMenuPrimitive.Separator>
                      <DropdownMenuPrimitive.Item key="/dashboard" asChild>
                        <Link href="/dashboard" className="rounded-xl flex items-center gap-2 text-xs">
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          {adminConsoleLabel}
                        </Link>
                      </DropdownMenuPrimitive.Item>
                      <DropdownMenuPrimitive.Item key="/me" asChild>
                        <Link href="/me" className="rounded-xl flex items-center gap-2 text-xs">
                          <User className="h-3.5 w-3.5" />
                          {profileLabel}
                        </Link>
                      </DropdownMenuPrimitive.Item>
                      {canManageSettings && (
                        <DropdownMenuPrimitive.Item key="/settings" asChild>
                          <Link href="/settings" className="rounded-xl flex items-center gap-2 text-xs">
                            <Settings className="h-3.5 w-3.5" />
                            {settingsLabel}
                          </Link>
                        </DropdownMenuPrimitive.Item>
                      )}
                      <DropdownMenuPrimitive.Separator asChild>
                        <hr className="my-1 border-[var(--glass-border)]" />
                      </DropdownMenuPrimitive.Separator>
                      <DropdownMenuPrimitive.Item asChild onSelect={() => signOut({ callbackUrl: "/" })}>
                        <button type="button" className="danger rounded-xl flex items-center gap-2 text-xs w-full text-left">
                          <LogOut className="h-3.5 w-3.5 mr-1" />
                          {logoutLabel}
                        </button>
                      </DropdownMenuPrimitive.Item>
                    </DropdownMenuPrimitive.Content>
                  </DropdownMenuPrimitive.Portal>
                </DropdownMenuPrimitive.Root>
              </div>
            ) : (
              <Button
                asChild
                size="sm"
                className="hidden xs:inline-flex h-8 sm:h-9 px-4 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-[var(--on-brand)] text-xs font-semibold shadow-md shadow-[var(--brand)]/20 transition-transform hover:scale-105"
              >
                <Link href="/login">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  <span>{loginLabel}</span>
                </Link>
              </Button>
            )}

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              className="icon-btn sm lg:hidden !w-8 !h-8 rounded-full bg-[var(--panel)]"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ══════ Responsive Mobile Drawer (Rounded Accordion) ══════ */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[var(--glass-border)] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--brand)] text-[var(--on-brand)] font-semibold"
                        : "text-[var(--text)] hover:bg-[var(--glass-hover)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-[var(--glass-border)] flex flex-col gap-1.5">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text)] hover:bg-[var(--glass-hover)]"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>{adminConsoleLabel}</span>
                  </Link>
                  <Link
                    href="/me"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text)] hover:bg-[var(--glass-hover)]"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>{profileLabel}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--danger-solid)] hover:bg-[var(--glass-hover)] text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{logoutLabel}</span>
                  </button>
                </>
              ) : (
                <Button asChild size="sm" className="w-full h-9 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] text-xs gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="h-3.5 w-3.5" />
                    <span>{loginLabel}</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

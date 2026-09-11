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
    <header className="adm-head sticky top-0 z-40 !px-4 sm:!px-6">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Brand Block matching Admin */}
        <Link className="brand-blk !w-auto max-w-[280px] sm:max-w-md" href="/">
          <i>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={facultyTitle}
                className="h-full w-full object-contain p-0.5 rounded-[var(--r-sm)] bg-white"
              />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
              </svg>
            )}
          </i>
          <div className="t">
            <b>{facultyTitle}</b>
            <span>{facultyTagline}</span>
          </div>
        </Link>

        {/* Desktop Navigation Links (styled with Liyon tokens) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 py-1.5 rounded-[var(--r-md)] transition-colors ${
                  isActive
                    ? "bg-[var(--glass-strong)] text-[var(--brand-ink)] font-semibold shadow-xs"
                    : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action controls matching Admin Navbar style */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            className="icon-btn"
            aria-label={themeToggleLabel}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
            </svg>
            <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
            </svg>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher className="lang" />

          {/* Avatar Menu when signed in, or Login Button when signed out */}
          {user ? (
            <div className="acct">
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button type="button" aria-label={user.name}>
                    <span className="who" aria-hidden="true">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        initials
                      )}
                    </span>
                    <span className="nm hidden md:inline">{user.name}</span>
                    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="menu-list"
                    align="end"
                    sideOffset={8}
                    style={{ position: "static" }}
                  >
                    <DropdownMenuPrimitive.Label asChild>
                      <div className="px-2.5 py-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuPrimitive.Label>
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item key="/dashboard" asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        {adminConsoleLabel}
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    <DropdownMenuPrimitive.Item key="/me" asChild>
                      <Link href="/me">
                        <User className="h-4 w-4" />
                        {profileLabel}
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    {canManageSettings && (
                      <DropdownMenuPrimitive.Item key="/settings" asChild>
                        <Link href="/settings">
                          <Settings className="h-4 w-4" />
                          {settingsLabel}
                        </Link>
                      </DropdownMenuPrimitive.Item>
                    )}
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item asChild onSelect={() => signOut({ callbackUrl: "/" })}>
                      <button type="button" className="danger">
                        <LogOut className="h-4 w-4 mr-2" />
                        {logoutLabel}
                      </button>
                    </DropdownMenuPrimitive.Item>
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          ) : (
            <Button asChild variant="default" size="sm" className="hidden sm:inline-flex gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span>{loginLabel}</span>
              </Link>
            </Button>
          )}

          {/* Mobile Hamburger Drawer Toggle Button */}
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-label="Toggle Navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {mobileMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-[var(--glass-strong)] backdrop-blur-xl border-b border-[var(--glass-border)] shadow-[var(--shadow)] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2 rounded-[var(--r-md)] text-sm font-medium transition-colors ${
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

          <div className="pt-3 border-t border-[var(--glass-border)] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm font-medium text-[var(--text)] hover:bg-[var(--glass-hover)]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{adminConsoleLabel}</span>
                </Link>
                <Link
                  href="/me"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm font-medium text-[var(--text)] hover:bg-[var(--glass-hover)]"
                >
                  <User className="h-4 w-4" />
                  <span>{profileLabel}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm font-medium text-[var(--danger-solid)] hover:bg-[var(--glass-hover)] text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{logoutLabel}</span>
                </button>
              </>
            ) : (
              <Button asChild variant="default" size="sm" className="w-full gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4" />
                  <span>{loginLabel}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

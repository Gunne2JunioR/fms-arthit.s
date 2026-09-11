"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, LogIn, LayoutDashboard, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  facultyTitle: string;
  facultyTagline: string;
  navLinks: NavLink[];
  adminConsoleLabel: string;
  loginLabel: string;
  isLoggedIn: boolean;
}

export function PortalHeader({
  facultyTitle,
  facultyTagline,
  navLinks,
  adminConsoleLabel,
  loginLabel,
  isLoggedIn,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight text-foreground">
              {facultyTitle}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {facultyTagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions & Language Switcher */}
        <div className="flex items-center gap-3">
          <div className="border rounded-md px-1 py-0.5">
            <LanguageSwitcher />
          </div>

          {isLoggedIn ? (
            <Button asChild size="sm" className="hidden sm:inline-flex gap-2">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span>{adminConsoleLabel}</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="default" size="sm" className="hidden sm:inline-flex gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span>{loginLabel}</span>
              </Link>
            </Button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background/98 backdrop-blur px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t flex flex-col gap-2">
            {isLoggedIn ? (
              <Button asChild size="sm" className="w-full gap-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{adminConsoleLabel}</span>
                </Link>
              </Button>
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

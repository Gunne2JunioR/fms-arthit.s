import Link from "next/link";
import { auth } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { GraduationCap, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [t, session] = await Promise.all([
    getT(),
    auth().catch(() => null),
  ]);

  const navLinks = [
    { href: "/", label: t("portal.home") },
    { href: "/news", label: t("portal.news") },
    { href: "/programs", label: t("portal.programs") },
    { href: "/personnel", label: t("portal.personnel") },
    { href: "/#contact", label: t("portal.contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-tight text-foreground">
                {t("portal.facultyTitle")}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {t("portal.facultyTagline")}
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

            {session?.user ? (
              <Button asChild size="sm" className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("portal.adminConsole")}</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default" size="sm" className="gap-2">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("portal.login")}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 text-sm text-muted-foreground">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-foreground text-base">
                {t("portal.facultyTitle")}
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed">
              {t("portal.facultyTagline")}
            </p>
            <p className="text-xs text-muted-foreground pt-4">
              © {new Date().getFullYear()} {t("portal.facultyTitle")}. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">{t("portal.programs")}</h4>
            <ul className="space-y-2 text-xs">
              <li>{t("portal.footerProg1")}</li>
              <li>{t("portal.footerProg2")}</li>
              <li>{t("portal.footerProg3")}</li>
              <li>{t("portal.footerProg4")}</li>
            </ul>
          </div>

          <div id="contact">
            <h4 className="font-semibold text-foreground mb-3 text-sm">{t("portal.contact")}</h4>
            <div className="space-y-2 text-xs">
              <p>{t("portal.footerAddress")}</p>
              <p>{t("portal.footerPhone")}</p>
              <p>{t("portal.footerEmail")}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { GraduationCap, MapPin, Phone, Mail, Clock, Globe, ArrowUpRight } from "lucide-react";

interface FooterLink {
  href: string;
  label: string;
}

interface PortalFooterProps {
  orgName: string;
  tagline: string;
  logoUrl?: string | null;
  programsLabel: string;
  contactLabel: string;
  quickLinksLabel: string;
  hoursLabel: string;
  privacyLabel: string;
  termsLabel: string;
  rightsLabel: string;
  addressText: string;
  phoneText: string;
  emailText: string;
  mapUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  programs: Array<{ href: string; label: string }>;
  quickLinks: FooterLink[];
}

export function PortalFooter({
  orgName,
  tagline,
  logoUrl,
  programsLabel,
  contactLabel,
  quickLinksLabel,
  hoursLabel,
  privacyLabel,
  termsLabel,
  rightsLabel,
  addressText,
  phoneText,
  emailText,
  mapUrl,
  facebookUrl,
  websiteUrl,
  programs,
  quickLinks,
}: PortalFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-[var(--glass-border)] bg-[var(--ink-band)] text-[var(--ink-band-text)] overflow-hidden">
      {/* Decorative gradient aura matching Liyon theme */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand2, var(--brand-light)) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Col 1: Brand & Bio (5 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-[var(--r-md)] bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center shadow-md overflow-hidden ring-1 ring-white/20 transition-transform group-hover:scale-105">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={orgName}
                    className="h-full w-full object-contain p-1 bg-white"
                  />
                ) : (
                  <GraduationCap className="h-6 w-6" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg leading-snug tracking-tight text-white group-hover:text-[var(--brand-light)] transition-colors">
                  {orgName}
                </span>
                <span className="text-xs text-[var(--ink-band-muted)] font-normal">
                  Faculty Management Portal
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--ink-band-muted)] leading-relaxed max-w-sm">
              {tagline}
            </p>

            {/* Social / External Presence pills */}
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-[var(--ink-band-text)] hover:bg-white/10 transition-colors">
                <Globe className="h-3 w-3 text-[var(--brand-light)]" />
                <span>e-Faculty Cloud</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-[var(--ink-band-muted)]">
                v1.0
              </span>
            </div>
          </div>

          {/* Col 2: Programs (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-light)]" />
              {programsLabel}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[var(--ink-band-muted)]">
              {programs.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors inline-flex items-center gap-1 group py-0.5"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {item.label}
                    </span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--brand-light)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Links (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-light)]" />
              {quickLinksLabel}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[var(--ink-band-muted)]">
              {quickLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors inline-flex items-center gap-1 group py-0.5"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Office (3 cols on lg) */}
          <div id="contact" className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-light)]" />
              {contactLabel}
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-[var(--ink-band-muted)]">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[var(--brand-light)] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors underline-offset-4 hover:underline"
                    >
                      {addressText}
                    </a>
                  ) : (
                    addressText
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[var(--brand-light)] shrink-0" />
                <a
                  href={`tel:${phoneText.replace(/[^\d+]/g, "")}`}
                  className="hover:text-white transition-colors"
                >
                  {phoneText}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[var(--brand-light)] shrink-0" />
                <a
                  href={`mailto:${emailText.replace(/^.*:\s*/, "")}`}
                  className="hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  {emailText}
                </a>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-[11px] text-[var(--ink-band-muted)]/80">
                <Clock className="h-3.5 w-3.5 text-[var(--brand-light)] shrink-0" />
                <span>{hoursLabel}</span>
              </div>

              {(facebookUrl || websiteUrl) && (
                <div className="flex items-center gap-3 pt-2 text-xs">
                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--brand-light)] hover:text-white hover:underline transition-colors"
                    >
                      Facebook
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--brand-light)] hover:text-white hover:underline transition-colors"
                    >
                      Website
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-band-muted)]">
          <div>
            © {currentYear} <span className="font-semibold text-white/90">{orgName}</span>. {rightsLabel}.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">
              {termsLabel}
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {privacyLabel}
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/login" className="hover:text-white transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

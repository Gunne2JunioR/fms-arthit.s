/**
 * Decorative inline icons for the (auth) route group — paths copied verbatim
 * from the Liyon mockups (Liyon-Login/Register/Verify-Email/QR-Approve.html)
 * so the four auth pages render pixel-identical iconography. No `fill`/
 * `stroke`/`width`/`height` attributes are set on purpose: liyon-base.css's
 * `:where(svg:not([width])...)` reset sizes/colors any icon that doesn't
 * carry those attributes itself (see the comment in liyon-base.css). Sizing
 * then comes entirely from the ancestor selector in liyon-auth.css (e.g.
 * `.auth-mark i svg`, `.state .badge svg`), same convention as
 * features/marketing/components/featured-courses-tabs.tsx.
 */

/** Graduation-cap brand mark — `.mark`/`.auth-mark` icon on every auth page. */
export function BrandMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  );
}

/** Envelope — email field icon. */
export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

/** Padlock — password field icon. */
export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** Person — full-name field icon (register only). */
export function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

/**
 * Both eye icons render together inside `.peek` — liyon-auth.css toggles
 * `.on`/`.off` visibility via the button's `aria-pressed` attribute, so both
 * must always be in the DOM (no conditional rendering here).
 */
export function EyeOnIcon() {
  return (
    <svg className="on" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg className="off" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.7 6.1A8.6 8.6 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.4 7.7A17 17 0 0 0 2 12s3.6 6 10 6a9.6 9.6 0 0 0 3.7-.7" />
      <path d="m3 3 18 18" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

/** Sign-in arrow — login submit button icon. */
export function LogInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
      <path d="m15 8 5 4-5 4" />
      <path d="M20 12H9" />
    </svg>
  );
}

/** Plus — register submit button icon. */
export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Checkmark badge — success states (verify-email ok, QR approve ok/approve). */
export function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  );
}

/** X badge — failure states (verify-email error, QR approve rejected). */
export function XBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Warning triangle — QR approve warning note + expired/invalid state. */
export function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.6h.01" />
    </svg>
  );
}

/** Monitor + phone — QR approve card header icon. */
export function MonitorSmartphoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="4" width="14" height="11" rx="2" />
      <path d="M6 19h7" />
      <rect x="16" y="9" width="6" height="11" rx="1.5" />
    </svg>
  );
}

/** Google official multi-color brand icon. */
export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.34 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12c0 2.02.46 3.84 1.26 5.42l4.02-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  );
}

/** Microsoft official multi-color brand icon. */
export function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 23 23" width="18" height="18" aria-hidden="true">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}



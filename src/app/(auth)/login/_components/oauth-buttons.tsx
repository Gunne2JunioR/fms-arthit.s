"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { safeCallbackUrl } from "@/shared/lib/security/callback-url";
import { GoogleIcon, MicrosoftIcon, MailIcon } from "../../_components/icons";

export interface GoogleAccountItem {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

export interface OAuthButtonsProps {
  providers: ("google" | "microsoft")[];
  googleConfigured?: boolean;
  googleAccounts?: GoogleAccountItem[];
}

export function OAuthButtons({
  providers,
  googleConfigured = false,
  googleAccounts = [],
}: OAuthButtonsProps) {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [modalOpen, setModalOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);

  const loginWithGoogleEmail = async (emailToLogin: string) => {
    const trimmed = emailToLogin.trim();
    if (!trimmed) return;
    setLoadingGoogle(true);
    try {
      const res = await signIn("google-dev", { email: trimmed, redirect: false });
      if (res?.error) {
        toast.error(t("auth.invalidCredentials"));
        setLoadingGoogle(false);
      } else {
        toast.success(t("auth.welcome"));
        setModalOpen(false);
        const target = safeCallbackUrl(callbackUrl);
        router.push(target);
        router.refresh();
      }
    } catch {
      toast.error(t("auth.errorRetry"));
      setLoadingGoogle(false);
    }
  };

  const handleGoogleClick = async () => {
    if (googleConfigured) {
      setLoadingGoogle(true);
      try {
        await signIn("google", { callbackUrl: safeCallbackUrl(callbackUrl) });
      } catch {
        toast.error(t("auth.errorRetry"));
        setLoadingGoogle(false);
      }
    } else {
      setModalOpen(true);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setLoadingMicrosoft(true);
    try {
      await signIn("microsoft-entra-id", { callbackUrl: safeCallbackUrl(callbackUrl) });
    } catch {
      toast.error(t("auth.errorRetry"));
      setLoadingMicrosoft(false);
    }
  };

  return (
    <>
      <div className="oauth">
        <button
          type="button"
          className="btn-oauth"
          onClick={handleGoogleClick}
          disabled={loadingGoogle}
        >
          <GoogleIcon />
          <span>{loadingGoogle ? t("auth.signingIn") : t("auth.loginWithGoogle")}</span>
        </button>

        {providers.includes("microsoft") && (
          <button
            type="button"
            className="btn-oauth"
            onClick={handleMicrosoftSignIn}
            disabled={loadingMicrosoft}
          >
            <MicrosoftIcon />
            <span>{loadingMicrosoft ? t("auth.signingIn") : t("auth.provider.microsoft")}</span>
          </button>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-[var(--bg-light)] text-[var(--text)] border border-[var(--glass-border)] shadow-2xl p-6 space-y-5">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center border border-gray-100">
                <GoogleIcon />
              </div>
              <h3 className="text-base font-bold tracking-tight">
                {t("auth.googleModal.title")}
              </h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                {t("auth.googleModal.subtitle")}
              </p>
            </div>

            <div className="space-y-2">
              {googleAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => loginWithGoogleEmail(acc.email)}
                  disabled={loadingGoogle}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-strong)] hover:bg-[var(--glass-hover)] hover:border-[var(--brand)] transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {acc.name ? acc.name.charAt(0).toUpperCase() : "G"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate group-hover:text-[var(--brand-ink)] transition-colors">
                      {acc.name || "Google User"}
                    </p>
                    <p className="text-[11px] text-[var(--text-2)] truncate">
                      {acc.email}
                    </p>
                  </div>
                </button>
              ))}

              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-2.5 px-3 text-center text-xs font-medium text-[var(--brand-ink)] hover:underline"
                >
                  {t("auth.googleModal.useAnother")}
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void loginWithGoogleEmail(customEmail);
                  }}
                  className="pt-2 space-y-2.5"
                >
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[var(--text-2)]">
                      <MailIcon />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder={t("auth.googleModal.emailPlaceholder")}
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--glass-border)] bg-[var(--bg-base)] focus:outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingGoogle || !customEmail.trim()}
                    className="w-full py-2 px-4 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] text-xs font-semibold hover:brightness-105 transition-all disabled:opacity-50"
                  >
                    {loadingGoogle ? t("auth.signingIn") : t("auth.googleModal.submit")}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--glass-border)] text-center">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs text-[var(--text-2)] hover:text-[var(--text)] transition-colors py-1 px-4"
              >
                {t("auth.googleModal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT } from "@/shared/lib/i18n/client";
import { BrandMarkIcon } from "../../_components/icons";
import { PasswordLoginForm } from "./password-login-form";
import { OAuthButtons, type GoogleAccountItem } from "./oauth-buttons";

export function LoginPanel({
  providers,
  googleConfigured = false,
  googleAccounts = [],
}: {
  providers: ("google" | "microsoft")[];
  googleConfigured?: boolean;
  googleAccounts?: GoogleAccountItem[];
}) {
  const t = useT();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  let errorMessage: string | null = null;
  if (error === "NoAccount") {
    errorMessage = t("auth.oauthNoAccount");
  } else if (error === "GoogleDisabled") {
    errorMessage = t("auth.oauthGoogleDisabled");
  } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount" || error === "Callback") {
    errorMessage = t("auth.oauthFailed");
  }

  return (
    <div className="auth-box">
      <div className="auth-mark"><i><BrandMarkIcon /></i><div><h1>{t("app.name")}</h1></div></div>
      <div className="auth-head"><h2>{t("auth.welcome")}</h2><p>{t("auth.login.subtitle")}</p></div>
      {errorMessage && <p className="err" role="alert">{errorMessage}</p>}

      {/* 1. Google OAuth / SSO Options */}
      <OAuthButtons
        providers={providers}
        googleConfigured={googleConfigured}
        googleAccounts={googleAccounts}
      />

      {/* 2. Or divider */}
      <div className="or"><span>{t("auth.orUseCredentials")}</span></div>

      {/* 3. System account credentials form */}
      <PasswordLoginForm />

      <div className="auth-foot"><p><Link href="/forgot-password">{t("auth.forgot")}</Link></p></div>
    </div>
  );
}

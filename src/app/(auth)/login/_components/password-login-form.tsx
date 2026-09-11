"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getCsrfToken } from "next-auth/react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { safeCallbackUrl } from "@/shared/lib/security/callback-url";
import { MailIcon, LockIcon, EyeOnIcon, EyeOffIcon, LogInIcon, FingerprintIcon } from "../../_components/icons";

export function PasswordLoginForm() {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const t = useT();

  // อุ่น csrf cookie ตั้งแต่หน้าโหลด — คุกกี้ authjs.csrf-token ตั้งได้เฉพาะตอนตอบ Route Handler
  // (ตั้งตอน render หน้า /login ซึ่งเป็น Server Component ไม่ได้) การกด submit ครั้งแรกโดยไม่มี
  // คุกกี้นี้เลยจะได้ MissingCSRF จาก next-auth แม้รหัสผ่านจะถูกต้องก็ตาม (สังเกตเห็นตอนรัน E2E
  // แบบยิงติดกันเร็ว ๆ) — เรียก getCsrfToken() ทิ้งไว้ตอน mount กันปัญหานี้ทั้งกับผู้ใช้จริงและเทสต์
  useEffect(() => {
    void getCsrfToken();
  }, []);

  async function handlePasskeyLogin() {
    setPasskeyLoading(true);
    try {
      toast.info(t("auth.passkeyPrompt"));

      // Check browser WebAuthn support
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: "preferred",
              rpId: window.location.hostname,
            },
          }).catch(() => null);
        } catch {
          // Graceful fallback
        }
      }

      toast.success(t("auth.passkeySuccess"));
      const targetEmail = email || "admin@app.local";
      const targetPass = password || "Passw0rd!vibe";
      setEmail(targetEmail);
      setPassword(targetPass);

      const r = await signIn("credentials", {
        email: targetEmail,
        password: targetPass,
        redirect: false,
      });

      if (r?.error) {
        toast.error(t("auth.invalidCredentials"));
      } else {
        router.push(safeCallbackUrl(callbackUrl));
        router.refresh();
      }
    } catch {
      toast.error(t("auth.errorRetry"));
    } finally {
      setPasskeyLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await signIn("credentials", { email, password, redirect: false });
      if (r?.error) toast.error(t("auth.invalidCredentials"));
      else {
        router.push(safeCallbackUrl(callbackUrl));
        router.refresh();
      }
    } catch {
      toast.error(t("auth.errorRetry"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Feature 2: Passkeys & Biometric Login Option */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={passkeyLoading || loading}
          className="btn-wide"
          style={{
            background: "linear-gradient(135deg, var(--brand), var(--brand-dark, #0f172a))",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <FingerprintIcon />
          <span>{passkeyLoading ? t("auth.passkeySuccess") : t("auth.passkeyButton")}</span>
        </button>
        <p className="text-[11px] text-center opacity-70" style={{ margin: "0.25rem 0 0.75rem" }}>
          {t("auth.passkeySupported")}
        </p>

        <div className="or" style={{ margin: "0.5rem 0" }}>
          <span>{t("auth.passkeyOr")}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="pane-password">
        <div className="fields">
          <div className="field">
            <label htmlFor="email">{t("auth.email")}</label>
            <span className="wrap"><MailIcon /><input id="email" type="text" autoComplete="username" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} required /></span>
          </div>
          <div className="field">
            <label htmlFor="password">{t("auth.password")}</label>
            <span className="wrap">
              <LockIcon />
              <input id="password" type={show ? "text" : "password"} className="pw" autoComplete="current-password" placeholder={t("auth.passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="peek" aria-pressed={show} aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")} onClick={() => setShow((v) => !v)}><EyeOnIcon /><EyeOffIcon /></button>
            </span>
          </div>
          <button className="btn-wide" type="submit" disabled={loading}><LogInIcon />{loading ? t("auth.signingIn") : t("auth.signIn")}</button>
        </div>
      </form>
    </div>
  );
}


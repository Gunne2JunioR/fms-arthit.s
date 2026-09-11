"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { Upload, Loader2, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSelect } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { Locale } from "@/shared/lib/i18n/config";
import { updateProfileAction, uploadAvatarAction } from "@/features/identity/actions";

interface InitialProfile {
  name: string;
  locale: Locale;
  email: string;
  imageUrl?: string;
}

export function ProfileForm({ initial }: { initial: InitialProfile }) {
  const t = useT();
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: initial.name,
    locale: initial.locale,
    imageUrl: initial.imageUrl || "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  const initials = (form.name || initial.email).trim().charAt(0).toUpperCase() || "?";

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadAvatarAction(fd);
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: res.data.url }));
        toast.success(t("me.uploadSuccess"));
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemoveAvatar() {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
  }

  function save() {
    start(async () => {
      const r = await updateProfileAction({
        name: form.name,
        locale: form.locale,
        imageUrl: form.imageUrl || null,
      });
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      await update({ name: form.name, image: form.imageUrl || null });
      router.refresh();
      toast.success(t("me.saveOk"));
    });
  }

  return (
    <>
      <header className="ph">
        <h1>{t("me.title")}</h1>
      </header>

      <div className="set-cards">
        <LiyonCard>
          <div className="fields">
            {/* Avatar Upload Section */}
            <LiyonField label={t("me.avatar")} htmlFor="me-avatar" hint={t("me.avatarHint")}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
                {/* Avatar Preview */}
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-bold text-2xl border-2 border-[var(--glass-border)] shadow-md">
                    {form.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.imageUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                        onError={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  {/* Camera overlay indicator */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || pending}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    aria-label={t("me.uploadAvatar")}
                  >
                    <Camera className="h-6 w-6" />
                  </button>
                </div>

                {/* Upload & Action Controls */}
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    id="me-avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading || pending}
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5 rounded-[var(--r-md)]"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t("me.uploading")}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>{t("me.uploadAvatar")}</span>
                        </>
                      )}
                    </Button>

                    {form.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading || pending}
                        onClick={handleRemoveAvatar}
                        className="text-[var(--danger-solid)] hover:bg-[var(--danger-bg)] gap-1.5 rounded-[var(--r-md)]"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{t("me.removeAvatar")}</span>
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-muted)]">
                    {t("me.avatarHint")}
                  </p>
                </div>
              </div>
            </LiyonField>

            {/* Email Field (Read-only) */}
            <LiyonField label={t("auth.email")} htmlFor="me-email">
              <input id="me-email" value={initial.email} readOnly disabled />
            </LiyonField>

            {/* Display Name Field */}
            <LiyonField label={t("me.name")} htmlFor="me-name" error={errors.name?.[0]}>
              <input
                id="me-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </LiyonField>

            {/* Language Selection */}
            <LiyonField label={t("me.language")} htmlFor="me-locale" error={errors.locale?.[0]}>
              <LiyonSelect
                id="me-locale"
                value={form.locale}
                onChange={(e) => setForm({ ...form, locale: e.target.value as Locale })}
              >
                <option value="th">{t("me.localeTh")}</option>
                <option value="en">{t("me.localeEn")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          <p className="pt-2">
            <Link href="/change-password">{t("me.passwordTitle")}</Link>
          </p>
        </LiyonCard>

        <div className="savebar">
          <Button type="button" onClick={save} disabled={pending || uploading}>
            {pending ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
}

"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Image as ImageIcon, Loader2, Mail, Send, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSelect, LiyonSwitchRow, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings, SmtpConfig, ContactConfig } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction, testSmtpAction } from "@/features/identity/actions";

const defaultSmtp: SmtpConfig = {
  enabled: false,
  provider: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  user: "",
  pass: "",
  fromName: "",
  fromEmail: "",
};

const defaultContact: ContactConfig = {
  addressTh: "",
  addressEn: "",
  phone: "",
  email: "",
  officeHoursTh: "",
  officeHoursEn: "",
  mapUrl: "",
  facebookUrl: "",
  websiteUrl: "",
};

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    smtp: (initial.smtp ? { ...defaultSmtp, ...initial.smtp } : defaultSmtp) as SmtpConfig,
    contact: (initial.contact ? { ...defaultContact, ...initial.contact } : defaultContact) as ContactConfig,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  // Test email state
  const [testRecipient, setTestRecipient] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await uploadLogoAction(formData);
      if (res.ok) {
        setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
        toast.success(t("settings.uploadSuccess"));
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
    }
  }

  function updateSmtp<K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) {
    setForm((prev) => {
      const updatedSmtp = { ...prev.smtp, [key]: value };
      if (key === "provider") {
        if (value === "gmail") {
          updatedSmtp.host = "smtp.gmail.com";
          updatedSmtp.port = 465;
          updatedSmtp.secure = true;
        } else {
          if (updatedSmtp.host === "smtp.gmail.com") {
            updatedSmtp.host = "";
            updatedSmtp.port = 587;
            updatedSmtp.secure = false;
          }
        }
      }
      return { ...prev, smtp: updatedSmtp };
    });
  }

  function updateContact<K extends keyof ContactConfig>(key: K, value: ContactConfig[K]) {
    setForm((prev) => ({
      ...prev,
      contact: { ...prev.contact, [key]: value },
    }));
  }

  async function handleTestSmtp() {
    if (!testRecipient.trim()) {
      toast.error(t("settings.testRecipient"));
      return;
    }
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await testSmtpAction({
        smtp: form.smtp,
        testRecipient: testRecipient.trim(),
      });
      if (res.ok) {
        setTestResult({ ok: true, message: t("settings.testSuccess") });
        toast.success(t("settings.testSuccess"));
      } else {
        const msg = res.error.message || (res.error.fieldErrors ? JSON.stringify(res.error.fieldErrors) : t("settings.testFailed"));
        setTestResult({ ok: false, message: msg });
        toast.error(`${t("settings.testFailed")}${msg}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestResult({ ok: false, message: msg });
      toast.error(`${t("settings.testFailed")}${msg}`);
    } finally {
      setTestingSmtp(false);
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>

            <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("common.optional")} error={errors.logoUrl?.[0]}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="s-logo"
                    type="text"
                    placeholder="https://... หรือ /uploads/logos/..."
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    className="flex-1 min-w-[200px]"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading || pending}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("settings.uploading")}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>{t("settings.uploadLogo")}</span>
                      </>
                    )}
                  </Button>
                </div>

                {form.logoUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 w-fit">
                    <div className="relative w-12 h-12 rounded-md border bg-background flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <ImageIcon className="h-5 w-5 text-muted-foreground -z-10 absolute" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">{t("settings.previewLogo")}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">{form.logoUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm({ ...form, logoUrl: "" })}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title={t("settings.removeLogo")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </LiyonField>
          </div>
        </LiyonCard>

        {/* ── SMTP / Gmail Settings Card ── */}
        <LiyonCard>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-primary" />
            <h2>{t("settings.smtpTitle")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t("settings.smtpDesc")}</p>

          <div className="space-y-5">
            <LiyonSwitchRow
              id="s-smtp-enabled"
              checked={form.smtp.enabled}
              onCheckedChange={(checked) => updateSmtp("enabled", checked)}
              label={t("settings.smtpEnable")}
              description={t("settings.smtpDesc")}
            />

            {form.smtp.enabled && (
              <div className="space-y-5 pt-2 border-t">
                {/* Provider Selection */}
                <LiyonField label={t("settings.smtpProvider")} htmlFor="s-smtp-provider">
                  <LiyonSelect
                    id="s-smtp-provider"
                    value={form.smtp.provider}
                    onChange={(e) => updateSmtp("provider", e.target.value as "gmail" | "custom")}
                  >
                    <option value="gmail">{t("settings.smtpProviderGmail")}</option>
                    <option value="custom">{t("settings.smtpProviderCustom")}</option>
                  </LiyonSelect>
                </LiyonField>

                {/* Gmail Guidance Banner */}
                {form.smtp.provider === "gmail" && (
                  <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900/50 dark:bg-sky-950/20 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium text-sky-800 dark:text-sky-300">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>{t("settings.gmailHelpTitle")}</span>
                    </div>
                    <ul className="list-none space-y-1 text-xs text-sky-700 dark:text-sky-400 pl-6">
                      <li>{t("settings.gmailHelp1")}</li>
                      <li>{t("settings.gmailHelp2")}</li>
                      <li>{t("settings.gmailHelp3")}</li>
                    </ul>
                  </div>
                )}

                {/* Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LiyonField
                    label={form.smtp.provider === "gmail" ? t("settings.gmailAccount") : t("settings.smtpUser")}
                    htmlFor="s-smtp-user"
                    hint={form.smtp.provider === "gmail" ? "example@gmail.com" : undefined}
                    error={errors["smtp.user"]?.[0]}
                  >
                    <input
                      id="s-smtp-user"
                      type="text"
                      placeholder={form.smtp.provider === "gmail" ? "user@gmail.com" : "username or user@domain.com"}
                      value={form.smtp.user}
                      onChange={(e) => updateSmtp("user", e.target.value)}
                    />
                  </LiyonField>

                  <LiyonField
                    label={form.smtp.provider === "gmail" ? t("settings.gmailAppPassword") : t("settings.smtpPass")}
                    htmlFor="s-smtp-pass"
                    hint={form.smtp.provider === "gmail" ? "16 ตัวอักษร เช่น abcd efgh ijkl mnop" : undefined}
                    error={errors["smtp.pass"]?.[0]}
                  >
                    <input
                      id="s-smtp-pass"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••••••••••"
                      value={form.smtp.pass}
                      onChange={(e) => updateSmtp("pass", e.target.value)}
                    />
                  </LiyonField>
                </div>

                {/* Sender Name and Sender Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LiyonField label={t("settings.fromName")} htmlFor="s-smtp-from-name" hint={t("common.optional")}>
                    <input
                      id="s-smtp-from-name"
                      type="text"
                      placeholder={form.nameTh || form.nameEn || "My Organization"}
                      value={form.smtp.fromName}
                      onChange={(e) => updateSmtp("fromName", e.target.value)}
                    />
                  </LiyonField>

                  <LiyonField
                    label={t("settings.fromEmail")}
                    htmlFor="s-smtp-from-email"
                    hint={form.smtp.provider === "gmail" ? "เว้นว่างเพื่อใช้อีเมลบัญชี Gmail เดียวกัน" : t("common.optional")}
                  >
                    <input
                      id="s-smtp-from-email"
                      type="email"
                      placeholder={form.smtp.user || "noreply@domain.com"}
                      value={form.smtp.fromEmail}
                      onChange={(e) => updateSmtp("fromEmail", e.target.value)}
                    />
                  </LiyonField>
                </div>

                {/* Custom Server Host & Port */}
                {form.smtp.provider === "custom" && (
                  <div className="space-y-4 pt-2 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <LiyonField label={t("settings.smtpHost")} htmlFor="s-smtp-host">
                          <input
                            id="s-smtp-host"
                            type="text"
                            placeholder="mail.example.com"
                            value={form.smtp.host}
                            onChange={(e) => updateSmtp("host", e.target.value)}
                          />
                        </LiyonField>
                      </div>
                      <div>
                        <LiyonField label={t("settings.smtpPort")} htmlFor="s-smtp-port">
                          <input
                            id="s-smtp-port"
                            type="number"
                            placeholder="587 / 465"
                            value={form.smtp.port}
                            onChange={(e) => updateSmtp("port", Number(e.target.value) || 587)}
                          />
                        </LiyonField>
                      </div>
                    </div>
                    <LiyonSwitchRow
                      id="s-smtp-secure"
                      checked={form.smtp.secure}
                      onCheckedChange={(checked) => updateSmtp("secure", checked)}
                      label={t("settings.smtpSecure")}
                      description="เปิดใช้งานสำหรับ Port 465 (SSL) หรือปิดสำหรับ Port 587 (STARTTLS)"
                    />
                  </div>
                )}

                {/* Test Connection Section */}
                <div className="mt-4 rounded-lg border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Send className="h-4 w-4 text-primary" />
                    <span>{t("settings.testEmailTitle")}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="flex-1 min-w-[220px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={testingSmtp || !form.smtp.user || !form.smtp.pass}
                      onClick={handleTestSmtp}
                      className="gap-1.5"
                    >
                      {testingSmtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t("settings.testing")}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>{t("settings.btnTest")}</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {testResult && (
                    <div
                      className={`flex items-start gap-2 p-3 rounded-md text-xs ${
                        testResult.ok
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      {testResult.ok ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      )}
                      <div className="break-all">{testResult.message}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </LiyonCard>

        <LiyonCard>
          <h2>{t("settings.contactTitle")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("settings.contactDesc")}</p>
          <div className="fields">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("settings.addressTh")} htmlFor="s-address-th" error={errors["contact.addressTh"]?.[0]}>
                <input
                  id="s-address-th"
                  type="text"
                  placeholder="เช่น อาคารคณะการจัดการและเทคโนโลยีสารสนเทศ"
                  value={form.contact.addressTh || ""}
                  onChange={(e) => updateContact("addressTh", e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("settings.addressEn")} htmlFor="s-address-en" error={errors["contact.addressEn"]?.[0]}>
                <input
                  id="s-address-en"
                  type="text"
                  placeholder="e.g. Faculty of Management & IT Building"
                  value={form.contact.addressEn || ""}
                  onChange={(e) => updateContact("addressEn", e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("settings.phone")} htmlFor="s-phone" error={errors["contact.phone"]?.[0]}>
                <input
                  id="s-phone"
                  type="text"
                  placeholder="เช่น 0-2xxx-xxxx ต่อ 1000-1005"
                  value={form.contact.phone || ""}
                  onChange={(e) => updateContact("phone", e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("settings.email")} htmlFor="s-email" error={errors["contact.email"]?.[0]}>
                <input
                  id="s-email"
                  type="email"
                  placeholder="เช่น info@faculty.university.ac.th"
                  value={form.contact.email || ""}
                  onChange={(e) => updateContact("email", e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("settings.officeHoursTh")} htmlFor="s-hours-th" error={errors["contact.officeHoursTh"]?.[0]}>
                <input
                  id="s-hours-th"
                  type="text"
                  placeholder="เช่น จันทร์ - ศุกร์: 08:30 - 16:30 น."
                  value={form.contact.officeHoursTh || ""}
                  onChange={(e) => updateContact("officeHoursTh", e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("settings.officeHoursEn")} htmlFor="s-hours-en" error={errors["contact.officeHoursEn"]?.[0]}>
                <input
                  id="s-hours-en"
                  type="text"
                  placeholder="e.g. Mon - Fri: 08:30 AM - 04:30 PM"
                  value={form.contact.officeHoursEn || ""}
                  onChange={(e) => updateContact("officeHoursEn", e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("settings.mapUrl")} htmlFor="s-map" hint={t("common.optional")}>
                <input
                  id="s-map"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={form.contact.mapUrl || ""}
                  onChange={(e) => updateContact("mapUrl", e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("settings.facebookUrl")} htmlFor="s-fb" hint={t("common.optional")}>
                <input
                  id="s-fb"
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={form.contact.facebookUrl || ""}
                  onChange={(e) => updateContact("facebookUrl", e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("settings.websiteUrl")} htmlFor="s-web" hint={t("common.optional")}>
                <input
                  id="s-web"
                  type="url"
                  placeholder="https://fms.university.ac.th"
                  value={form.contact.websiteUrl || ""}
                  onChange={(e) => updateContact("websiteUrl", e.target.value)}
                />
              </LiyonField>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>
        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}

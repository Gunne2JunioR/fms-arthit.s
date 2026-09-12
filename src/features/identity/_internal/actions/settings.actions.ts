"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testSmtpSchema, testGeminiSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, type TenantSettings } from "../services/tenant.service";
import { testSmtpConnection } from "@/shared/lib/infra/mailer";

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}
export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function testSmtpAction(input: unknown): Promise<ActionResult<{ success: boolean; message?: string }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const data = testSmtpSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const { smtp, testRecipient } = data;

    const host = smtp.provider === "gmail" ? "smtp.gmail.com" : smtp.host;
    const port = smtp.provider === "gmail" ? (smtp.port || 465) : smtp.port;
    const secure = smtp.provider === "gmail" ? (port === 465) : smtp.secure;
    const from = smtp.fromEmail
      ? smtp.fromName ? `"${smtp.fromName}" <${smtp.fromEmail}>` : smtp.fromEmail
      : (smtp.fromName ? `"${smtp.fromName}" <${smtp.user}>` : smtp.user);

    const res = await testSmtpConnection(
      {
        host,
        port,
        secure,
        user: smtp.user,
        pass: smtp.pass,
        from,
      },
      testRecipient
    );

    if (!res.ok) {
      throw new Error(res.message || "การเชื่อมต่อ SMTP ล้มเหลว กรุณาตรวจสอบอีเมลและรหัสผ่านแอป");
    }

    return { success: true };
  });
}

export async function testGeminiAction(input: unknown): Promise<ActionResult<{ success: boolean; model: string; responseSample: string }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const data = testGeminiSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const { apiKey, model } = data;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Respond only with: 'Google Gemini API is connected successfully!'" }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const message = errData?.error?.message || `HTTP ${res.status}: ไม่สามารถเชื่อมต่อกับ Gemini API ได้`;
      throw new Error(message);
    }

    const json = await res.json().catch(() => ({}));
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "OK";

    return {
      success: true,
      model,
      responseSample: text,
    };
  });
}

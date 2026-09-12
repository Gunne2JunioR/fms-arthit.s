import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import type { SmtpConfig, ContactConfig, GeminiConfig, UpdateSettingsInput } from "../validations/settings";

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: SmtpConfig | null;
  contact?: ContactConfig | null;
  gemini?: GeminiConfig | null;
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const settingsObj = (t.settings as { palette?: unknown; smtp?: unknown; contact?: unknown; gemini?: unknown }) || {};
  const p = settingsObj.palette;
  const smtp = (settingsObj.smtp as SmtpConfig) || null;
  const contact = (settingsObj.contact as ContactConfig) || null;
  const gemini = (settingsObj.gemini as GeminiConfig) || null;
  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    smtp,
    contact,
    gemini,
  };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

export async function getTenantSmtp(tenantId: string): Promise<SmtpConfig | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings as { smtp?: SmtpConfig } | null)?.smtp;
  return s?.enabled && s.user && s.pass ? s : null;
}

export async function getTenantGemini(tenantId: string): Promise<GeminiConfig | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const g = (t?.settings as { gemini?: GeminiConfig } | null)?.gemini;
  if (g?.apiKey) return g;
  // Fallback to process.env.GEMINI_API_KEY if present
  if (process.env.GEMINI_API_KEY) {
    return {
      enabled: true,
      apiKey: process.env.GEMINI_API_KEY,
      model: g?.model || "gemini-2.5-flash",
    };
  }
  return null;
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge เฉพาะ palette, smtp, contact, และ gemini ที่เปลี่ยน ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // อ่านผ่าน tx เดียวกัน ไม่ใช่ client กลาง — ไม่งั้นทรานแซกชันนี้กินคอนเนกชันจากพูลเพิ่มอีกเส้นเพื่ออ่าน
    // ค่าเดิม และค่าที่อ่านได้ก็อยู่นอกสแนปช็อตของทรานแซกชัน (ค่า before ของ audit อาจไม่ตรงกับที่กำลังจะทับ)
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const prevSettings = (t.settings as object) || {};
    const newSettings = {
      ...prevSettings,
      palette: input.palette,
      ...(input.smtp !== undefined ? { smtp: input.smtp } : {}),
      ...(input.contact !== undefined ? { contact: input.contact } : {}),
      ...(input.gemini !== undefined ? { gemini: input.gemini } : {}),
    };
    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: newSettings,
      },
    });
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: input.tenantId, before, after: input }, tx);
  });
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

/** ดึง tenantId สำหรับ public request หรือตอนยังไม่มี session: เลือกรหัส DEMO ก่อน หรือ tenant ที่ active */
async function fallbackTenantId(): Promise<string | null> {
  const demo = await prisma.tenant.findUnique({ where: { code: "DEMO" }, select: { id: true, isActive: true } });
  if (demo && demo.isActive) return demo.id;
  const first = await prisma.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } });
  return first?.id ?? null;
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId = (await sessionTenantId()) || (await fallbackTenantId());
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});

/** ดึงการตั้งค่าองค์กร (ชื่อ, โลโก้, ธีม) ของ tenant ปัจจุบัน หรือ tenant แรกของระบบ · ไม่ throw */
export const resolveTenantSettings = cache(async (): Promise<TenantSettings | null> => {
  try {
    const tenantId = (await sessionTenantId()) || (await fallbackTenantId());
    return tenantId ? await getTenantSettings(tenantId) : null;
  } catch {
    return null;
  }
});


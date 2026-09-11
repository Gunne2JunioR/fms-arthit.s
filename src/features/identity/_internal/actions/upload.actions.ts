"use server";

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { requirePermission } from "../rbac";
import { P } from "../../permissions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new Error("กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("ขนาดไฟล์ต้องไม่เกิน 5 MB");
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error("รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, WebP, SVG, GIF)");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // สร้างชื่อไฟล์ที่ปลอดภัยและไม่ชนกัน
    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "png";
    const cleanExt = ["png", "jpg", "jpeg", "webp", "svg", "gif"].includes(ext) ? ext : "png";
    const filename = `logo-${ctx.tenantId.slice(0, 8)}-${Date.now()}.${cleanExt}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/logos/${filename}`;
    return { url: publicUrl };
  });
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const { requireSession } = await import("../session");
    const ctx = await requireSession();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new Error("กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("ขนาดไฟล์ต้องไม่เกิน 5 MB");
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error("รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, WebP, SVG, GIF)");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "png";
    const cleanExt = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext) ? ext : "png";
    const filename = `avatar-${ctx.userId.slice(0, 8)}-${Date.now()}.${cleanExt}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${filename}`;
    return { url: publicUrl };
  });
}

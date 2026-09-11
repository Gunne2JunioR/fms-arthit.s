"use server";

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { requirePermission } from "../rbac";
import { P } from "../../permissions";

// ══════════════════════════════════════════════════════════════════════════════
// Supported Formats: Pictures & Movies (Comprehensive MIME & Extension Mappings)
// ══════════════════════════════════════════════════════════════════════════════

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const ALLOWED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
  "video/mpeg",
  "video/ogg",
  "video/3gpp",
  "video/3gpp2",
  "video/x-flv",
  "video/x-ms-wmv",
]);

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_MEDIA_FILE_SIZE = 100 * 1024 * 1024; // 100 MB for Movies / Videos

// Safe Extension Resolver
function resolveSafeExtension(file: File, defaultFallback: string): string {
  const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
  if (extMatch) {
    const rawExt = extMatch[1].toLowerCase();
    const validExts = [
      // Pictures
      "png", "jpg", "jpeg", "webp", "svg", "gif", "avif", "heic", "heif", "bmp", "tiff", "ico",
      // Movies / Videos
      "mp4", "webm", "mov", "avi", "mkv", "mpeg", "mpg", "ogv", "3gp", "flv", "wmv", "m4v",
    ];
    if (validExts.includes(rawExt)) return rawExt;
  }

  // Fallback by MIME type
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "image/x-icon": "ico",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "video/x-matroska": "mkv",
    "video/mpeg": "mpg",
    "video/ogg": "ogv",
    "video/3gpp": "3gp",
    "video/x-flv": "flv",
    "video/x-ms-wmv": "wmv",
  };
  return mimeMap[file.type] || defaultFallback;
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new Error("กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด");
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      throw new Error("ขนาดไฟล์รูปภาพต้องไม่เกิน 10 MB");
    }

    const ext = resolveSafeExtension(file, "png");
    const isAllowedImage = ALLOWED_IMAGE_MIME_TYPES.has(file.type) ||
      ["png", "jpg", "jpeg", "webp", "svg", "gif", "avif", "heic", "heif", "bmp", "tiff", "ico"].includes(ext);

    if (!isAllowedImage) {
      throw new Error("รองรับไฟล์ภาพทุกประเภท (PNG, JPG, WebP, SVG, GIF, AVIF, HEIC, BMP, TIFF, ICO)");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `logo-${ctx.tenantId.slice(0, 8)}-${Date.now()}.${ext}`;

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

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      throw new Error("ขนาดไฟล์รูปภาพต้องไม่เกิน 10 MB");
    }

    const ext = resolveSafeExtension(file, "png");
    const isAllowedImage = ALLOWED_IMAGE_MIME_TYPES.has(file.type) ||
      ["png", "jpg", "jpeg", "webp", "gif", "avif", "heic", "heif", "bmp", "tiff", "ico", "svg"].includes(ext);

    if (!isAllowedImage) {
      throw new Error("รองรับไฟล์ภาพทุกประเภท (PNG, JPG, WebP, GIF, AVIF, HEIC, BMP, TIFF, SVG)");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `avatar-${ctx.userId.slice(0, 8)}-${Date.now()}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${filename}`;
    return { url: publicUrl };
  });
}

export async function uploadMediaAction(formData: FormData): Promise<ActionResult<{ url: string; type: "video" | "image" }>> {
  return runAction(async () => {
    const { requireSession } = await import("../session");
    const ctx = await requireSession();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new Error("กรุณาเลือกไฟล์สื่อที่ต้องการอัปโหลด");
    }

    if (file.size > MAX_MEDIA_FILE_SIZE) {
      throw new Error("ขนาดไฟล์สื่อต้องไม่เกิน 100 MB");
    }

    const ext = resolveSafeExtension(file, "mp4");
    const isVideo = ALLOWED_VIDEO_MIME_TYPES.has(file.type) ||
      file.type.startsWith("video/") ||
      ["mp4", "webm", "mov", "avi", "mkv", "mpeg", "mpg", "ogv", "3gp", "flv", "wmv", "m4v"].includes(ext);

    const isImage = ALLOWED_IMAGE_MIME_TYPES.has(file.type) ||
      file.type.startsWith("image/") ||
      ["png", "jpg", "jpeg", "webp", "svg", "gif", "avif", "heic", "heif", "bmp", "tiff", "ico"].includes(ext);

    if (!isVideo && !isImage) {
      throw new Error("รองรับไฟล์รูปภาพและไฟล์ภาพยนตร์/วิดีโอทุกประเภท (.mp4, .webm, .mov, .avi, .mkv, .jpg, .png, ฯลฯ)");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const subfolder = isVideo ? "videos" : "images";
    const filename = `media-${ctx.userId.slice(0, 8)}-${Date.now()}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", subfolder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subfolder}/${filename}`;
    return {
      url: publicUrl,
      type: isVideo ? "video" : "image",
    };
  });
}



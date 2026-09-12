import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit, getTenantGemini } from "@/features/identity/server";
import type {
  CreateArticleInput,
  UpdateArticleInput,
  ChangeArticleStatusInput,
  TranslateArticleInput,
} from "./validations";

export interface ArticleCategoryDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  slug: string;
}

export interface ArticleDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryNameTh: string;
  categoryNameEn: string;
  categorySlug: string;
  authorId: string;
  authorName: string;
  title: string;
  titleEn: string | null;
  slug: string;
  excerpt: string | null;
  excerptEn: string | null;
  content: string;
  contentEn: string | null;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TranslateArticleResult {
  titleEn: string;
  excerptEn: string;
  contentEn: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listCategories(tenantId?: string): Promise<ArticleCategoryDto[]> {
  const where = tenantId?.trim() ? { tenantId } : {};
  const categories = await prisma.articleCategory.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  return categories.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
  }));
}

export async function listAdminArticles(
  tenantId: string,
  filter?: { categoryId?: string; status?: string; search?: string },
): Promise<ArticleDto[]> {
  const where: Record<string, unknown> = { tenantId };
  if (filter?.categoryId) where.categoryId = filter.categoryId;
  if (filter?.status && filter.status !== "all") where.status = filter.status;
  if (filter?.search) {
    where.OR = [
      { title: { contains: filter.search, mode: "insensitive" } },
      { titleEn: { contains: filter.search, mode: "insensitive" } },
      { excerpt: { contains: filter.search, mode: "insensitive" } },
      { excerptEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categorySlug: a.category.slug,
    authorId: a.authorId,
    authorName: a.author.name,
    title: a.title,
    titleEn: a.titleEn,
    slug: a.slug,
    excerpt: a.excerpt,
    excerptEn: a.excerptEn,
    content: a.content,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    status: a.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function listPublishedArticles(
  tenantId?: string,
  filter?: { categoryId?: string; search?: string; limit?: number; onlyPinned?: boolean },
): Promise<ArticleDto[]> {
  const now = new Date();
  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    publishedAt: { lte: now },
  };
  if (tenantId) where.tenantId = tenantId;
  if (filter?.categoryId) where.categoryId = filter.categoryId;
  if (filter?.onlyPinned) where.isPinned = true;
  if (filter?.search) {
    where.OR = [
      { title: { contains: filter.search, mode: "insensitive" } },
      { titleEn: { contains: filter.search, mode: "insensitive" } },
      { excerpt: { contains: filter.search, mode: "insensitive" } },
      { excerptEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    take: filter?.limit,
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categorySlug: a.category.slug,
    authorId: a.authorId,
    authorName: a.author.name,
    title: a.title,
    titleEn: a.titleEn,
    slug: a.slug,
    excerpt: a.excerpt,
    excerptEn: a.excerptEn,
    content: a.content,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    status: a.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function getArticleBySlug(
  slug: string,
  tenantId?: string,
  incrementView = false,
): Promise<ArticleDto | null> {
  const where: Record<string, unknown> = { slug };
  if (tenantId) where.tenantId = tenantId;

  if (incrementView) {
    await prisma.article.updateMany({
      where,
      data: { viewCount: { increment: 1 } },
    });
  }

  const a = await prisma.article.findFirst({
    where,
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  });

  if (!a) return null;

  return {
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categorySlug: a.category.slug,
    authorId: a.authorId,
    authorName: a.author.name,
    title: a.title,
    titleEn: a.titleEn,
    slug: a.slug,
    excerpt: a.excerpt,
    excerptEn: a.excerptEn,
    content: a.content,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    status: a.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function createArticle(
  tenantId: string,
  authorId: string,
  input: CreateArticleInput,
  ip?: string | null,
): Promise<ArticleDto> {
  let finalSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!finalSlug) finalSlug = `article-${Date.now()}`;

  // ตรวจสอบว่า slug ซ้ำหรือไม่ ถ้าซ้ำให้ต่อท้ายด้วย timestamp สั้น
  const existing = await prisma.article.findUnique({
    where: { tenantId_slug: { tenantId, slug: finalSlug } },
  });
  if (existing) {
    finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
  }

  const publishedAt = input.status === "PUBLISHED"
    ? (input.publishedAt ? new Date(input.publishedAt) : new Date())
    : (input.publishedAt ? new Date(input.publishedAt) : null);

  const created = await prisma.article.create({
    data: {
      tenantId,
      authorId,
      categoryId: input.categoryId,
      title: input.title,
      titleEn: input.titleEn ?? null,
      slug: finalSlug,
      excerpt: input.excerpt ?? null,
      excerptEn: input.excerptEn ?? null,
      content: input.content,
      contentEn: input.contentEn ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      status: input.status,
      isPinned: input.isPinned,
      publishedAt,
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId: authorId,
    action: "article.create",
    entity: "article",
    entityId: created.id,
    after: { title: created.title, titleEn: created.titleEn, slug: created.slug, status: created.status },
    ip,
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    categoryId: created.categoryId,
    categoryNameTh: created.category.nameTh,
    categoryNameEn: created.category.nameEn,
    categorySlug: created.category.slug,
    authorId: created.authorId,
    authorName: created.author.name,
    title: created.title,
    titleEn: created.titleEn,
    slug: created.slug,
    excerpt: created.excerpt,
    excerptEn: created.excerptEn,
    content: created.content,
    contentEn: created.contentEn,
    coverImageUrl: created.coverImageUrl,
    status: created.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: created.isPinned,
    viewCount: created.viewCount,
    publishedAt: created.publishedAt ? created.publishedAt.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateArticle(
  tenantId: string,
  actorId: string,
  input: UpdateArticleInput,
  ip?: string | null,
): Promise<ArticleDto> {
  const current = await prisma.article.findUniqueOrThrow({
    where: { id: input.id, tenantId },
  });

  let finalSlug = input.slug ? slugify(input.slug) : current.slug;
  if (finalSlug !== current.slug) {
    const existing = await prisma.article.findUnique({
      where: { tenantId_slug: { tenantId, slug: finalSlug } },
    });
    if (existing && existing.id !== input.id) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }
  }

  const publishedAt = input.status === "PUBLISHED"
    ? (input.publishedAt ? new Date(input.publishedAt) : current.publishedAt ?? new Date())
    : (input.publishedAt ? new Date(input.publishedAt) : current.publishedAt);

  const updated = await prisma.article.update({
    where: { id: input.id, tenantId },
    data: {
      categoryId: input.categoryId,
      title: input.title,
      titleEn: input.titleEn ?? null,
      slug: finalSlug,
      excerpt: input.excerpt ?? null,
      excerptEn: input.excerptEn ?? null,
      content: input.content,
      contentEn: input.contentEn ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      status: input.status,
      isPinned: input.isPinned,
      publishedAt,
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "article.update",
    entity: "article",
    entityId: updated.id,
    before: { title: current.title, titleEn: current.titleEn, status: current.status },
    after: { title: updated.title, titleEn: updated.titleEn, status: updated.status },
    ip,
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryNameEn: updated.category.nameEn,
    categorySlug: updated.category.slug,
    authorId: updated.authorId,
    authorName: updated.author.name,
    title: updated.title,
    titleEn: updated.titleEn,
    slug: updated.slug,
    excerpt: updated.excerpt,
    excerptEn: updated.excerptEn,
    content: updated.content,
    contentEn: updated.contentEn,
    coverImageUrl: updated.coverImageUrl,
    status: updated.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: updated.isPinned,
    viewCount: updated.viewCount,
    publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function changeArticleStatus(
  tenantId: string,
  actorId: string,
  input: ChangeArticleStatusInput,
  ip?: string | null,
): Promise<ArticleDto> {
  const current = await prisma.article.findUniqueOrThrow({
    where: { id: input.id, tenantId },
  });

  const publishedAt = input.status === "PUBLISHED" && !current.publishedAt ? new Date() : current.publishedAt;

  const updated = await prisma.article.update({
    where: { id: input.id, tenantId },
    data: {
      status: input.status,
      publishedAt,
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "article.status_change",
    entity: "article",
    entityId: updated.id,
    before: { status: current.status },
    after: { status: updated.status },
    ip,
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryNameEn: updated.category.nameEn,
    categorySlug: updated.category.slug,
    authorId: updated.authorId,
    authorName: updated.author.name,
    title: updated.title,
    titleEn: updated.titleEn,
    slug: updated.slug,
    excerpt: updated.excerpt,
    excerptEn: updated.excerptEn,
    content: updated.content,
    contentEn: updated.contentEn,
    coverImageUrl: updated.coverImageUrl,
    status: updated.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: updated.isPinned,
    viewCount: updated.viewCount,
    publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteArticle(
  tenantId: string,
  actorId: string,
  id: string,
  ip?: string | null,
): Promise<void> {
  const current = await prisma.article.findUniqueOrThrow({
    where: { id, tenantId },
  });

  await prisma.article.delete({
    where: { id, tenantId },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "article.delete",
    entity: "article",
    entityId: id,
    before: { title: current.title, slug: current.slug },
    ip,
  });
}

export async function translateArticleWithGemini(
  tenantId: string,
  input: TranslateArticleInput,
): Promise<TranslateArticleResult> {
  const geminiConfig = await getTenantGemini(tenantId);
  if (!geminiConfig?.apiKey) {
    throw new Error("ยังไม่ได้ตั้งค่า Google Gemini API Key กรุณาไปที่เมนู 'การตั้งค่า' เพื่อใส่ API Key");
  }

  const model = geminiConfig.model || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(geminiConfig.apiKey)}`;

  const prompt = `You are a professional bilingual university news translator and public relations editor.
Translate the following university news article from Thai to professional, polished English suitable for official university communications.
Maintain paragraph breaks and formatting.
Respond ONLY with a valid JSON object without markdown fences, matching this structure:
{
  "titleEn": "English title here",
  "excerptEn": "English excerpt (short summary) here",
  "contentEn": "English full article content here"
}

Thai Source:
Title: ${input.titleTh}
Excerpt: ${input.excerptTh || ""}
Content:
${input.contentTh}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData?.error?.message || `HTTP ${res.status}: ไม่สามารถเรียกใช้ Gemini API ได้`;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await res.json().catch(() => ({}));
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!rawText) {
    throw new Error("ไม่ได้รับผลลัพธ์การแปลจาก Gemini API");
  }

  try {
    // Clean potential markdown wrap if any
    const cleaned = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { titleEn?: string; excerptEn?: string; contentEn?: string };
    return {
      titleEn: parsed.titleEn?.trim() || input.titleTh,
      excerptEn: parsed.excerptEn?.trim() || "",
      contentEn: parsed.contentEn?.trim() || input.contentTh,
    };
  } catch {
    throw new Error("เกิดข้อผิดพลาดในการประมวลผลข้อความ JSON จาก Gemini");
  }
}

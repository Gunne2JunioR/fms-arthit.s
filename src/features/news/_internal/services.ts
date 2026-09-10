import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import type { CreateArticleInput, UpdateArticleInput, ChangeArticleStatusInput } from "./validations";

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
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
      { excerpt: { contains: filter.search, mode: "insensitive" } },
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
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
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
      { excerpt: { contains: filter.search, mode: "insensitive" } },
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
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
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
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
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
      slug: finalSlug,
      excerpt: input.excerpt ?? null,
      content: input.content,
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
    after: { title: created.title, slug: created.slug, status: created.status },
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
    slug: created.slug,
    excerpt: created.excerpt,
    content: created.content,
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
      slug: finalSlug,
      excerpt: input.excerpt ?? null,
      content: input.content,
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
    before: { title: current.title, status: current.status },
    after: { title: updated.title, status: updated.status },
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
    slug: updated.slug,
    excerpt: updated.excerpt,
    content: updated.content,
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
    slug: updated.slug,
    excerpt: updated.excerpt,
    content: updated.content,
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

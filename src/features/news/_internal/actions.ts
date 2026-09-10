"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import {
  createArticleSchema,
  updateArticleSchema,
  changeArticleStatusSchema,
} from "./validations";
import {
  listAdminArticles,
  listCategories,
  createArticle,
  updateArticle,
  changeArticleStatus,
  deleteArticle,
  type ArticleDto,
  type ArticleCategoryDto,
} from "./services";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function getAdminArticlesAction(filter?: {
  categoryId?: string;
  status?: string;
  search?: string;
}): Promise<ActionResult<ArticleDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listAdminArticles(ctx.tenantId, filter);
  });
}

export async function getCategoriesAction(): Promise<ActionResult<ArticleCategoryDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listCategories(ctx.tenantId);
  });
}

export async function createArticleAction(input: unknown): Promise<ActionResult<ArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const parsed = createArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const result = await createArticle(ctx.tenantId, ctx.userId, parsed, ip);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function updateArticleAction(input: unknown): Promise<ActionResult<ArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsEdit);
    const parsed = updateArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const result = await updateArticle(ctx.tenantId, ctx.userId, parsed, ip);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function changeArticleStatusAction(input: unknown): Promise<ActionResult<ArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    const parsed = changeArticleStatusSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const result = await changeArticleStatus(ctx.tenantId, ctx.userId, parsed, ip);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function deleteArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsDelete);
    const ip = await getClientIp();
    await deleteArticle(ctx.tenantId, ctx.userId, id, ip);
    revalidatePath("/news");
    revalidatePath("/");
  });
}

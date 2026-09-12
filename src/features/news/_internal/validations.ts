import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "title_required").max(255),
  titleEn: z.string().max(255).optional(),
  slug: z.string().max(255).optional(),
  categoryId: z.string().uuid(),
  excerpt: z.string().max(1000).optional(),
  excerptEn: z.string().max(1000).optional(),
  content: z.string().min(1, "content_required"),
  contentEn: z.string().optional(),
  coverImageUrl: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().optional(),
});

export const updateArticleSchema = createArticleSchema.extend({
  id: z.string().uuid(),
});

export const changeArticleStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const translateArticleSchema = z.object({
  titleTh: z.string().min(1, "title_required"),
  excerptTh: z.string().optional(),
  contentTh: z.string().min(1, "content_required"),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ChangeArticleStatusInput = z.infer<typeof changeArticleStatusSchema>;
export type TranslateArticleInput = z.infer<typeof translateArticleSchema>;

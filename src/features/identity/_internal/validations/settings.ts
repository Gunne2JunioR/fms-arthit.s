import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const smtpConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.enum(["gmail", "custom"]).default("gmail"),
  host: z.string().trim().max(255).default("smtp.gmail.com"),
  port: z.coerce.number().min(1).max(65535).default(465),
  secure: z.boolean().default(true),
  user: z.string().trim().max(255).default(""),
  pass: z.string().trim().max(255).default(""),
  fromName: z.string().trim().max(255).default(""),
  fromEmail: z.string().trim().max(255).default(""),
});

export const testSmtpSchema = z.object({
  smtp: smtpConfigSchema,
  testRecipient: z.string().trim().email(),
});

export const contactConfigSchema = z.object({
  addressTh: z.string().trim().max(500).default(""),
  addressEn: z.string().trim().max(500).default(""),
  phone: z.string().trim().max(100).default(""),
  email: z.string().trim().max(255).default(""),
  officeHoursTh: z.string().trim().max(200).default(""),
  officeHoursEn: z.string().trim().max(200).default(""),
  mapUrl: z.string().trim().max(500).default(""),
  facebookUrl: z.string().trim().max(500).default(""),
  websiteUrl: z.string().trim().max(500).default(""),
});

export const geminiConfigSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().trim().default(""),
  model: z.string().trim().default("gemini-2.5-flash"),
});

export const testGeminiSchema = z.object({
  apiKey: z.string().trim().min(1, "api_key_required"),
  model: z.string().trim().default("gemini-2.5-flash"),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((val) => val === "" || val.startsWith("/") || /^https?:\/\//.test(val), {
      message: "invalid_url",
    })
    .default(""),
  palette: z.enum(PALETTE_IDS),
  smtp: smtpConfigSchema.optional(),
  contact: contactConfigSchema.optional(),
  gemini: geminiConfigSchema.optional(),
});
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(255),
  locale: z.enum(["th", "en"]),
  imageUrl: z.string().trim().max(500).nullish(),
});
export type SmtpConfig = z.infer<typeof smtpConfigSchema>;
export type ContactConfig = z.infer<typeof contactConfigSchema>;
export type GeminiConfig = z.infer<typeof geminiConfigSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type TestGeminiInput = z.infer<typeof testGeminiSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

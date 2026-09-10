import type { z } from "zod";
import type { Locale } from "./config";

type Issue = z.core.$ZodRawIssue;

const M = {
  invalid_email: { th: "รูปแบบอีเมลไม่ถูกต้อง", en: "Invalid email address", cn: "电子邮件格式无效" },
  required: { th: "กรุณากรอกข้อมูล", en: "Required", cn: "此项必填" },
  too_small: { th: "ต้องมีอย่างน้อย {n} ตัวอักษร", en: "Must be at least {n} characters", cn: "至少需要 {n} 个字符" },
  too_big: { th: "ต้องไม่เกิน {n} ตัวอักษร", en: "Must be at most {n} characters", cn: "不能超过 {n} 个字符" },
  invalid: { th: "ข้อมูลไม่ถูกต้อง", en: "Invalid value", cn: "输入值无效" },
} as const;

const pick = (locale: Locale, k: keyof typeof M, n?: number) => (M[k][locale] || M[k].th).replace("{n}", String(n ?? ""));

/** ใช้เป็น `{ error: zodErrorMap(locale) }` ตอน parse หรือ `z.config({ customError })` ระดับ request */
export function zodErrorMap(locale: Locale) {
  return (issue: Issue): string => {
    switch (issue.code) {
      case "invalid_format":
        return issue.format === "email" ? pick(locale, "invalid_email") : pick(locale, "invalid");
      case "invalid_type":
        return issue.input === undefined ? pick(locale, "required") : pick(locale, "invalid");
      case "too_small":
        return issue.minimum === 1 ? pick(locale, "required") : pick(locale, "too_small", Number(issue.minimum));
      case "too_big":
        return pick(locale, "too_big", Number(issue.maximum));
      default:
        return pick(locale, "invalid");
    }
  };
}

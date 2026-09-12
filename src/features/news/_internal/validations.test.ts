import { describe, it, expect } from "vitest";
import { createArticleSchema, updateArticleSchema, changeArticleStatusSchema } from "./validations";

describe("news validations", () => {
  const dummyCatId = "123e4567-e89b-12d3-a456-426614174000";

  it("validate createArticleSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const valid = {
      title: "ประกาศรับสมัครทุนการศึกษา",
      categoryId: dummyCatId,
      content: "รายละเอียดทุนการศึกษาประจำปี...",
      status: "PUBLISHED" as const,
      isPinned: true,
    };
    const parsed = createArticleSchema.parse(valid);
    expect(parsed.title).toBe("ประกาศรับสมัครทุนการศึกษา");
    expect(parsed.isPinned).toBe(true);
  });

  it("validate createArticleSchema ล้มเมื่อไม่มี title หรือ content", () => {
    expect(() =>
      createArticleSchema.parse({
        title: "",
        categoryId: dummyCatId,
        content: "รายละเอียด...",
      }),
    ).toThrow();

    expect(() =>
      createArticleSchema.parse({
        title: "หัวข้อ",
        categoryId: dummyCatId,
        content: "",
      }),
    ).toThrow();
  });

  it("validate updateArticleSchema ต้องมี uuid", () => {
    const valid = {
      id: dummyCatId,
      title: "แก้ไขหัวข้อ",
      categoryId: dummyCatId,
      content: "เนื้อหาใหม่",
    };
    expect(updateArticleSchema.parse(valid).id).toBe(dummyCatId);
  });

  it("validate changeArticleStatusSchema รองรับเฉพาะสถานะที่กำหนด", () => {
    expect(() =>
      changeArticleStatusSchema.parse({
        id: dummyCatId,
        status: "INVALID_STATUS",
      }),
    ).toThrow();

    expect(
      changeArticleStatusSchema.parse({
        id: dummyCatId,
        status: "PUBLISHED",
      }).status,
    ).toBe("PUBLISHED");
  });

  it("validate createArticleSchema รองรับข้อมูล 2 ภาษา (titleEn, excerptEn, contentEn)", () => {
    const valid = {
      title: "ประกาศรับสมัครนักศึกษาใหม่",
      titleEn: "New Student Admission Announcement",
      categoryId: dummyCatId,
      excerpt: "สรุปรายละเอียด",
      excerptEn: "Summary of admission details",
      content: "รายละเอียด...",
      contentEn: "Full details in English...",
    };
    const parsed = createArticleSchema.parse(valid);
    expect(parsed.titleEn).toBe("New Student Admission Announcement");
    expect(parsed.excerptEn).toBe("Summary of admission details");
    expect(parsed.contentEn).toBe("Full details in English...");
  });
});

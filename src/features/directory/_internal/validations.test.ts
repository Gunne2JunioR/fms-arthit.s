import { describe, it, expect } from "vitest";
import { createStaffSchema, updateStaffSchema } from "./validations";

describe("directory validations", () => {
  const dummyDeptId = "123e4567-e89b-12d3-a456-426614174000";

  it("validate createStaffSchema ผ่านเมื่อข้อมูลครบ", () => {
    const valid = {
      departmentId: dummyDeptId,
      personnelCode: "PERS-001",
      positionName: "อาจารย์ประจำ",
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "สมชาย",
      firstNameEn: "Somchai",
      lastNameTh: "ใจดี",
      lastNameEn: "Jaidee",
      email: "somchai@test.com",
      status: "ACTIVE" as const,
      sortOrder: 1,
      expertise: ["AI"],
    };
    const parsed = createStaffSchema.parse(valid);
    expect(parsed.firstNameTh).toBe("สมชาย");
    expect(parsed.status).toBe("ACTIVE");
    expect(parsed.personnelCode).toBe("PERS-001");
  });

  it("validate createStaffSchema ล้มเมื่ออีเมลไม่ถูกต้อง", () => {
    expect(() =>
      createStaffSchema.parse({
        departmentId: dummyDeptId,
        personnelCode: "PERS-001",
        positionName: "อาจารย์ประจำ",
        academicTitleTh: "ดร.",
        academicTitleEn: "Dr.",
        firstNameTh: "สมชาย",
        firstNameEn: "Somchai",
        lastNameTh: "ใจดี",
        lastNameEn: "Jaidee",
        email: "not-an-email",
      }),
    ).toThrow();
  });

  it("validate updateStaffSchema ต้องการ uuid", () => {
    const valid = {
      id: dummyDeptId,
      departmentId: dummyDeptId,
      personnelCode: "PERS-001",
      positionName: "อาจารย์ประจำ",
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "สมชาย",
      firstNameEn: "Somchai",
      lastNameTh: "ใจดี",
      lastNameEn: "Jaidee",
      email: "somchai@test.com",
    };
    expect(updateStaffSchema.parse(valid).id).toBe(dummyDeptId);
  });
});

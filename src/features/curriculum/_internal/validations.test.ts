import { describe, it, expect } from "vitest";
import { createProgramSchema, createFacultySchema } from "./validations";

describe("curriculum validations", () => {
  it("validates valid program input", () => {
    const valid = {
      facultyId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      code: "CS-BSc",
      nameTh: "วิทยาการคอมพิวเตอร์",
      nameEn: "Computer Science",
      degreeLevel: "BACHELOR" as const,
      degreeNameTh: "วิทยาศาสตรบัณฑิต",
      degreeNameEn: "Bachelor of Science",
      curriculumYear: 2567,
      totalCredits: 128,
      tuitionFeeSemester: 21000,
      durationYears: 4,
    };
    const res = createProgramSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails if curriculum year is out of realistic Buddhist Era range", () => {
    const invalid = {
      facultyId: "11111111-1111-1111-1111-111111111111",
      code: "CS-BSc",
      nameTh: "วิทยาการคอมพิวเตอร์",
      nameEn: "Computer Science",
      degreeNameTh: "วิทยาศาสตรบัณฑิต",
      degreeNameEn: "Bachelor of Science",
      curriculumYear: 2024, // should be BE > 2500
      totalCredits: 128,
    };
    const res = createProgramSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates valid faculty input", () => {
    const valid = {
      code: "FMS",
      nameTh: "คณะวิทยาการจัดการ",
      nameEn: "Faculty of Management Sciences",
      email: "fms@univ.ac.th",
      status: "ACTIVE" as const,
      sortOrder: 1,
    };
    const res = createFacultySchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});

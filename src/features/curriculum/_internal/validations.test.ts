import { describe, it, expect } from "vitest";
import { createProgramSchema } from "./validations";

describe("curriculum validations", () => {
  it("validates valid program input", () => {
    const valid = {
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
});

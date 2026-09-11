import { describe, it, expect } from "vitest";
import { createDocumentRequestSchema, actOnStepSchema } from "./validations";

describe("document validations", () => {
  it("validates valid document creation with multi-steps", () => {
    const valid = {
      docNumber: "MOE0514/2567-001",
      docType: "MEMO_INTERNAL",
      title: "ขออนุมัติจัดโครงการสัมมนาวิชาการ",
      urgency: "URGENT",
      steps: [
        { stepOrder: 1, approverTitle: "หัวหน้าภาควิชา" },
        { stepOrder: 2, approverTitle: "รองคณบดีฝ่ายวิชาการ" },
        { stepOrder: 3, approverTitle: "คณบดีคณะวิทยาการจัดการ" },
      ],
    };
    const res = createDocumentRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails when steps array is empty", () => {
    const invalid = {
      docNumber: "MOE0514/2567-002",
      docType: "MEMO_INTERNAL",
      title: "ขออนุมัติจัดซื้อ",
      steps: [],
    };
    const res = createDocumentRequestSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates step approval action", () => {
    const valid = {
      stepId: "a0000000-0000-4000-8000-000000000001",
      action: "APPROVE",
      comment: "เห็นควรอนุมัติตามเสนอ",
    };
    const res = actOnStepSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { createBookingSchema, updateBookingStatusSchema } from "./validations";

describe("booking validations", () => {
  it("passes when start time is before end time", () => {
    const valid = {
      resourceId: "a0000000-0000-4000-8000-000000000001",
      title: "ประชุมอาจารย์ประจำสาขา",
      attendeeCount: 15,
      startAt: "2026-09-15T09:00:00Z",
      endAt: "2026-09-15T12:00:00Z",
    };
    const res = createBookingSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails when end time is before or equal to start time", () => {
    const invalid = {
      resourceId: "a0000000-0000-4000-8000-000000000001",
      title: "ประชุมอาจารย์",
      attendeeCount: 5,
      startAt: "2026-09-15T12:00:00Z",
      endAt: "2026-09-15T10:00:00Z",
    };
    const res = createBookingSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates updateBookingStatusSchema successfully with valid enum", () => {
    const valid = {
      id: "a0000000-0000-4000-8000-000000000001",
      status: "CONFIRMED",
      note: "อนุมัติเรียบร้อย",
    };
    const res = updateBookingStatusSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails updateBookingStatusSchema with invalid status enum", () => {
    const invalid = {
      id: "a0000000-0000-4000-8000-000000000001",
      status: "UNKNOWN_STATUS",
    };
    const res = updateBookingStatusSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

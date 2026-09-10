import { z } from "zod";

export const createBookingSchema = z.object({
  resourceId: z.string().uuid(),
  title: z.string().min(1).max(255),
  attendeeCount: z.number().int().min(1).default(1),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
  note: z.string().optional(),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  { message: "End time must be after start time", path: ["endAt"] }
);

export const updateBookingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["PENDING_APPROVAL", "CONFIRMED", "REJECTED", "CANCELLED"]),
  note: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

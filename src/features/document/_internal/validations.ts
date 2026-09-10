import { z } from "zod";

export const createDocumentRequestSchema = z.object({
  docNumber: z.string().min(1).max(100),
  docType: z.enum(["MEMO_INTERNAL", "PURCHASE_REQUEST", "LEAVE_REQUEST", "TRAVEL_OFFICIAL"]).default("MEMO_INTERNAL"),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  urgency: z.enum(["NORMAL", "URGENT", "VERY_URGENT"]).default("NORMAL"),
  steps: z.array(
    z.object({
      stepOrder: z.number().int().min(1),
      approverTitle: z.string().min(1).max(100),
      approverUserId: z.string().uuid().optional(),
    })
  ).min(1),
});

export const actOnStepSchema = z.object({
  stepId: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT"]),
  comment: z.string().optional(),
});

export type CreateDocumentRequestInput = z.infer<typeof createDocumentRequestSchema>;
export type ActOnStepInput = z.infer<typeof actOnStepSchema>;

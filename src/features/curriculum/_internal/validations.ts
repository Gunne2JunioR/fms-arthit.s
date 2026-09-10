import { z } from "zod";

export const createProgramSchema = z.object({
  code: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  degreeLevel: z.enum(["BACHELOR", "MASTER", "DOCTORAL", "DIPLOMA"]).default("BACHELOR"),
  degreeNameTh: z.string().min(1).max(255),
  degreeNameEn: z.string().min(1).max(255),
  curriculumYear: z.number().int().min(2500).max(2600),
  totalCredits: z.number().int().min(1),
  tuitionFeeSemester: z.number().min(0).default(0),
  durationYears: z.number().int().min(1).default(4),
  brochureFileUrl: z.string().max(500).optional(),
  description: z.string().optional(),
  status: z.enum(["OPEN_ADMISSION", "ACTIVE", "REVISED", "CLOSED"]).default("ACTIVE"),
});

export const updateProgramSchema = createProgramSchema.extend({
  id: z.string().uuid(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

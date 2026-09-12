import { z } from "zod";

export const academicStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const programStatusEnum = z.enum(["OPEN_ADMISSION", "ACTIVE", "REVISED", "CLOSED", "ARCHIVED"]);
export const programDegreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL", "DIPLOMA"]);

export const createFacultySchema = z.object({
  code: z.string().trim().min(1).max(50),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  shortNameTh: z.string().trim().max(50).optional().nullable(),
  shortNameEn: z.string().trim().max(50).optional().nullable(),
  deanStaffId: z.string().uuid().optional().nullable().or(z.literal("").transform(() => null)),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal("").transform(() => null)),
  phone: z.string().trim().max(50).optional().nullable(),
  website: z.string().trim().max(255).optional().nullable(),
  buildingLocation: z.string().trim().max(255).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  logoUrl: z.string().trim().max(500).optional().nullable(),
  status: academicStatusEnum.default("ACTIVE"),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateFacultySchema = createFacultySchema.extend({
  id: z.string().uuid(),
});

export const createProgramSchema = z.object({
  facultyId: z.string().uuid(),
  departmentId: z.string().uuid().optional().nullable().or(z.literal("").transform(() => null)),
  code: z.string().trim().min(1).max(50),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  degreeLevel: programDegreeLevelEnum.default("BACHELOR"),
  degreeNameTh: z.string().trim().min(1).max(255),
  degreeNameEn: z.string().trim().min(1).max(255),
  degreeShortTh: z.string().trim().max(100).optional().nullable(),
  degreeShortEn: z.string().trim().max(100).optional().nullable(),
  programType: z.string().trim().max(50).optional().nullable(),
  majorName: z.string().trim().max(255).optional().nullable(),
  curriculumYear: z.coerce.number().int().min(2500).max(2600),
  startAcademicYear: z.coerce.number().int().min(2500).max(2600).optional().nullable(),
  studyFormat: z.string().trim().max(50).optional().nullable(),
  instructionLanguage: z.string().trim().max(50).optional().nullable(),
  totalCredits: z.coerce.number().int().min(1),
  tuitionFeeSemester: z.coerce.number().min(0).default(0),
  durationYears: z.coerce.number().int().min(1).default(4),
  brochureFileUrl: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  programDirectorIds: z.array(z.string().uuid()).default([]),
  status: programStatusEnum.default("ACTIVE"),
});

export const updateProgramSchema = createProgramSchema.extend({
  id: z.string().uuid(),
});

export type AcademicStatus = z.infer<typeof academicStatusEnum>;
export type ProgramStatus = z.infer<typeof programStatusEnum>;
export type ProgramDegreeLevel = z.infer<typeof programDegreeLevelEnum>;

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;


import { z } from "zod";

export const createStaffSchema = z.object({
  departmentId: z.string().uuid(),
  academicTitleTh: z.string().min(1).max(50),
  academicTitleEn: z.string().min(1).max(50),
  firstNameTh: z.string().min(1).max(100),
  firstNameEn: z.string().min(1).max(100),
  lastNameTh: z.string().min(1).max(100),
  lastNameEn: z.string().min(1).max(100),
  positionTh: z.string().max(100).optional(),
  positionEn: z.string().max(100).optional(),
  email: z.string().email(),
  phoneExt: z.string().max(50).optional(),
  roomNumber: z.string().max(50).optional(),
  avatarUrl: z.string().max(500).optional(),
  biography: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  status: z.enum(["ACTIVE", "ON_LEAVE", "RESIGNED"]).default("ACTIVE"),
});

export const updateStaffSchema = createStaffSchema.extend({
  id: z.string().uuid(),
});

export const createDepartmentSchema = z.object({
  code: z.string().trim().min(1).max(50),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  description: z.string().trim().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export const deleteDepartmentSchema = z.object({
  id: z.string().uuid(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DeleteDepartmentInput = z.infer<typeof deleteDepartmentSchema>;

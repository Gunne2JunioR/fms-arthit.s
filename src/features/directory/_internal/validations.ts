import { z } from "zod";

export const personnelTypeEnum = z.enum(["EXECUTIVE", "ACADEMIC", "SUPPORT", "CONTRACT", "OTHER"]);
export const employmentStatusEnum = z.enum([
  "ACTIVE",
  "ON_LEAVE_STUDY",
  "ON_LEAVE_SICK",
  "RETIRED",
  "TERMINATED",
  "ARCHIVED",
]);

export const createStaffSchema = z.object({
  departmentId: z.string().uuid(),
  personnelCode: z.string().trim().min(1).max(50),
  prefix: z.string().trim().max(50).optional().nullable(),
  academicTitleTh: z.string().max(50).optional().default(""),
  academicTitleEn: z.string().max(50).optional().default(""),
  firstNameTh: z.string().trim().min(1).max(100),
  firstNameEn: z.string().trim().min(1).max(100),
  lastNameTh: z.string().trim().min(1).max(100),
  lastNameEn: z.string().trim().min(1).max(100),
  gender: z.string().max(20).optional().nullable(),
  birthDate: z.string().optional().nullable(), // YYYY-MM-DD
  citizenId: z.string().max(20).optional().nullable(),
  personnelType: personnelTypeEnum.default("ACADEMIC"),
  employmentStatus: employmentStatusEnum.default("ACTIVE"),
  subDepartmentName: z.string().max(255).optional().nullable(),
  positionName: z.string().trim().min(1).max(100),
  positionTh: z.string().max(100).optional().nullable(),
  positionEn: z.string().max(100).optional().nullable(),
  academicPosition: z.string().max(100).optional().nullable(),
  email: z.string().trim().email(),
  universityEmail: z.string().trim().email().optional().nullable().or(z.literal("")),
  personalEmail: z.string().trim().email().optional().nullable().or(z.literal("")),
  phoneNumber: z.string().max(50).optional().nullable(),
  phoneExt: z.string().max(50).optional().nullable(),
  roomNumber: z.string().max(50).optional().nullable(),
  workLocation: z.string().max(255).optional().nullable(),
  startDate: z.string().optional().nullable(), // YYYY-MM-DD
  endDate: z.string().optional().nullable(), // YYYY-MM-DD
  retirementDate: z.string().optional().nullable(), // YYYY-MM-DD
  avatarUrl: z.string().max(500).optional().nullable(),
  biography: z.string().optional().nullable(),
  expertise: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  status: z.enum(["ACTIVE", "ON_LEAVE", "RESIGNED"]).default("ACTIVE"),
  userId: z.string().uuid().optional().nullable(),
});

export const updateStaffSchema = createStaffSchema.extend({
  id: z.string().uuid(),
});

export const linkUserSchema = z.object({
  personnelId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
});

export const createUserFromPersonnelSchema = z.object({
  personnelId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const changeStatusSchema = z.object({
  personnelId: z.string().uuid(),
  status: employmentStatusEnum,
});

export type PersonnelType = z.infer<typeof personnelTypeEnum>;
export type EmploymentStatus = z.infer<typeof employmentStatusEnum>;
export type LinkUserInput = z.infer<typeof linkUserSchema>;
export type CreateUserFromPersonnelInput = z.infer<typeof createUserFromPersonnelSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;

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

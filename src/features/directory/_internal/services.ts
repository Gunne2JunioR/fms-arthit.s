import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { errors } from "@/shared/lib/errors";
import type {
  CreateStaffInput,
  UpdateStaffInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "./validations";

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description?: string | null;
  programsCount?: number;
  staffCount?: number;
  programs?: {
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    degreeLevel: string;
    status: string;
  }[];
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  departmentCode: string;
  academicTitleTh: string;
  academicTitleEn: string;
  firstNameTh: string;
  firstNameEn: string;
  lastNameTh: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  positionTh: string | null;
  positionEn: string | null;
  email: string;
  phoneExt: string | null;
  roomNumber: string | null;
  avatarUrl: string | null;
  biography: string | null;
  expertise: string[];
  education: string[];
  sortOrder: number;
  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED";
  createdAt: string;
  updatedAt: string;
}

export async function listDepartments(tenantId?: string): Promise<DepartmentDto[]> {
  const where = tenantId?.trim() ? { tenantId } : {};
  const depts = await prisma.department.findMany({
    where,
    orderBy: { code: "asc" },
    include: {
      _count: { select: { programs: true, staffProfiles: true } },
      programs: {
        select: { id: true, code: true, nameTh: true, nameEn: true, degreeLevel: true, status: true },
        orderBy: { code: "asc" },
      },
    },
  });
  return depts.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    programsCount: d._count.programs,
    staffCount: d._count.staffProfiles,
    programs: d.programs,
  }));
}

export async function listStaffProfiles(
  tenantId?: string,
  filter?: { departmentId?: string; search?: string; status?: string },
): Promise<StaffProfileDto[]> {
  const where: Record<string, unknown> = {};
  if (tenantId?.trim()) where.tenantId = tenantId;
  if (filter?.departmentId) where.departmentId = filter.departmentId;
  if (filter?.status && filter.status !== "all") where.status = filter.status;
  if (filter?.search) {
    where.OR = [
      { firstNameTh: { contains: filter.search, mode: "insensitive" } },
      { lastNameTh: { contains: filter.search, mode: "insensitive" } },
      { firstNameEn: { contains: filter.search, mode: "insensitive" } },
      { lastNameEn: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const staff = await prisma.staffProfile.findMany({
    where,
    include: { department: true },
    orderBy: [{ sortOrder: "asc" }, { firstNameTh: "asc" }],
  });

  return staff.map((s) => ({
    id: s.id,
    tenantId: s.tenantId,
    departmentId: s.departmentId,
    departmentNameTh: s.department.nameTh,
    departmentNameEn: s.department.nameEn,
    departmentCode: s.department.code,
    academicTitleTh: s.academicTitleTh,
    academicTitleEn: s.academicTitleEn,
    firstNameTh: s.firstNameTh,
    firstNameEn: s.firstNameEn,
    lastNameTh: s.lastNameTh,
    lastNameEn: s.lastNameEn,
    fullNameTh: `${s.academicTitleTh} ${s.firstNameTh} ${s.lastNameTh}`.trim(),
    fullNameEn: `${s.academicTitleEn} ${s.firstNameEn} ${s.lastNameEn}`.trim(),
    positionTh: s.positionTh,
    positionEn: s.positionEn,
    email: s.email,
    phoneExt: s.phoneExt,
    roomNumber: s.roomNumber,
    avatarUrl: s.avatarUrl,
    biography: s.biography,
    expertise: Array.isArray(s.expertise) ? (s.expertise as string[]) : [],
    education: Array.isArray(s.education) ? (s.education as string[]) : [],
    sortOrder: s.sortOrder,
    status: s.status as "ACTIVE" | "ON_LEAVE" | "RESIGNED",
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function createStaffProfile(
  tenantId: string,
  actorId: string,
  input: CreateStaffInput,
  ip?: string | null,
): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      academicTitleTh: input.academicTitleTh,
      academicTitleEn: input.academicTitleEn,
      firstNameTh: input.firstNameTh,
      firstNameEn: input.firstNameEn,
      lastNameTh: input.lastNameTh,
      lastNameEn: input.lastNameEn,
      positionTh: input.positionTh ?? null,
      positionEn: input.positionEn ?? null,
      email: input.email.toLowerCase(),
      phoneExt: input.phoneExt ?? null,
      roomNumber: input.roomNumber ?? null,
      avatarUrl: input.avatarUrl ?? null,
      biography: input.biography ?? null,
      expertise: input.expertise,
      sortOrder: input.sortOrder,
      status: input.status,
    },
    include: { department: true },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "staff.create",
    entity: "staff_profile",
    entityId: created.id,
    after: { name: `${created.firstNameTh} ${created.lastNameTh}`, email: created.email },
    ip,
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    departmentId: created.departmentId,
    departmentNameTh: created.department.nameTh,
    departmentNameEn: created.department.nameEn,
    departmentCode: created.department.code,
    academicTitleTh: created.academicTitleTh,
    academicTitleEn: created.academicTitleEn,
    firstNameTh: created.firstNameTh,
    firstNameEn: created.firstNameEn,
    lastNameTh: created.lastNameTh,
    lastNameEn: created.lastNameEn,
    fullNameTh: `${created.academicTitleTh} ${created.firstNameTh} ${created.lastNameTh}`.trim(),
    fullNameEn: `${created.academicTitleEn} ${created.firstNameEn} ${created.lastNameEn}`.trim(),
    positionTh: created.positionTh,
    positionEn: created.positionEn,
    email: created.email,
    phoneExt: created.phoneExt,
    roomNumber: created.roomNumber,
    avatarUrl: created.avatarUrl,
    biography: created.biography,
    expertise: Array.isArray(created.expertise) ? (created.expertise as string[]) : [],
    education: Array.isArray(created.education) ? (created.education as string[]) : [],
    sortOrder: created.sortOrder,
    status: created.status as "ACTIVE" | "ON_LEAVE" | "RESIGNED",
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateStaffProfile(
  tenantId: string,
  actorId: string,
  input: UpdateStaffInput,
  ip?: string | null,
): Promise<StaffProfileDto> {
  const current = await prisma.staffProfile.findUniqueOrThrow({
    where: { id: input.id, tenantId },
  });

  const updated = await prisma.staffProfile.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId,
      academicTitleTh: input.academicTitleTh,
      academicTitleEn: input.academicTitleEn,
      firstNameTh: input.firstNameTh,
      firstNameEn: input.firstNameEn,
      lastNameTh: input.lastNameTh,
      lastNameEn: input.lastNameEn,
      positionTh: input.positionTh ?? null,
      positionEn: input.positionEn ?? null,
      email: input.email.toLowerCase(),
      phoneExt: input.phoneExt ?? null,
      roomNumber: input.roomNumber ?? null,
      avatarUrl: input.avatarUrl ?? null,
      biography: input.biography ?? null,
      expertise: input.expertise,
      sortOrder: input.sortOrder,
      status: input.status,
    },
    include: { department: true },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "staff.update",
    entity: "staff_profile",
    entityId: updated.id,
    before: { name: `${current.firstNameTh} ${current.lastNameTh}` },
    after: { name: `${updated.firstNameTh} ${updated.lastNameTh}` },
    ip,
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    departmentId: updated.departmentId,
    departmentNameTh: updated.department.nameTh,
    departmentNameEn: updated.department.nameEn,
    departmentCode: updated.department.code,
    academicTitleTh: updated.academicTitleTh,
    academicTitleEn: updated.academicTitleEn,
    firstNameTh: updated.firstNameTh,
    firstNameEn: updated.firstNameEn,
    lastNameTh: updated.lastNameTh,
    lastNameEn: updated.lastNameEn,
    fullNameTh: `${updated.academicTitleTh} ${updated.firstNameTh} ${updated.lastNameTh}`.trim(),
    fullNameEn: `${updated.academicTitleEn} ${updated.firstNameEn} ${updated.lastNameEn}`.trim(),
    positionTh: updated.positionTh,
    positionEn: updated.positionEn,
    email: updated.email,
    phoneExt: updated.phoneExt,
    roomNumber: updated.roomNumber,
    avatarUrl: updated.avatarUrl,
    biography: updated.biography,
    expertise: Array.isArray(updated.expertise) ? (updated.expertise as string[]) : [],
    education: Array.isArray(updated.education) ? (updated.education as string[]) : [],
    sortOrder: updated.sortOrder,
    status: updated.status as "ACTIVE" | "ON_LEAVE" | "RESIGNED",
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteStaffProfile(
  tenantId: string,
  actorId: string,
  id: string,
  ip?: string | null,
): Promise<void> {
  const current = await prisma.staffProfile.findUniqueOrThrow({
    where: { id, tenantId },
  });

  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "staff.delete",
    entity: "staff_profile",
    entityId: id,
    before: { name: `${current.firstNameTh} ${current.lastNameTh}`, email: current.email },
    ip,
  });
}

export async function getDepartmentById(tenantId: string, id: string): Promise<DepartmentDto | null> {
  const d = await prisma.department.findUnique({
    where: { id, tenantId },
    include: {
      _count: { select: { programs: true, staffProfiles: true } },
      programs: {
        select: { id: true, code: true, nameTh: true, nameEn: true, degreeLevel: true, status: true },
        orderBy: { code: "asc" },
      },
    },
  });
  if (!d) return null;
  return {
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    programsCount: d._count.programs,
    staffCount: d._count.staffProfiles,
    programs: d.programs,
  };
}

export async function createDepartment(
  tenantId: string,
  actorId: string,
  input: CreateDepartmentInput,
  ip?: string | null,
): Promise<DepartmentDto> {
  const code = input.code.trim().toUpperCase();
  const existing = await prisma.department.findFirst({
    where: { tenantId, code },
  });
  if (existing) throw errors.conflict("department_code_taken");

  const created = await prisma.department.create({
    data: {
      tenantId,
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      description: input.description?.trim() || null,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "department.create",
    entity: "department",
    entityId: created.id,
    after: { code: created.code, nameTh: created.nameTh, nameEn: created.nameEn },
    ip,
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    description: created.description,
    programsCount: 0,
    staffCount: 0,
    programs: [],
  };
}

export async function updateDepartment(
  tenantId: string,
  actorId: string,
  input: UpdateDepartmentInput,
  ip?: string | null,
): Promise<DepartmentDto> {
  const code = input.code.trim().toUpperCase();
  const current = await prisma.department.findUniqueOrThrow({
    where: { id: input.id, tenantId },
  });

  if (code !== current.code) {
    const existing = await prisma.department.findFirst({
      where: { tenantId, code, id: { not: input.id } },
    });
    if (existing) throw errors.conflict("department_code_taken");
  }

  const updated = await prisma.department.update({
    where: { id: input.id, tenantId },
    data: {
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      description: input.description !== undefined ? (input.description?.trim() || null) : current.description,
    },
    include: {
      _count: { select: { programs: true, staffProfiles: true } },
      programs: {
        select: { id: true, code: true, nameTh: true, nameEn: true, degreeLevel: true, status: true },
        orderBy: { code: "asc" },
      },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "department.update",
    entity: "department",
    entityId: updated.id,
    before: { code: current.code, nameTh: current.nameTh, nameEn: current.nameEn },
    after: { code: updated.code, nameTh: updated.nameTh, nameEn: updated.nameEn },
    ip,
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    description: updated.description,
    programsCount: updated._count.programs,
    staffCount: updated._count.staffProfiles,
    programs: updated.programs,
  };
}

export async function deleteDepartment(
  tenantId: string,
  actorId: string,
  id: string,
  ip?: string | null,
): Promise<void> {
  const current = await prisma.department.findUniqueOrThrow({
    where: { id, tenantId },
    include: {
      _count: { select: { programs: true, staffProfiles: true } },
    },
  });

  if (current._count.programs > 0 || current._count.staffProfiles > 0) {
    throw errors.conflict("department_has_relations");
  }

  await prisma.department.delete({
    where: { id, tenantId },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "department.delete",
    entity: "department",
    entityId: id,
    before: { code: current.code, nameTh: current.nameTh },
    ip,
  });
}

import type { Prisma } from "@/generated/prisma";
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
  facultyId?: string | null;
  facultyNameTh?: string | null;
  facultyNameEn?: string | null;
  facultyCode?: string | null;
  headStaffId?: string | null;
  headStaffNameTh?: string | null;
  headStaffNameEn?: string | null;
  code: string;
  nameTh: string;
  nameEn: string;
  shortNameTh?: string | null;
  shortNameEn?: string | null;
  email?: string | null;
  phone?: string | null;
  officeLocation?: string | null;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  sortOrder: number;
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
  userId?: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
    googleEmail?: string | null;
    allowGoogleLogin: boolean;
    isActive: boolean;
  } | null;
  personnelCode: string;
  prefix?: string | null;
  academicTitleTh: string;
  academicTitleEn: string;
  firstNameTh: string;
  firstNameEn: string;
  lastNameTh: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  gender?: string | null;
  birthDate?: string | null;
  citizenId?: string | null;
  personnelType: "EXECUTIVE" | "ACADEMIC" | "SUPPORT" | "CONTRACT" | "OTHER";
  employmentStatus: "ACTIVE" | "ON_LEAVE_STUDY" | "ON_LEAVE_SICK" | "RETIRED" | "TERMINATED" | "ARCHIVED";
  subDepartmentName?: string | null;
  positionName: string;
  positionTh?: string | null;
  positionEn?: string | null;
  academicPosition?: string | null;
  email: string;
  universityEmail?: string | null;
  personalEmail?: string | null;
  phoneNumber?: string | null;
  phoneExt?: string | null;
  roomNumber?: string | null;
  workLocation?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  retirementDate?: string | null;
  avatarUrl?: string | null;
  biography?: string | null;
  expertise: string[];
  education: string[];
  sortOrder: number;
  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED";
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listDepartments(
  tenantId?: string,
  facultyId?: string,
  status?: string,
): Promise<DepartmentDto[]> {
  const where: Prisma.DepartmentWhereInput = {};
  if (tenantId?.trim()) where.tenantId = tenantId;
  if (facultyId && facultyId !== "ALL") where.facultyId = facultyId;
  if (status && status !== "ALL") where.status = status as "ACTIVE" | "INACTIVE" | "ARCHIVED";

  const depts = await prisma.department.findMany({
    where,
    orderBy: [
      { sortOrder: "asc" },
      { code: "asc" },
    ],
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      headStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, prefix: true, academicTitleTh: true, academicTitleEn: true } },
      _count: { select: { programs: true, staffProfiles: true } },
      programs: {
        select: { id: true, code: true, nameTh: true, nameEn: true, degreeLevel: true, status: true },
        orderBy: { code: "asc" },
      },
    },
  });

  return depts.map((d) => {
    const head = d.headStaff;
    const pTh = head ? (head.prefix || head.academicTitleTh || "") : "";
    const pEn = head ? (head.prefix || head.academicTitleEn || "") : "";
    const headNameTh = head ? `${pTh} ${head.firstNameTh} ${head.lastNameTh}`.trim() : null;
    const headNameEn = head ? `${pEn} ${head.firstNameEn} ${head.lastNameEn}`.trim() : null;

    return {
      id: d.id,
      tenantId: d.tenantId,
      facultyId: d.facultyId,
      facultyNameTh: d.faculty?.nameTh ?? null,
      facultyNameEn: d.faculty?.nameEn ?? null,
      facultyCode: d.faculty?.code ?? null,
      headStaffId: d.headStaffId,
      headStaffNameTh: headNameTh,
      headStaffNameEn: headNameEn,
      code: d.code,
      nameTh: d.nameTh,
      nameEn: d.nameEn,
      shortNameTh: d.shortNameTh,
      shortNameEn: d.shortNameEn,
      email: d.email,
      phone: d.phone,
      officeLocation: d.officeLocation,
      description: d.description,
      status: d.status,
      sortOrder: d.sortOrder,
      programsCount: d._count.programs,
      staffCount: d._count.staffProfiles,
      programs: d.programs,
    };
  });
}

type StaffProfileWithRelations = Prisma.StaffProfileGetPayload<{
  include: { department: true; user: true };
}>;

function mapStaffProfile(s: StaffProfileWithRelations): StaffProfileDto {
  const pCode = s.personnelCode || `PERS-${s.id.slice(0, 5).toUpperCase()}`;
  const prefix = s.prefix || s.academicTitleTh || "";
  const posName = s.positionName || s.positionTh || "อาจารย์ประจำ";
  const fullNameTh = prefix ? `${prefix} ${s.firstNameTh} ${s.lastNameTh}`.trim() : `${s.academicTitleTh} ${s.firstNameTh} ${s.lastNameTh}`.trim();
  const fullNameEn = s.academicTitleEn ? `${s.academicTitleEn} ${s.firstNameEn} ${s.lastNameEn}`.trim() : `${s.firstNameEn} ${s.lastNameEn}`.trim();

  return {
    id: s.id,
    tenantId: s.tenantId,
    departmentId: s.departmentId,
    departmentNameTh: s.department?.nameTh ?? "",
    departmentNameEn: s.department?.nameEn ?? "",
    departmentCode: s.department?.code ?? "",
    userId: s.userId,
    user: s.user ? {
      id: s.user.id,
      email: s.user.email,
      name: s.user.name,
      googleEmail: s.user.googleEmail,
      allowGoogleLogin: s.user.allowGoogleLogin,
      isActive: s.user.isActive,
    } : null,
    personnelCode: pCode,
    prefix: s.prefix,
    academicTitleTh: s.academicTitleTh || "",
    academicTitleEn: s.academicTitleEn || "",
    firstNameTh: s.firstNameTh,
    firstNameEn: s.firstNameEn,
    lastNameTh: s.lastNameTh,
    lastNameEn: s.lastNameEn,
    fullNameTh,
    fullNameEn,
    gender: s.gender,
    birthDate: s.birthDate ? s.birthDate.toISOString().slice(0, 10) : null,
    citizenId: s.citizenIdEncrypted ? "***" : null, // Masked for safety
    personnelType: s.personnelType || "ACADEMIC",
    employmentStatus: s.employmentStatus || "ACTIVE",
    subDepartmentName: s.subDepartmentName,
    positionName: posName,
    positionTh: s.positionTh,
    positionEn: s.positionEn,
    academicPosition: s.academicPosition,
    email: s.email,
    universityEmail: s.universityEmail || s.email,
    personalEmail: s.personalEmail,
    phoneNumber: s.phoneNumber,
    phoneExt: s.phoneExt,
    roomNumber: s.roomNumber,
    workLocation: s.workLocation,
    startDate: s.startDate ? s.startDate.toISOString().slice(0, 10) : null,
    endDate: s.endDate ? s.endDate.toISOString().slice(0, 10) : null,
    retirementDate: s.retirementDate ? s.retirementDate.toISOString().slice(0, 10) : null,
    avatarUrl: s.avatarUrl,
    biography: s.biography,
    expertise: Array.isArray(s.expertise) ? (s.expertise as string[]) : [],
    education: Array.isArray(s.education) ? (s.education as string[]) : [],
    sortOrder: s.sortOrder,
    status: s.status as "ACTIVE" | "ON_LEAVE" | "RESIGNED",
    archivedAt: s.archivedAt ? s.archivedAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function listStaffProfiles(
  tenantId?: string,
  filter?: {
    departmentId?: string;
    personnelType?: string;
    employmentStatus?: string;
    status?: string;
    search?: string;
    hasUser?: string;
  },
): Promise<StaffProfileDto[]> {
  const where: Record<string, unknown> = {};
  if (tenantId?.trim()) where.tenantId = tenantId;
  if (filter?.departmentId) where.departmentId = filter.departmentId;
  if (filter?.personnelType && filter.personnelType !== "all") where.personnelType = filter.personnelType;
  if (filter?.employmentStatus && filter.employmentStatus !== "all") where.employmentStatus = filter.employmentStatus;
  if (filter?.status && filter.status !== "all") where.status = filter.status;
  if (filter?.hasUser === "yes") where.userId = { not: null };
  if (filter?.hasUser === "no") where.userId = null;
  if (filter?.search) {
    const q = filter.search.trim();
    where.OR = [
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { firstNameEn: { contains: q, mode: "insensitive" } },
      { lastNameEn: { contains: q, mode: "insensitive" } },
      { personnelCode: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { universityEmail: { contains: q, mode: "insensitive" } },
      { positionName: { contains: q, mode: "insensitive" } },
    ];
  }

  const staff = await prisma.staffProfile.findMany({
    where,
    include: { department: true, user: true },
    orderBy: [{ sortOrder: "asc" }, { personnelCode: "asc" }, { firstNameTh: "asc" }],
  });

  return staff.map(mapStaffProfile);
}

export async function getStaffProfileById(tenantId: string, id: string): Promise<StaffProfileDto | null> {
  const s = await prisma.staffProfile.findUnique({
    where: { id, tenantId },
    include: { department: true, user: true },
  });
  return s ? mapStaffProfile(s) : null;
}

export async function createStaffProfile(
  tenantId: string,
  actorId: string,
  input: CreateStaffInput,
  ip?: string | null,
): Promise<StaffProfileDto> {
  // Check code duplicate
  const existingCode = await prisma.staffProfile.findUnique({
    where: { tenantId_personnelCode: { tenantId, personnelCode: input.personnelCode } },
  });
  if (existingCode) {
    throw errors.conflict("personnel_code_exists");
  }

  // Check user link if provided
  if (input.userId) {
    const existingUser = await prisma.staffProfile.findUnique({
      where: { userId: input.userId },
    });
    if (existingUser) {
      throw errors.conflict("user_already_linked");
    }
  }

  // Map employmentStatus to legacy status if needed
  let legacyStatus: "ACTIVE" | "ON_LEAVE" | "RESIGNED" = "ACTIVE";
  if (input.employmentStatus === "ON_LEAVE_STUDY" || input.employmentStatus === "ON_LEAVE_SICK") {
    legacyStatus = "ON_LEAVE";
  } else if (input.employmentStatus === "TERMINATED" || input.employmentStatus === "RETIRED" || input.employmentStatus === "ARCHIVED") {
    legacyStatus = "RESIGNED";
  }

  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      userId: input.userId || null,
      personnelCode: input.personnelCode,
      prefix: input.prefix || null,
      academicTitleTh: input.academicTitleTh || input.prefix || "",
      academicTitleEn: input.academicTitleEn || "",
      firstNameTh: input.firstNameTh,
      firstNameEn: input.firstNameEn,
      lastNameTh: input.lastNameTh,
      lastNameEn: input.lastNameEn,
      gender: input.gender || null,
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      citizenIdEncrypted: input.citizenId || null,
      personnelType: input.personnelType,
      employmentStatus: input.employmentStatus,
      subDepartmentName: input.subDepartmentName || null,
      positionName: input.positionName,
      positionTh: input.positionTh || input.positionName,
      positionEn: input.positionEn || null,
      academicPosition: input.academicPosition || null,
      email: input.email.toLowerCase(),
      universityEmail: input.universityEmail ? input.universityEmail.toLowerCase() : input.email.toLowerCase(),
      personalEmail: input.personalEmail ? input.personalEmail.toLowerCase() : null,
      phoneNumber: input.phoneNumber || null,
      phoneExt: input.phoneExt || null,
      roomNumber: input.roomNumber || null,
      workLocation: input.workLocation || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      retirementDate: input.retirementDate ? new Date(input.retirementDate) : null,
      avatarUrl: input.avatarUrl || null,
      biography: input.biography || null,
      expertise: input.expertise,
      sortOrder: input.sortOrder,
      status: legacyStatus,
    },
    include: { department: true, user: true },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.create",
    entity: "staff_profile",
    entityId: created.id,
    after: {
      personnelCode: created.personnelCode,
      name: `${created.firstNameTh} ${created.lastNameTh}`,
      email: created.email,
    },
    ip,
  });

  return mapStaffProfile(created);
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

  // Check code duplicate if changed
  if (input.personnelCode !== current.personnelCode) {
    const existing = await prisma.staffProfile.findUnique({
      where: { tenantId_personnelCode: { tenantId, personnelCode: input.personnelCode } },
    });
    if (existing && existing.id !== input.id) {
      throw errors.conflict("personnel_code_exists");
    }
  }

  // Check user link if changed
  if (input.userId && input.userId !== current.userId) {
    const existingUser = await prisma.staffProfile.findUnique({
      where: { userId: input.userId },
    });
    if (existingUser && existingUser.id !== input.id) {
      throw errors.conflict("user_already_linked");
    }
  }

  let legacyStatus: "ACTIVE" | "ON_LEAVE" | "RESIGNED" = current.status;
  if (input.employmentStatus === "ON_LEAVE_STUDY" || input.employmentStatus === "ON_LEAVE_SICK") {
    legacyStatus = "ON_LEAVE";
  } else if (input.employmentStatus === "TERMINATED" || input.employmentStatus === "RETIRED" || input.employmentStatus === "ARCHIVED") {
    legacyStatus = "RESIGNED";
  } else if (input.employmentStatus === "ACTIVE") {
    legacyStatus = "ACTIVE";
  }

  const updated = await prisma.staffProfile.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId,
      userId: input.userId !== undefined ? input.userId : current.userId,
      personnelCode: input.personnelCode,
      prefix: input.prefix || null,
      academicTitleTh: input.academicTitleTh || input.prefix || "",
      academicTitleEn: input.academicTitleEn || "",
      firstNameTh: input.firstNameTh,
      firstNameEn: input.firstNameEn,
      lastNameTh: input.lastNameTh,
      lastNameEn: input.lastNameEn,
      gender: input.gender || null,
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      citizenIdEncrypted: input.citizenId || current.citizenIdEncrypted,
      personnelType: input.personnelType,
      employmentStatus: input.employmentStatus,
      subDepartmentName: input.subDepartmentName || null,
      positionName: input.positionName,
      positionTh: input.positionTh || input.positionName,
      positionEn: input.positionEn || null,
      academicPosition: input.academicPosition || null,
      email: input.email.toLowerCase(),
      universityEmail: input.universityEmail ? input.universityEmail.toLowerCase() : null,
      personalEmail: input.personalEmail ? input.personalEmail.toLowerCase() : null,
      phoneNumber: input.phoneNumber || null,
      phoneExt: input.phoneExt || null,
      roomNumber: input.roomNumber || null,
      workLocation: input.workLocation || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      retirementDate: input.retirementDate ? new Date(input.retirementDate) : null,
      avatarUrl: input.avatarUrl || null,
      biography: input.biography || null,
      expertise: input.expertise,
      sortOrder: input.sortOrder,
      status: legacyStatus,
    },
    include: { department: true, user: true },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.update",
    entity: "staff_profile",
    entityId: updated.id,
    before: { name: `${current.firstNameTh} ${current.lastNameTh}`, code: current.personnelCode },
    after: { name: `${updated.firstNameTh} ${updated.lastNameTh}`, code: updated.personnelCode },
    ip,
  });

  return mapStaffProfile(updated);
}

export async function deleteStaffProfile(
  tenantId: string,
  actorId: string,
  id: string,
  ip?: string | null,
): Promise<{ mode: "deleted" | "archived" }> {
  const current = await prisma.staffProfile.findUniqueOrThrow({
    where: { id, tenantId },
    include: { user: true },
  });

  // If referenced by user or other important relations, perform soft delete / archive
  if (current.userId) {
    await prisma.staffProfile.update({
      where: { id, tenantId },
      data: {
        employmentStatus: "ARCHIVED",
        status: "RESIGNED",
        archivedAt: new Date(),
      },
    });

    await writeAudit({
      tenantId,
      actorId,
      action: "personnel.archive",
      entity: "staff_profile",
      entityId: id,
      before: { name: `${current.firstNameTh} ${current.lastNameTh}` },
      after: { employmentStatus: "ARCHIVED" },
      ip,
    });

    return { mode: "archived" };
  }

  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.delete",
    entity: "staff_profile",
    entityId: id,
    before: { name: `${current.firstNameTh} ${current.lastNameTh}`, email: current.email },
    ip,
  });

  return { mode: "deleted" };
}

export async function linkUserToPersonnel(
  tenantId: string,
  actorId: string,
  personnelId: string,
  userId: string | null,
  ip?: string | null,
): Promise<StaffProfileDto> {
  if (userId) {
    const existing = await prisma.staffProfile.findUnique({
      where: { userId },
    });
    if (existing && existing.id !== personnelId) {
      throw errors.conflict("user_already_linked");
    }
  }

  const updated = await prisma.staffProfile.update({
    where: { id: personnelId, tenantId },
    data: { userId },
    include: { department: true, user: true },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.link_user",
    entity: "staff_profile",
    entityId: personnelId,
    after: { userId },
    ip,
  });

  return mapStaffProfile(updated);
}

export async function changePersonnelStatus(
  tenantId: string,
  actorId: string,
  personnelId: string,
  employmentStatus: "ACTIVE" | "ON_LEAVE_STUDY" | "ON_LEAVE_SICK" | "RETIRED" | "TERMINATED" | "ARCHIVED",
  ip?: string | null,
): Promise<StaffProfileDto> {
  let legacyStatus: "ACTIVE" | "ON_LEAVE" | "RESIGNED" = "ACTIVE";
  if (employmentStatus === "ON_LEAVE_STUDY" || employmentStatus === "ON_LEAVE_SICK") {
    legacyStatus = "ON_LEAVE";
  } else if (employmentStatus === "TERMINATED" || employmentStatus === "RETIRED" || employmentStatus === "ARCHIVED") {
    legacyStatus = "RESIGNED";
  }

  const updated = await prisma.staffProfile.update({
    where: { id: personnelId, tenantId },
    data: {
      employmentStatus,
      status: legacyStatus,
      archivedAt: employmentStatus === "ARCHIVED" ? new Date() : null,
    },
    include: { department: true, user: true },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.change_status",
    entity: "staff_profile",
    entityId: personnelId,
    after: { employmentStatus },
    ip,
  });

  return mapStaffProfile(updated);
}

export async function getDepartmentById(tenantId: string, id: string): Promise<DepartmentDto | null> {
  const d = await prisma.department.findUnique({
    where: { id, tenantId },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      headStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, prefix: true, academicTitleTh: true, academicTitleEn: true } },
      _count: { select: { programs: true, staffProfiles: true } },
      programs: {
        select: { id: true, code: true, nameTh: true, nameEn: true, degreeLevel: true, status: true },
        orderBy: { code: "asc" },
      },
    },
  });
  if (!d) return null;

  const head = d.headStaff;
  const pTh = head ? (head.prefix || head.academicTitleTh || "") : "";
  const pEn = head ? (head.prefix || head.academicTitleEn || "") : "";

  return {
    id: d.id,
    tenantId: d.tenantId,
    facultyId: d.facultyId,
    facultyNameTh: d.faculty?.nameTh ?? null,
    facultyNameEn: d.faculty?.nameEn ?? null,
    facultyCode: d.faculty?.code ?? null,
    headStaffId: d.headStaffId,
    headStaffNameTh: head ? `${pTh} ${head.firstNameTh} ${head.lastNameTh}`.trim() : null,
    headStaffNameEn: head ? `${pEn} ${head.firstNameEn} ${head.lastNameEn}`.trim() : null,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    shortNameTh: d.shortNameTh,
    shortNameEn: d.shortNameEn,
    email: d.email,
    phone: d.phone,
    officeLocation: d.officeLocation,
    description: d.description,
    status: d.status,
    sortOrder: d.sortOrder,
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
      facultyId: input.facultyId || null,
      headStaffId: input.headStaffId || null,
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      shortNameTh: input.shortNameTh?.trim() || null,
      shortNameEn: input.shortNameEn?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      officeLocation: input.officeLocation?.trim() || null,
      description: input.description?.trim() || null,
      status: input.status,
      sortOrder: input.sortOrder,
    },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      headStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, prefix: true, academicTitleTh: true, academicTitleEn: true } },
      _count: { select: { programs: true, staffProfiles: true } },
      programs: { select: { id: true, code: true, nameTh: true, nameEn: true, degreeLevel: true, status: true } },
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

  const head = created.headStaff;
  const pTh = head ? (head.prefix || head.academicTitleTh || "") : "";
  const pEn = head ? (head.prefix || head.academicTitleEn || "") : "";

  return {
    id: created.id,
    tenantId: created.tenantId,
    facultyId: created.facultyId,
    facultyNameTh: created.faculty?.nameTh ?? null,
    facultyNameEn: created.faculty?.nameEn ?? null,
    facultyCode: created.faculty?.code ?? null,
    headStaffId: created.headStaffId,
    headStaffNameTh: head ? `${pTh} ${head.firstNameTh} ${head.lastNameTh}`.trim() : null,
    headStaffNameEn: head ? `${pEn} ${head.firstNameEn} ${head.lastNameEn}`.trim() : null,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    shortNameTh: created.shortNameTh,
    shortNameEn: created.shortNameEn,
    email: created.email,
    phone: created.phone,
    officeLocation: created.officeLocation,
    description: created.description,
    status: created.status,
    sortOrder: created.sortOrder,
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
      facultyId: input.facultyId !== undefined ? (input.facultyId || null) : current.facultyId,
      headStaffId: input.headStaffId !== undefined ? (input.headStaffId || null) : current.headStaffId,
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      shortNameTh: input.shortNameTh !== undefined ? (input.shortNameTh?.trim() || null) : current.shortNameTh,
      shortNameEn: input.shortNameEn !== undefined ? (input.shortNameEn?.trim() || null) : current.shortNameEn,
      email: input.email !== undefined ? (input.email?.trim() || null) : current.email,
      phone: input.phone !== undefined ? (input.phone?.trim() || null) : current.phone,
      officeLocation: input.officeLocation !== undefined ? (input.officeLocation?.trim() || null) : current.officeLocation,
      description: input.description !== undefined ? (input.description?.trim() || null) : current.description,
      status: input.status,
      sortOrder: input.sortOrder,
    },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      headStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, prefix: true, academicTitleTh: true, academicTitleEn: true } },
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

  const head = updated.headStaff;
  const pTh = head ? (head.prefix || head.academicTitleTh || "") : "";
  const pEn = head ? (head.prefix || head.academicTitleEn || "") : "";

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    facultyId: updated.facultyId,
    facultyNameTh: updated.faculty?.nameTh ?? null,
    facultyNameEn: updated.faculty?.nameEn ?? null,
    facultyCode: updated.faculty?.code ?? null,
    headStaffId: updated.headStaffId,
    headStaffNameTh: head ? `${pTh} ${head.firstNameTh} ${head.lastNameTh}`.trim() : null,
    headStaffNameEn: head ? `${pEn} ${head.firstNameEn} ${head.lastNameEn}`.trim() : null,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    shortNameTh: updated.shortNameTh,
    shortNameEn: updated.shortNameEn,
    email: updated.email,
    phone: updated.phone,
    officeLocation: updated.officeLocation,
    description: updated.description,
    status: updated.status,
    sortOrder: updated.sortOrder,
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
): Promise<{ department: DepartmentDto; archived: boolean }> {
  const current = await prisma.department.findUniqueOrThrow({
    where: { id, tenantId },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      headStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, prefix: true, academicTitleTh: true, academicTitleEn: true } },
      _count: { select: { programs: true, staffProfiles: true } },
      programs: {
        select: { id: true, code: true, nameTh: true, nameEn: true, degreeLevel: true, status: true },
        orderBy: { code: "asc" },
      },
    },
  });

  const head = current.headStaff;
  const pTh = head ? (head.prefix || head.academicTitleTh || "") : "";
  const pEn = head ? (head.prefix || head.academicTitleEn || "") : "";
  const deptDto: DepartmentDto = {
    id: current.id,
    tenantId: current.tenantId,
    facultyId: current.facultyId,
    facultyNameTh: current.faculty?.nameTh ?? null,
    facultyNameEn: current.faculty?.nameEn ?? null,
    facultyCode: current.faculty?.code ?? null,
    headStaffId: current.headStaffId,
    headStaffNameTh: head ? `${pTh} ${head.firstNameTh} ${head.lastNameTh}`.trim() : null,
    headStaffNameEn: head ? `${pEn} ${head.firstNameEn} ${head.lastNameEn}`.trim() : null,
    code: current.code,
    nameTh: current.nameTh,
    nameEn: current.nameEn,
    shortNameTh: current.shortNameTh,
    shortNameEn: current.shortNameEn,
    email: current.email,
    phone: current.phone,
    officeLocation: current.officeLocation,
    description: current.description,
    status: current.status,
    sortOrder: current.sortOrder,
    programsCount: current._count.programs,
    staffCount: current._count.staffProfiles,
    programs: current.programs,
  };

  // If referenced by programs or staffProfiles, soft delete to ARCHIVED
  if (current._count.programs > 0 || current._count.staffProfiles > 0) {
    const updated = await prisma.department.update({
      where: { id, tenantId },
      data: { status: "ARCHIVED" },
    });
    await writeAudit({
      tenantId,
      actorId,
      action: "department.archive",
      entity: "department",
      entityId: id,
      before: { code: current.code, nameTh: current.nameTh, status: current.status },
      after: { code: updated.code, nameTh: updated.nameTh, status: updated.status },
      ip,
    });
    return { department: { ...deptDto, status: "ARCHIVED" }, archived: true };
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

  return { department: deptDto, archived: false };
}


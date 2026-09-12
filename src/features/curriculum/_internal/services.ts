import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, ProgramDegreeLevel, ProgramStatus, AcademicStatus } from "@/generated/prisma";
import { errors } from "@/shared/lib/errors";
import type {
  CreateFacultyInput,
  UpdateFacultyInput,
  CreateProgramInput,
  UpdateProgramInput,
} from "./validations";

export interface FacultyDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  shortNameTh?: string | null;
  shortNameEn?: string | null;
  deanStaffId?: string | null;
  deanStaffNameTh?: string | null;
  deanStaffNameEn?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  buildingLocation?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  status: AcademicStatus;
  sortOrder: number;
  departmentsCount?: number;
  programsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramDto {
  id: string;
  tenantId: string;
  facultyId: string | null;
  facultyNameTh?: string | null;
  facultyNameEn?: string | null;
  facultyCode?: string | null;
  departmentId: string | null;
  departmentNameTh?: string | null;
  departmentNameEn?: string | null;
  departmentCode?: string | null;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeLevel: ProgramDegreeLevel;
  degreeNameTh: string;
  degreeNameEn: string;
  degreeShortTh?: string | null;
  degreeShortEn?: string | null;
  programType?: string | null;
  majorName?: string | null;
  curriculumYear: number;
  startAcademicYear?: number | null;
  studyFormat?: string | null;
  instructionLanguage?: string | null;
  totalCredits: number;
  tuitionFeeSemester: number;
  durationYears: number;
  brochureFileUrl: string | null;
  description: string | null;
  programDirectorIds: string[];
  directors?: { id: string; nameTh: string; nameEn: string }[];
  status: ProgramStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramOverviewStats {
  totalFaculties: number;
  totalDepartments: number;
  totalPrograms: number;
  activePrograms: number;
  openPrograms: number;
  byLevel: { level: string; count: number }[];
  byFaculty: { facultyId: string; facultyNameTh: string; facultyNameEn: string; count: number }[];
  byStatus: { status: string; count: number }[];
  recentPrograms: ProgramDto[];
}

type FacultyWithRelations = Prisma.FacultyGetPayload<{
  include: {
    deanStaff: { select: { id: true; firstNameTh: true; lastNameTh: true; firstNameEn: true; lastNameEn: true; academicTitleTh: true; academicTitleEn: true; prefix: true } };
    _count: { select: { departments: true; programs: true } };
  };
}>;

function mapFaculty(f: FacultyWithRelations): FacultyDto {
  const dean = f.deanStaff;
  const prefixTh = dean ? (dean.prefix || dean.academicTitleTh || "") : "";
  const prefixEn = dean ? (dean.prefix || dean.academicTitleEn || "") : "";
  const deanNameTh = dean ? `${prefixTh} ${dean.firstNameTh} ${dean.lastNameTh}`.trim() : null;
  const deanNameEn = dean ? `${prefixEn} ${dean.firstNameEn} ${dean.lastNameEn}`.trim() : null;

  return {
    id: f.id,
    tenantId: f.tenantId,
    code: f.code,
    nameTh: f.nameTh,
    nameEn: f.nameEn,
    shortNameTh: f.shortNameTh,
    shortNameEn: f.shortNameEn,
    deanStaffId: f.deanStaffId,
    deanStaffNameTh: deanNameTh,
    deanStaffNameEn: deanNameEn,
    email: f.email,
    phone: f.phone,
    website: f.website,
    buildingLocation: f.buildingLocation,
    description: f.description,
    logoUrl: f.logoUrl,
    status: f.status,
    sortOrder: f.sortOrder,
    departmentsCount: f._count.departments,
    programsCount: f._count.programs,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

type ProgramWithRelations = Prisma.ProgramGetPayload<{
  include: {
    faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } };
    department: { select: { id: true, code: true, nameTh: true, nameEn: true } };
  };
}>;

function mapProgram(p: ProgramWithRelations, directorMap?: Map<string, { id: string; nameTh: string; nameEn: string }>): ProgramDto {
  const directorIds = Array.isArray(p.programDirectorIds) ? (p.programDirectorIds as string[]) : [];
  const directors = directorMap
    ? directorIds.map((id) => directorMap.get(id)).filter((d): d is { id: string; nameTh: string; nameEn: string } => !!d)
    : [];

  return {
    id: p.id,
    tenantId: p.tenantId,
    facultyId: p.facultyId,
    facultyNameTh: p.faculty?.nameTh ?? null,
    facultyNameEn: p.faculty?.nameEn ?? null,
    facultyCode: p.faculty?.code ?? null,
    departmentId: p.departmentId,
    departmentNameTh: p.department?.nameTh ?? null,
    departmentNameEn: p.department?.nameEn ?? null,
    departmentCode: p.department?.code ?? null,
    code: p.code,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    degreeLevel: p.degreeLevel,
    degreeNameTh: p.degreeNameTh,
    degreeNameEn: p.degreeNameEn,
    degreeShortTh: p.degreeShortTh,
    degreeShortEn: p.degreeShortEn,
    programType: p.programType,
    majorName: p.majorName,
    curriculumYear: p.curriculumYear,
    startAcademicYear: p.startAcademicYear,
    studyFormat: p.studyFormat,
    instructionLanguage: p.instructionLanguage,
    totalCredits: p.totalCredits,
    tuitionFeeSemester: Number(p.tuitionFeeSemester) || 0,
    durationYears: p.durationYears,
    brochureFileUrl: p.brochureFileUrl,
    description: p.description,
    programDirectorIds: directorIds,
    directors,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// ── FACULTIES ─────────────────────────────────────────────────────────────

export async function listFaculties(tenantId?: string): Promise<FacultyDto[]> {
  const where = tenantId?.trim() ? { tenantId } : {};
  const list = await prisma.faculty.findMany({
    where,
    include: {
      deanStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, academicTitleTh: true, academicTitleEn: true, prefix: true } },
      _count: { select: { departments: true, programs: true } },
    },
    orderBy: [
      { sortOrder: "asc" },
      { code: "asc" },
    ],
  });
  return list.map(mapFaculty);
}

export async function getFacultyById(tenantId: string, id: string): Promise<FacultyDto | null> {
  const f = await prisma.faculty.findFirst({
    where: { id, tenantId },
    include: {
      deanStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, academicTitleTh: true, academicTitleEn: true, prefix: true } },
      _count: { select: { departments: true, programs: true } },
    },
  });
  return f ? mapFaculty(f) : null;
}

export async function createFaculty(tenantId: string, input: CreateFacultyInput): Promise<FacultyDto> {
  const code = input.code.trim().toUpperCase();
  const existing = await prisma.faculty.findFirst({
    where: { tenantId, code },
  });
  if (existing) throw errors.conflict("faculty_code_taken");

  const created = await prisma.faculty.create({
    data: {
      tenantId,
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      shortNameTh: input.shortNameTh?.trim() || null,
      shortNameEn: input.shortNameEn?.trim() || null,
      deanStaffId: input.deanStaffId || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      website: input.website?.trim() || null,
      buildingLocation: input.buildingLocation?.trim() || null,
      description: input.description?.trim() || null,
      logoUrl: input.logoUrl?.trim() || null,
      status: input.status,
      sortOrder: input.sortOrder,
    },
    include: {
      deanStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, academicTitleTh: true, academicTitleEn: true, prefix: true } },
      _count: { select: { departments: true, programs: true } },
    },
  });
  return mapFaculty(created);
}

export async function updateFaculty(tenantId: string, input: UpdateFacultyInput): Promise<FacultyDto> {
  const code = input.code.trim().toUpperCase();
  const existing = await prisma.faculty.findFirst({
    where: { tenantId, code, NOT: { id: input.id } },
  });
  if (existing) throw errors.conflict("faculty_code_taken");

  const updated = await prisma.faculty.update({
    where: { id: input.id, tenantId },
    data: {
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      shortNameTh: input.shortNameTh !== undefined ? (input.shortNameTh?.trim() || null) : undefined,
      shortNameEn: input.shortNameEn !== undefined ? (input.shortNameEn?.trim() || null) : undefined,
      deanStaffId: input.deanStaffId !== undefined ? (input.deanStaffId || null) : undefined,
      email: input.email !== undefined ? (input.email?.trim() || null) : undefined,
      phone: input.phone !== undefined ? (input.phone?.trim() || null) : undefined,
      website: input.website !== undefined ? (input.website?.trim() || null) : undefined,
      buildingLocation: input.buildingLocation !== undefined ? (input.buildingLocation?.trim() || null) : undefined,
      description: input.description !== undefined ? (input.description?.trim() || null) : undefined,
      logoUrl: input.logoUrl !== undefined ? (input.logoUrl?.trim() || null) : undefined,
      status: input.status,
      sortOrder: input.sortOrder,
    },
    include: {
      deanStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, academicTitleTh: true, academicTitleEn: true, prefix: true } },
      _count: { select: { departments: true, programs: true } },
    },
  });
  return mapFaculty(updated);
}

export async function deleteFaculty(tenantId: string, id: string): Promise<{ faculty: FacultyDto; archived: boolean }> {
  const faculty = await prisma.faculty.findFirst({
    where: { id, tenantId },
    include: {
      _count: { select: { departments: true, programs: true } },
    },
  });
  if (!faculty) throw errors.not_found("faculty_not_found");

  // If referenced by departments or programs, soft-delete to ARCHIVED
  if (faculty._count.departments > 0 || faculty._count.programs > 0) {
    const updated = await prisma.faculty.update({
      where: { id, tenantId },
      data: { status: "ARCHIVED" },
      include: {
        deanStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, academicTitleTh: true, academicTitleEn: true, prefix: true } },
        _count: { select: { departments: true, programs: true } },
      },
    });
    return { faculty: mapFaculty(updated), archived: true };
  }

  const deleted = await prisma.faculty.delete({
    where: { id, tenantId },
    include: {
      deanStaff: { select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, academicTitleTh: true, academicTitleEn: true, prefix: true } },
      _count: { select: { departments: true, programs: true } },
    },
  });
  return { faculty: mapFaculty(deleted), archived: false };
}

// ── PROGRAMS ──────────────────────────────────────────────────────────────

export async function listPrograms(
  tenantId?: string,
  level?: string,
  departmentId?: string,
  facultyId?: string,
  status?: string,
): Promise<ProgramDto[]> {
  const where: Prisma.ProgramWhereInput = {};
  if (tenantId?.trim()) {
    where.tenantId = tenantId;
  } else {
    const defaultTenant = await prisma.tenant.findFirst({ select: { id: true } });
    if (defaultTenant) where.tenantId = defaultTenant.id;
  }
  if (level && level !== "ALL") where.degreeLevel = level as ProgramDegreeLevel;
  if (departmentId && departmentId !== "ALL") where.departmentId = departmentId;
  if (facultyId && facultyId !== "ALL") where.facultyId = facultyId;
  if (status && status !== "ALL") where.status = status as ProgramStatus;

  const list = await prisma.program.findMany({
    where,
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      department: { select: { id: true, code: true, nameTh: true, nameEn: true } },
    },
    orderBy: [
      { degreeLevel: "asc" },
      { code: "asc" },
    ],
  });

  // Extract all director IDs to batch query staff names
  const allDirectorIds = Array.from(
    new Set(
      list.flatMap((p) => (Array.isArray(p.programDirectorIds) ? (p.programDirectorIds as string[]) : []))
    )
  );

  const directorMap = new Map<string, { id: string; nameTh: string; nameEn: string }>();
  if (allDirectorIds.length > 0) {
    const staffs = await prisma.staffProfile.findMany({
      where: { id: { in: allDirectorIds } },
      select: {
        id: true,
        firstNameTh: true,
        lastNameTh: true,
        firstNameEn: true,
        lastNameEn: true,
        prefix: true,
        academicTitleTh: true,
        academicTitleEn: true,
      },
    });
    for (const s of staffs) {
      const pTh = s.prefix || s.academicTitleTh || "";
      const pEn = s.prefix || s.academicTitleEn || "";
      directorMap.set(s.id, {
        id: s.id,
        nameTh: `${pTh} ${s.firstNameTh} ${s.lastNameTh}`.trim(),
        nameEn: `${pEn} ${s.firstNameEn} ${s.lastNameEn}`.trim(),
      });
    }
  }

  return list.map((p) => mapProgram(p, directorMap));
}

export async function getProgramById(tenantId: string, id: string): Promise<ProgramDto | null> {
  const p = await prisma.program.findFirst({
    where: { id, tenantId },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      department: { select: { id: true, code: true, nameTh: true, nameEn: true } },
    },
  });
  if (!p) return null;

  const directorIds = Array.isArray(p.programDirectorIds) ? (p.programDirectorIds as string[]) : [];
  const directorMap = new Map<string, { id: string; nameTh: string; nameEn: string }>();
  if (directorIds.length > 0) {
    const staffs = await prisma.staffProfile.findMany({
      where: { id: { in: directorIds } },
      select: { id: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true, prefix: true, academicTitleTh: true, academicTitleEn: true },
    });
    for (const s of staffs) {
      const pTh = s.prefix || s.academicTitleTh || "";
      const pEn = s.prefix || s.academicTitleEn || "";
      directorMap.set(s.id, {
        id: s.id,
        nameTh: `${pTh} ${s.firstNameTh} ${s.lastNameTh}`.trim(),
        nameEn: `${pEn} ${s.firstNameEn} ${s.lastNameEn}`.trim(),
      });
    }
  }

  return mapProgram(p, directorMap);
}

export async function createProgram(tenantId: string, input: CreateProgramInput): Promise<ProgramDto> {
  const code = input.code.trim().toUpperCase();
  const existing = await prisma.program.findFirst({
    where: { tenantId, code },
  });
  if (existing) throw errors.conflict("program_code_taken");

  const p = await prisma.program.create({
    data: {
      tenantId,
      facultyId: input.facultyId,
      departmentId: input.departmentId || null,
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      degreeLevel: input.degreeLevel,
      degreeNameTh: input.degreeNameTh.trim(),
      degreeNameEn: input.degreeNameEn.trim(),
      degreeShortTh: input.degreeShortTh?.trim() || null,
      degreeShortEn: input.degreeShortEn?.trim() || null,
      programType: input.programType?.trim() || null,
      majorName: input.majorName?.trim() || null,
      curriculumYear: input.curriculumYear,
      startAcademicYear: input.startAcademicYear || null,
      studyFormat: input.studyFormat?.trim() || null,
      instructionLanguage: input.instructionLanguage?.trim() || null,
      totalCredits: input.totalCredits,
      tuitionFeeSemester: input.tuitionFeeSemester,
      durationYears: input.durationYears,
      brochureFileUrl: input.brochureFileUrl?.trim() || null,
      description: input.description?.trim() || null,
      programDirectorIds: input.programDirectorIds ?? [],
      status: input.status,
    },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      department: { select: { id: true, code: true, nameTh: true, nameEn: true } },
    },
  });
  return mapProgram(p);
}

export async function updateProgram(tenantId: string, input: UpdateProgramInput): Promise<ProgramDto> {
  const code = input.code.trim().toUpperCase();
  const existing = await prisma.program.findFirst({
    where: { tenantId, code, NOT: { id: input.id } },
  });
  if (existing) throw errors.conflict("program_code_taken");

  const p = await prisma.program.update({
    where: { id: input.id, tenantId },
    data: {
      facultyId: input.facultyId,
      departmentId: input.departmentId !== undefined ? (input.departmentId || null) : undefined,
      code,
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      degreeLevel: input.degreeLevel,
      degreeNameTh: input.degreeNameTh.trim(),
      degreeNameEn: input.degreeNameEn.trim(),
      degreeShortTh: input.degreeShortTh !== undefined ? (input.degreeShortTh?.trim() || null) : undefined,
      degreeShortEn: input.degreeShortEn !== undefined ? (input.degreeShortEn?.trim() || null) : undefined,
      programType: input.programType !== undefined ? (input.programType?.trim() || null) : undefined,
      majorName: input.majorName !== undefined ? (input.majorName?.trim() || null) : undefined,
      curriculumYear: input.curriculumYear,
      startAcademicYear: input.startAcademicYear !== undefined ? (input.startAcademicYear || null) : undefined,
      studyFormat: input.studyFormat !== undefined ? (input.studyFormat?.trim() || null) : undefined,
      instructionLanguage: input.instructionLanguage !== undefined ? (input.instructionLanguage?.trim() || null) : undefined,
      totalCredits: input.totalCredits,
      tuitionFeeSemester: input.tuitionFeeSemester,
      durationYears: input.durationYears,
      brochureFileUrl: input.brochureFileUrl !== undefined ? (input.brochureFileUrl?.trim() || null) : undefined,
      description: input.description !== undefined ? (input.description?.trim() || null) : undefined,
      programDirectorIds: input.programDirectorIds !== undefined ? input.programDirectorIds : undefined,
      status: input.status,
    },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      department: { select: { id: true, code: true, nameTh: true, nameEn: true } },
    },
  });
  return mapProgram(p);
}

export async function deleteProgram(tenantId: string, id: string): Promise<{ program: ProgramDto; archived: boolean }> {
  const p = await prisma.program.findFirst({
    where: { id, tenantId },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      department: { select: { id: true, code: true, nameTh: true, nameEn: true } },
    },
  });
  if (!p) throw errors.not_found("program_not_found");

  // If program is active/open or has relations, soft-delete to ARCHIVED
  const updated = await prisma.program.update({
    where: { id, tenantId },
    data: { status: "ARCHIVED" },
    include: {
      faculty: { select: { id: true, code: true, nameTh: true, nameEn: true } },
      department: { select: { id: true, code: true, nameTh: true, nameEn: true } },
    },
  });
  return { program: mapProgram(updated), archived: true };
}

// ── OVERVIEW STATS ────────────────────────────────────────────────────────

export async function getProgramOverviewStats(tenantId: string): Promise<ProgramOverviewStats> {
  const [
    totalFaculties,
    totalDepartments,
    totalPrograms,
    activePrograms,
    openPrograms,
    programsByLevelGroup,
    programsByFacultyGroup,
    programsByStatusGroup,
    recentProgramsList,
    faculties,
  ] = await Promise.all([
    prisma.faculty.count({ where: { tenantId, status: { not: "ARCHIVED" } } }),
    prisma.department.count({ where: { tenantId, status: { not: "ARCHIVED" } } }),
    prisma.program.count({ where: { tenantId, status: { not: "ARCHIVED" } } }),
    prisma.program.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.program.count({ where: { tenantId, status: "OPEN_ADMISSION" } }),
    prisma.program.groupBy({
      by: ["degreeLevel"],
      where: { tenantId, status: { not: "ARCHIVED" } },
      _count: { id: true },
    }),
    prisma.program.groupBy({
      by: ["facultyId"],
      where: { tenantId, status: { not: "ARCHIVED" } },
      _count: { id: true },
    }),
    prisma.program.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { id: true },
    }),
    listPrograms(tenantId, undefined, undefined, undefined, undefined),
    prisma.faculty.findMany({
      where: { tenantId },
      select: { id: true, nameTh: true, nameEn: true },
    }),
  ]);

  const facultyMap = new Map(faculties.map((f) => [f.id, f]));

  return {
    totalFaculties,
    totalDepartments,
    totalPrograms,
    activePrograms,
    openPrograms,
    byLevel: programsByLevelGroup.map((g) => ({
      level: g.degreeLevel,
      count: g._count.id,
    })),
    byFaculty: programsByFacultyGroup.map((g) => {
      const f = g.facultyId ? facultyMap.get(g.facultyId) : null;
      return {
        facultyId: g.facultyId ?? "unknown",
        facultyNameTh: f?.nameTh ?? "ไม่ระบุคณะ",
        facultyNameEn: f?.nameEn ?? "Unassigned Faculty",
        count: g._count.id,
      };
    }),
    byStatus: programsByStatusGroup.map((g) => ({
      status: g.status,
      count: g._count.id,
    })),
    recentPrograms: recentProgramsList.slice(0, 5),
  };
}

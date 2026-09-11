import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, ProgramDegreeLevel, ProgramStatus } from "@/generated/prisma";
import type { CreateProgramInput, UpdateProgramInput } from "./validations";

export interface ProgramDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeLevel: ProgramDegreeLevel;
  degreeNameTh: string;
  degreeNameEn: string;
  curriculumYear: number;
  totalCredits: number;
  tuitionFeeSemester: number;
  durationYears: number;
  brochureFileUrl: string | null;
  description: string | null;
  status: ProgramStatus;
  createdAt: Date;
  updatedAt: Date;
}

type ProgramRecord = Prisma.ProgramGetPayload<Record<string, never>>;

function mapProgram(p: ProgramRecord): ProgramDto {
  return {
    id: p.id,
    tenantId: p.tenantId,
    code: p.code,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    degreeLevel: p.degreeLevel,
    degreeNameTh: p.degreeNameTh,
    degreeNameEn: p.degreeNameEn,
    curriculumYear: p.curriculumYear,
    totalCredits: p.totalCredits,
    tuitionFeeSemester: Number(p.tuitionFeeSemester) || 0,
    durationYears: p.durationYears,
    brochureFileUrl: p.brochureFileUrl,
    description: p.description,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function listPrograms(tenantId?: string, level?: string): Promise<ProgramDto[]> {
  const where: { tenantId?: string; degreeLevel?: ProgramDegreeLevel } = {};
  if (tenantId?.trim()) {
    where.tenantId = tenantId;
  } else {
    const defaultTenant = await prisma.tenant.findFirst({ select: { id: true } });
    if (defaultTenant) where.tenantId = defaultTenant.id;
  }
  if (level) where.degreeLevel = level as ProgramDegreeLevel;

  const list = await prisma.program.findMany({
    where,
    orderBy: [
      { degreeLevel: "asc" },
      { code: "asc" },
    ],
  });
  return list.map(mapProgram);
}

export async function getProgramById(tenantId: string, id: string): Promise<ProgramDto | null> {
  const p = await prisma.program.findFirst({
    where: { id, tenantId },
  });
  return p ? mapProgram(p) : null;
}

export async function createProgram(tenantId: string, input: CreateProgramInput): Promise<ProgramDto> {
  const p = await prisma.program.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeLevel: input.degreeLevel,
      degreeNameTh: input.degreeNameTh,
      degreeNameEn: input.degreeNameEn,
      curriculumYear: input.curriculumYear,
      totalCredits: input.totalCredits,
      tuitionFeeSemester: input.tuitionFeeSemester,
      durationYears: input.durationYears,
      brochureFileUrl: input.brochureFileUrl || null,
      description: input.description || null,
      status: input.status,
    },
  });
  return mapProgram(p);
}

export async function updateProgram(tenantId: string, input: UpdateProgramInput): Promise<ProgramDto> {
  const p = await prisma.program.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeLevel: input.degreeLevel,
      degreeNameTh: input.degreeNameTh,
      degreeNameEn: input.degreeNameEn,
      curriculumYear: input.curriculumYear,
      totalCredits: input.totalCredits,
      tuitionFeeSemester: input.tuitionFeeSemester,
      durationYears: input.durationYears,
      brochureFileUrl: input.brochureFileUrl || null,
      description: input.description || null,
      status: input.status,
    },
  });
  return mapProgram(p);
}

export async function deleteProgram(tenantId: string, id: string): Promise<ProgramDto> {
  const p = await prisma.program.delete({
    where: { id, tenantId },
  });
  return mapProgram(p);
}

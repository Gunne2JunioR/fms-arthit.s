import { prisma } from "@/shared/lib/infra/prisma";
import type { ProgramDegreeLevel, ProgramStatus } from "@/generated/prisma";
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

function mapProgram(p: Record<string, unknown>): ProgramDto {
  return {
    ...(p as unknown as ProgramDto),
    tuitionFeeSemester: Number(p.tuitionFeeSemester) || 0,
  };
}

export async function listPrograms(tenantId: string, level?: string): Promise<ProgramDto[]> {
  const list = await prisma.program.findMany({
    where: {
      tenantId,
      ...(level ? { degreeLevel: level as ProgramDegreeLevel } : {}),
    },
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

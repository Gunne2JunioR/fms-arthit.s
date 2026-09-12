"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { writeAudit } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createFacultySchema,
  updateFacultySchema,
  createProgramSchema,
  updateProgramSchema,
} from "./validations";
import * as services from "./services";
import type { FacultyDto, ProgramDto, ProgramOverviewStats } from "./services";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// ── FACULTY ACTIONS ────────────────────────────────────────────────────────

export async function getFacultiesAction(): Promise<ActionResult<FacultyDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return services.listFaculties(ctx.tenantId);
  });
}

export async function createFacultyAction(input: unknown): Promise<ActionResult<FacultyDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createFacultySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const created = await services.createFaculty(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "faculty.create",
      entity: "faculty",
      entityId: created.id,
      after: created,
      ip,
    });
    revalidatePath("/admin/faculties");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/departments");
    return created;
  });
}

export async function updateFacultyAction(input: unknown): Promise<ActionResult<FacultyDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateFacultySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const before = await services.getFacultyById(ctx.tenantId, parsed.id);
    const updated = await services.updateFaculty(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "faculty.update",
      entity: "faculty",
      entityId: updated.id,
      before,
      after: updated,
      ip,
    });
    revalidatePath("/admin/faculties");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/departments");
    return updated;
  });
}

export async function deleteFacultyAction(id: string): Promise<ActionResult<{ faculty: FacultyDto; archived: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const ip = await getClientIp();
    const before = await services.getFacultyById(ctx.tenantId, id);
    const res = await services.deleteFaculty(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: res.archived ? "faculty.archive" : "faculty.delete",
      entity: "faculty",
      entityId: id,
      before,
      after: res.faculty,
      ip,
    });
    revalidatePath("/admin/faculties");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/departments");
    return res;
  });
}

// ── PROGRAM ACTIONS ────────────────────────────────────────────────────────

export async function getProgramsAction(
  level?: string,
  departmentId?: string,
  facultyId?: string,
  status?: string,
): Promise<ActionResult<ProgramDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return services.listPrograms(ctx.tenantId, level, departmentId, facultyId, status);
  });
}

export async function createProgramAction(input: unknown): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const created = await services.createProgram(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "curriculum.create",
      entity: "program",
      entityId: created.id,
      after: created,
      ip,
    });
    revalidatePath("/admin/programs");
    revalidatePath("/admin/programs/overview");
    revalidatePath("/programs");
    return created;
  });
}

export async function updateProgramAction(input: unknown): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const before = await services.getProgramById(ctx.tenantId, parsed.id);
    const updated = await services.updateProgram(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "curriculum.update",
      entity: "program",
      entityId: updated.id,
      before,
      after: updated,
      ip,
    });
    revalidatePath("/admin/programs");
    revalidatePath("/admin/programs/overview");
    revalidatePath("/programs");
    return updated;
  });
}

export async function deleteProgramAction(id: string): Promise<ActionResult<{ program: ProgramDto; archived: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const ip = await getClientIp();
    const before = await services.getProgramById(ctx.tenantId, id);
    const res = await services.deleteProgram(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: res.archived ? "curriculum.archive" : "curriculum.delete",
      entity: "program",
      entityId: id,
      before,
      after: res.program,
      ip,
    });
    revalidatePath("/admin/programs");
    revalidatePath("/admin/programs/overview");
    revalidatePath("/programs");
    return res;
  });
}

// ── OVERVIEW ACTION ────────────────────────────────────────────────────────

export async function getProgramOverviewStatsAction(): Promise<ActionResult<ProgramOverviewStats>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return services.getProgramOverviewStats(ctx.tenantId);
  });
}


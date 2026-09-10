"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { writeAudit } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import { createProgramSchema, updateProgramSchema } from "./validations";
import * as services from "./services";
import type { ProgramDto } from "./services";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function getProgramsAction(level?: string): Promise<ActionResult<ProgramDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return services.listPrograms(ctx.tenantId, level);
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
    revalidatePath("/programs");
    return updated;
  });
}

export async function deleteProgramAction(id: string): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const ip = await getClientIp();
    const before = await services.getProgramById(ctx.tenantId, id);
    const deleted = await services.deleteProgram(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "curriculum.delete",
      entity: "program",
      entityId: id,
      before,
      ip,
    });
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    return deleted;
  });
}

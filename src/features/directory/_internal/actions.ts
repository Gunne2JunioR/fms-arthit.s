"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { DIRECTORY_P } from "../permissions";
import { createStaffSchema, updateStaffSchema } from "./validations";
import {
  listStaffProfiles,
  listDepartments,
  createStaffProfile,
  updateStaffProfile,
  deleteStaffProfile,
  type StaffProfileDto,
  type DepartmentDto,
} from "./services";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function getStaffListAction(filter?: {
  departmentId?: string;
  search?: string;
  status?: string;
}): Promise<ActionResult<StaffProfileDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffRead);
    return listStaffProfiles(ctx.tenantId, filter);
  });
}

export async function getDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffRead);
    return listDepartments(ctx.tenantId);
  });
}

export async function createStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffManage);
    const parsed = createStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const result = await createStaffProfile(ctx.tenantId, ctx.userId, parsed, ip);
    revalidatePath("/admin/staff");
    revalidatePath("/personnel");
    return result;
  });
}

export async function updateStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffManage);
    const parsed = updateStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const result = await updateStaffProfile(ctx.tenantId, ctx.userId, parsed, ip);
    revalidatePath("/admin/staff");
    revalidatePath("/personnel");
    return result;
  });
}

export async function deleteStaffAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffManage);
    const ip = await getClientIp();
    await deleteStaffProfile(ctx.tenantId, ctx.userId, id, ip);
    revalidatePath("/admin/staff");
    revalidatePath("/personnel");
  });
}

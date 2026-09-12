"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { DIRECTORY_P } from "../permissions";
import {
  createStaffSchema,
  updateStaffSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  type EmploymentStatus,
} from "./validations";
import {
  listStaffProfiles,
  getStaffProfileById,
  listDepartments,
  createStaffProfile,
  updateStaffProfile,
  deleteStaffProfile,
  linkUserToPersonnel,
  changePersonnelStatus,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type StaffProfileDto,
  type DepartmentDto,
} from "./services";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function getStaffListAction(filter?: {
  departmentId?: string;
  personnelType?: string;
  employmentStatus?: string;
  status?: string;
  search?: string;
  hasUser?: string;
}): Promise<ActionResult<StaffProfileDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffRead);
    return listStaffProfiles(ctx.tenantId, filter);
  });
}

export async function getDepartmentsAction(facultyId?: string, status?: string): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.departmentRead);
    return listDepartments(ctx.tenantId, facultyId, status);
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

export async function deleteStaffAction(id: string): Promise<ActionResult<{ mode: "deleted" | "archived" }>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffManage);
    const ip = await getClientIp();
    const result = await deleteStaffProfile(ctx.tenantId, ctx.userId, id, ip);
    revalidatePath("/admin/staff");
    revalidatePath("/users/personnel");
    revalidatePath("/personnel");
    return result;
  });
}

export async function linkUserAction(personnelId: string, userId: string | null): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffManage);
    const ip = await getClientIp();
    const result = await linkUserToPersonnel(ctx.tenantId, ctx.userId, personnelId, userId, ip);
    revalidatePath("/admin/staff");
    revalidatePath("/users/personnel");
    return result;
  });
}

export async function createUserFromPersonnelAction(personnelId: string, roleId: string): Promise<ActionResult<{ user: { id: string; email: string; name: string }; link: string; hours: number }>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffManage);
    const personnel = await getStaffProfileById(ctx.tenantId, personnelId);
    if (!personnel) throw new Error("not_found");
    if (personnel.userId) throw new Error("user_already_linked");

    const email = (personnel.universityEmail || personnel.email).toLowerCase().trim();
    const name = `${personnel.firstNameTh} ${personnel.lastNameTh}`.trim();

    // Import user service to create user
    const { createUser } = await import("@/features/identity/_internal/services/user.service");
    const createdUser = await createUser({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      isSuperAdmin: ctx.isSuperAdmin,
      permissions: ctx.permissions,
      email,
      name,
      roles: [{ roleId, scopeType: "ALL", scopeId: null }],
    });

    const ip = await getClientIp();
    await linkUserToPersonnel(ctx.tenantId, ctx.userId, personnelId, createdUser.user.id, ip);

    revalidatePath("/admin/staff");
    revalidatePath("/users/personnel");
    revalidatePath("/users");

    const { env } = await import("@/shared/lib/infra/env");
    return {
      user: { id: createdUser.user.id, email: createdUser.user.email, name: createdUser.user.name },
      link: `${env().APP_URL}/reset-password/${createdUser.rawToken}`,
      hours: 72,
    };
  });
}

export async function changePersonnelStatusAction(personnelId: string, status: EmploymentStatus): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffManage);
    const ip = await getClientIp();
    const result = await changePersonnelStatus(ctx.tenantId, ctx.userId, personnelId, status, ip);
    revalidatePath("/admin/staff");
    revalidatePath("/users/personnel");
    revalidatePath("/personnel");
    return result;
  });
}

export async function exportPersonnelCsvAction(filter?: {
  departmentId?: string;
  personnelType?: string;
  employmentStatus?: string;
  search?: string;
}): Promise<ActionResult<string>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.staffRead);
    const staff = await listStaffProfiles(ctx.tenantId, filter);

    const headers = [
      "รหัสบุคลากร",
      "คำนำหน้า",
      "ชื่อ (ไทย)",
      "นามสกุล (ไทย)",
      "ชื่อ (อังกฤษ)",
      "นามสกุล (อังกฤษ)",
      "ประเภทบุคลากร",
      "สถานะการปฏิบัติงาน",
      "สังกัด/หน่วยงาน",
      "หน่วยงานรอง",
      "ตำแหน่งงาน",
      "ตำแหน่งทางวิชาการ",
      "อีเมลมหาวิทยาลัย",
      "อีเมลส่วนตัว",
      "เบอร์โทรศัพท์",
      "เบอร์ต่อภายใน",
      "สถานที่ทำงาน",
      "วันที่เริ่มงาน",
      "วันที่สิ้นสุดงาน",
      "วันเกษียณ",
      "มีบัญชีผู้ใช้",
    ];

    const rows = staff.map((s) => [
      `"${s.personnelCode || ""}"`,
      `"${s.prefix || s.academicTitleTh || ""}"`,
      `"${s.firstNameTh || ""}"`,
      `"${s.lastNameTh || ""}"`,
      `"${s.firstNameEn || ""}"`,
      `"${s.lastNameEn || ""}"`,
      `"${s.personnelType || ""}"`,
      `"${s.employmentStatus || ""}"`,
      `"${s.departmentNameTh || ""}"`,
      `"${s.subDepartmentName || ""}"`,
      `"${s.positionName || s.positionTh || ""}"`,
      `"${s.academicPosition || ""}"`,
      `"${s.universityEmail || s.email || ""}"`,
      `"${s.personalEmail || ""}"`,
      `"${s.phoneNumber || ""}"`,
      `"${s.phoneExt || ""}"`,
      `"${s.workLocation || ""}"`,
      `"${s.startDate || ""}"`,
      `"${s.endDate || ""}"`,
      `"${s.retirementDate || ""}"`,
      `"${s.user ? s.user.email : "ไม่มี"}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    return csvContent;
  });
}


export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.departmentManage);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const result = await createDepartment(ctx.tenantId, ctx.userId, parsed, ip);
    revalidatePath("/admin/departments");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/staff");
    revalidatePath("/programs");
    revalidatePath("/personnel");
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.departmentManage);
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const result = await updateDepartment(ctx.tenantId, ctx.userId, parsed, ip);
    revalidatePath("/admin/departments");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/staff");
    revalidatePath("/programs");
    revalidatePath("/personnel");
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<{ department: DepartmentDto; archived: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(DIRECTORY_P.departmentManage);
    const ip = await getClientIp();
    const result = await deleteDepartment(ctx.tenantId, ctx.userId, id, ip);
    revalidatePath("/admin/departments");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/staff");
    revalidatePath("/programs");
    revalidatePath("/personnel");
    return result;
  });
}


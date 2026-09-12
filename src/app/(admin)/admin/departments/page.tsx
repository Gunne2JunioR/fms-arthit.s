import { requirePermission, hasPermission } from "@/features/identity/server";
import { DIRECTORY_P, listDepartments, listStaffProfiles } from "@/features/directory/server";
import { listFaculties } from "@/features/curriculum/server";
import { DepartmentsClient } from "./departments-client";

export default async function AdminDepartmentsPage() {
  const ctx = await requirePermission(DIRECTORY_P.departmentRead);
  const [departments, faculties, staffList] = await Promise.all([
    listDepartments(ctx.tenantId),
    listFaculties(ctx.tenantId),
    listStaffProfiles(ctx.tenantId),
  ]);
  const canManage = hasPermission(ctx, DIRECTORY_P.departmentManage);

  return (
    <DepartmentsClient
      initialDepartments={departments}
      faculties={faculties}
      staffList={staffList}
      canManage={canManage}
    />
  );
}

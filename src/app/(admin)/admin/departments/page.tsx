import { requirePermission, hasPermission } from "@/features/identity/server";
import { DIRECTORY_P, listDepartments } from "@/features/directory/server";
import { DepartmentsClient } from "./departments-client";

export default async function AdminDepartmentsPage() {
  const ctx = await requirePermission(DIRECTORY_P.departmentRead);
  const departments = await listDepartments(ctx.tenantId);
  const canManage = hasPermission(ctx, DIRECTORY_P.departmentManage);

  return (
    <DepartmentsClient
      initialDepartments={departments}
      canManage={canManage}
    />
  );
}

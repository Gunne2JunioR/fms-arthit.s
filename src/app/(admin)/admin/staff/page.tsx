import { requirePermission, hasPermission } from "@/features/identity/server";
import { DIRECTORY_P, listStaffProfiles, listDepartments } from "@/features/directory/server";
import { StaffClient } from "./_components/staff-client";

export default async function StaffAdminPage() {
  const ctx = await requirePermission(DIRECTORY_P.staffRead);
  const [initialStaff, departments] = await Promise.all([
    listStaffProfiles(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <StaffClient
      initialStaff={initialStaff}
      departments={departments}
      canManage={hasPermission(ctx, DIRECTORY_P.staffManage)}
    />
  );
}

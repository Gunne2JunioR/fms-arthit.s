import { requirePermission, hasPermission } from "@/features/identity/server";
import { DIRECTORY_P, listStaffProfiles, listDepartments } from "@/features/directory/server";
import { listRolesForPickerAction, listUsersAction } from "@/features/identity/actions";
import { PersonnelClient } from "./_components/personnel-client";

export default async function PersonnelManagementPage() {
  const ctx = await requirePermission(DIRECTORY_P.staffRead);
  const [personnelList, departments, rolesRes, usersRes] = await Promise.all([
    listStaffProfiles(ctx.tenantId),
    listDepartments(ctx.tenantId),
    listRolesForPickerAction(),
    listUsersAction({ page: 1, perPage: 100 }),
  ]);

  const canManage = hasPermission(ctx, DIRECTORY_P.staffManage);

  return (
    <PersonnelClient
      initialPersonnel={personnelList}
      departments={departments}
      roles={rolesRes.ok ? rolesRes.data : []}
      users={usersRes.ok ? usersRes.data.items : []}
      canManage={canManage}
    />
  );
}

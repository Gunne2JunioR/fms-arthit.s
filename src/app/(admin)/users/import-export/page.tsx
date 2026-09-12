import { requirePermission, hasPermission, P } from "@/features/identity/server";
import { listRolesForPickerAction } from "@/features/identity/actions";
import { UsersImportExportClient } from "./_components/users-import-export-client";

export default async function UsersImportExportPage() {
  const ctx = await requirePermission(P.usersRead);
  const rolesRes = await listRolesForPickerAction();
  const roles = rolesRes.ok ? rolesRes.data : [];

  return (
    <UsersImportExportClient
      canManage={hasPermission(ctx, P.usersManage)}
      roles={roles}
    />
  );
}

import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { listFaculties } from "@/features/curriculum/server";
import { listStaffProfiles } from "@/features/directory/server";
import { FacultiesClient } from "./faculties-client";

export default async function AdminFacultiesPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [faculties, staff] = await Promise.all([
    listFaculties(ctx.tenantId),
    listStaffProfiles(ctx.tenantId),
  ]);
  const canManage = hasPermission(ctx, CURRICULUM_P.curriculumManage);

  return (
    <FacultiesClient
      initialFaculties={faculties}
      staffList={staff}
      canManage={canManage}
    />
  );
}

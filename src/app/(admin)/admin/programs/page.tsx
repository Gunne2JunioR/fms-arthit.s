import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { listPrograms, listFaculties } from "@/features/curriculum/server";
import { listDepartments, listStaffProfiles } from "@/features/directory/server";
import { ProgramsClient } from "./programs-client";

export default async function AdminProgramsPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [programs, faculties, departments, staffList] = await Promise.all([
    listPrograms(ctx.tenantId),
    listFaculties(ctx.tenantId),
    listDepartments(ctx.tenantId),
    listStaffProfiles(ctx.tenantId),
  ]);
  const canManage = hasPermission(ctx, CURRICULUM_P.curriculumManage);

  return (
    <ProgramsClient
      initialPrograms={programs}
      faculties={faculties}
      departments={departments}
      staffList={staffList}
      canManage={canManage}
    />
  );
}

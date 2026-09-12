import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { listPrograms } from "@/features/curriculum/server";
import { listDepartments } from "@/features/directory/server";
import { ProgramsClient } from "./programs-client";

export default async function AdminProgramsPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [programs, departments] = await Promise.all([
    listPrograms(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);
  const canManage = hasPermission(ctx, CURRICULUM_P.curriculumManage);

  return (
    <ProgramsClient
      initialPrograms={programs}
      departments={departments}
      canManage={canManage}
    />
  );
}

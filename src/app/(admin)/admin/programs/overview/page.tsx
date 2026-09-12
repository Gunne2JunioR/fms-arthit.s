import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { getProgramOverviewStats } from "@/features/curriculum/server";
import { OverviewClient } from "./overview-client";

export default async function ProgramOverviewPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const stats = await getProgramOverviewStats(ctx.tenantId);

  return <OverviewClient initialStats={stats} />;
}

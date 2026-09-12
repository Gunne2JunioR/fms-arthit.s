"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Landmark,
  GitBranch,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BarChart3,
  Layers,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { LiyonCard, StatusPill } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ProgramOverviewStats } from "@/features/curriculum";

interface Props {
  initialStats: ProgramOverviewStats;
}

export function OverviewClient({ initialStats }: Props) {
  const t = useT();
  const locale = useLocale();

  const levelLabels: Record<string, string> = {
    BACHELOR: t("curriculum.level.bachelor"),
    MASTER: t("curriculum.level.master"),
    DOCTORAL: t("curriculum.level.doctoral"),
    DIPLOMA: t("curriculum.level.diploma"),
  };

  const statusLabels: Record<string, { label: string; tone: "ok" | "warn" | "off" }> = {
    OPEN_ADMISSION: { label: t("curriculum.status.open_admission"), tone: "ok" },
    ACTIVE: { label: t("curriculum.status.active"), tone: "ok" },
    REVISED: { label: t("curriculum.status.revised"), tone: "warn" },
    CLOSED: { label: t("curriculum.status.closed"), tone: "off" },
    ARCHIVED: { label: t("curriculum.status.archived"), tone: "off" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            {t("curriculum.overview.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("curriculum.overview.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/programs">
            <Button className="gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>{t("curriculum.nav.programs")}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <LiyonCard className="p-5 border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("curriculum.overview.totalFaculties")}
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {initialStats.totalFaculties}
            </span>
            <Link
              href="/admin/faculties"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              <span>จัดการ</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </LiyonCard>

        <LiyonCard className="p-5 border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("curriculum.overview.totalDepartments")}
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GitBranch className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {initialStats.totalDepartments}
            </span>
            <Link
              href="/admin/departments"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              <span>จัดการ</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </LiyonCard>

        <LiyonCard className="p-5 border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("curriculum.overview.totalPrograms")}
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {initialStats.totalPrograms}
            </span>
            <Link
              href="/admin/programs"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              <span>จัดการ</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </LiyonCard>

        <LiyonCard className="p-5 border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("curriculum.overview.activePrograms")}
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {initialStats.activePrograms}
            </span>
            <span className="text-xs text-muted-foreground">หลักสูตร</span>
          </div>
        </LiyonCard>

        <LiyonCard className="p-5 border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("curriculum.overview.openPrograms")}
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {initialStats.openPrograms}
            </span>
            <span className="text-xs text-muted-foreground">เปิดรับสมัคร</span>
          </div>
        </LiyonCard>
      </div>

      {/* Grid for Breakdown Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Degree Level Distribution */}
        <LiyonCard className="p-6 border space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {t("curriculum.overview.programsByLevel")}
            </h2>
          </div>
          <div className="space-y-3">
            {initialStats.byLevel.length > 0 ? (
              initialStats.byLevel.map((item) => {
                const pct =
                  initialStats.totalPrograms > 0
                    ? Math.round((item.count / initialStats.totalPrograms) * 100)
                    : 0;
                return (
                  <div key={item.level} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {levelLabels[item.level] || item.level}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} หลักสูตร ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                ไม่มีข้อมูลหลักสูตร
              </p>
            )}
          </div>
        </LiyonCard>

        {/* Faculty Distribution */}
        <LiyonCard className="p-6 border space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Landmark className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {t("curriculum.overview.programsByFaculty")}
            </h2>
          </div>
          <div className="space-y-3">
            {initialStats.byFaculty.length > 0 ? (
              initialStats.byFaculty.map((item) => {
                const pct =
                  initialStats.totalPrograms > 0
                    ? Math.round((item.count / initialStats.totalPrograms) * 100)
                    : 0;
                return (
                  <div key={item.facultyId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {locale === "en" ? item.facultyNameEn : item.facultyNameTh}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                ไม่มีข้อมูล
              </p>
            )}
          </div>
        </LiyonCard>

        {/* Status Distribution */}
        <LiyonCard className="p-6 border space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {t("curriculum.overview.programsByStatus")}
            </h2>
          </div>
          <div className="space-y-2">
            {initialStats.byStatus.length > 0 ? (
              initialStats.byStatus.map((item) => {
                const conf = statusLabels[item.status] || {
                  label: item.status,
                  tone: "off" as const,
                };
                return (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <StatusPill tone={conf.tone}>{conf.label}</StatusPill>
                    <span className="text-xs font-semibold text-foreground">
                      {item.count} หลักสูตร
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                ไม่มีข้อมูล
              </p>
            )}
          </div>
        </LiyonCard>
      </div>

      {/* Recent Programs Table */}
      <LiyonCard className="p-6 border space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {t("curriculum.overview.recentPrograms")}
            </h2>
          </div>
          <Link
            href="/admin/programs"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y">
          {initialStats.recentPrograms.map((p) => (
            <div
              key={p.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 px-2 rounded-md transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {p.code}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {locale === "en" ? p.nameEn : p.nameTh}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.facultyNameTh} • {p.departmentNameTh || t("curriculum.noDepartment")} •{" "}
                  {levelLabels[p.degreeLevel] || p.degreeLevel} (หลักสูตร พ.ศ. {p.curriculumYear})
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-medium text-foreground">
                  {Number(p.tuitionFeeSemester).toLocaleString()} ฿/เทอม
                </span>
                {(() => {
                  const conf = statusLabels[p.status] || {
                    label: p.status,
                    tone: "off" as const,
                  };
                  return <StatusPill tone={conf.tone}>{conf.label}</StatusPill>;
                })()}
              </div>
            </div>
          ))}
        </div>
      </LiyonCard>
    </div>
  );
}

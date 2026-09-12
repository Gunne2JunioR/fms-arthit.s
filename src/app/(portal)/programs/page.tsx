import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { ArrowLeft, Clock, Award, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPrograms } from "@/features/curriculum/server";
import type { ProgramDto } from "@/features/curriculum";
import { AcademicAdvisorDialog } from "./_components/academic-advisor-dialog";

export default async function ProgramsPage() {
  const [t, locale, programs] = await Promise.all([
    getT(),
    getLocale(),
    listPrograms(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-10 max-w-5xl">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("portal.home")}</span>
          </Link>
        </Button>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t("portal.programs")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          {t("portal.curriculumSubtitle")}
        </p>
      </div>

      {/* Feature 1: Agentic AI Academic & Admission Advisor */}
      <AcademicAdvisorDialog programs={programs} locale={locale} />

      <div className="grid grid-cols-1 gap-6">
        {programs.map((p: ProgramDto) => {
          const isEn = locale === "en";
          const title = isEn ? p.nameEn : p.nameTh;
          const subTitle = isEn ? p.nameTh : p.nameEn;
          const degree = isEn ? p.degreeNameEn : p.degreeNameTh;

          return (
            <div key={p.id} className="rounded-2xl border bg-card p-6 sm:p-8 space-y-4 hover:border-primary/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {p.code}
                    </span>
                    {p.departmentNameTh && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {isEn ? (p.departmentNameEn || p.departmentNameTh) : p.departmentNameTh}
                      </span>
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                      {degree}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
                  <p className="text-xs text-muted-foreground">{subTitle}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs font-medium text-muted-foreground">{t("portal.tuitionLabel")}</span>
                  <p className="text-base font-bold text-primary">
                    {Number(p.tuitionFeeSemester).toLocaleString()} {t("portal.termSuffix")}
                  </p>
                </div>
              </div>

              {p.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-6">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {t("portal.durationLabel")}: {p.durationYears} {t("portal.yearsSuffix")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    {t("portal.creditsLabel")}: {p.totalCredits} {t("portal.creditsSuffix")}
                  </span>
                  {p.status === "OPEN_ADMISSION" && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("portal.openAdmissionBadge")}
                    </span>
                  )}
                </div>

                {p.brochureFileUrl && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <a href={p.brochureFileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                      {t("portal.downloadBrochure")}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {programs.length === 0 && (
          <div className="text-center py-16 border rounded-2xl bg-card text-muted-foreground">
            {t("curriculum.empty")}
          </div>
        )}
      </div>
    </div>
  );
}

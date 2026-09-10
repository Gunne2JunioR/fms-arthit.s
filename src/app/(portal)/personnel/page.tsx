import Link from "next/link";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { listStaffProfiles, listDepartments } from "@/features/directory/server";
import { ArrowLeft, Mail, Phone, Building, Search, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ dept?: string; q?: string }>;
}

export default async function PersonnelPage({ searchParams }: Props) {
  const { dept, q } = await searchParams;
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  const [departments, staffList] = await Promise.all([
    listDepartments(),
    listStaffProfiles(undefined, {
      departmentId: dept,
      search: q,
      status: "ACTIVE",
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-10 max-w-6xl">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("portal.home")}</span>
          </Link>
        </Button>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t("portal.personnel")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          {t("portal.directorySubtitle")}
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/personnel"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !dept
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-background border hover:bg-muted text-foreground"
            }`}
          >
            {t("common.all")}
          </Link>
          {departments.map((d) => (
            <Link
              key={d.id}
              href={`/personnel?dept=${d.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dept === d.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-background border hover:bg-muted text-foreground"
              }`}
            >
              {locale === "en" ? d.nameEn : d.nameTh}
            </Link>
          ))}
        </div>

        <form method="GET" action="/personnel" className="relative w-full sm:w-72">
          {dept && <input type="hidden" name="dept" value={dept} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("portal.directorySearchPh")}
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Staff Grid */}
      {staffList.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-muted/10">
          <p className="text-sm text-muted-foreground">{t("directory.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border bg-card p-6 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    s.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400"
                  }
                  alt={s.fullNameTh}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                />
                <div className="space-y-1">
                  {s.positionTh && (
                    <span className="text-xs font-semibold text-primary block">
                      {locale === "en" ? s.positionEn || s.positionTh : s.positionTh}
                    </span>
                  )}
                  <h3 className="font-bold text-base text-foreground">
                    {locale === "en" ? s.fullNameEn : s.fullNameTh}
                  </h3>
                  <span className="text-xs text-muted-foreground block">
                    {locale === "en" ? s.departmentNameEn : s.departmentNameTh}
                  </span>
                </div>
              </div>

              {s.expertise.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t text-left">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Award className="h-3 w-3 text-primary" />
                    ความเชี่ยวชาญ:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {s.expertise.map((exp, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full pt-3 border-t text-xs text-muted-foreground space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">ห้อง {s.roomNumber || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{s.email}</span>
                </div>
                {s.phoneExt && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>ต่อ {s.phoneExt}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

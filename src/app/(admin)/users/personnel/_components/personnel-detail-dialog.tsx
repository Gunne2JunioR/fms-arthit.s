"use client";

import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  StatusPill,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import type { StaffProfileDto } from "@/features/directory";
import { Building, Mail, Shield } from "lucide-react";

interface Props {
  personnel: StaffProfileDto | null;
  onClose: () => void;
}

export function PersonnelDetailDialog({ personnel, onClose }: Props) {
  const t = useT();
  const locale = useLocale();

  if (!personnel) return null;

  const statusToneMap: Record<string, "ok" | "warn" | "bad" | "off"> = {
    ACTIVE: "ok",
    ON_LEAVE_STUDY: "warn",
    ON_LEAVE_SICK: "warn",
    RETIRED: "off",
    TERMINATED: "bad",
    ARCHIVED: "off",
  };

  return (
    <LiyonDialog open={!!personnel} onOpenChange={(open) => !open && onClose()} wide>
      <LiyonDialogHeader
        title={`${t("personnel.menuView")} - ${personnel.fullNameTh}`}
        description={`${t("personnel.colCode")}: ${personnel.personnelCode}`}
      />
      <LiyonDialogBody>
        <div className="space-y-6 py-2">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border bg-muted/20">
            <div className="h-16 w-16 rounded-full overflow-hidden border bg-background flex items-center justify-center text-primary font-bold text-xl shadow-xs">
              {personnel.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={personnel.avatarUrl} alt={personnel.fullNameTh} className="h-full w-full object-cover" />
              ) : (
                personnel.firstNameTh.slice(0, 1)
              )}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-foreground">{personnel.fullNameTh}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                  {personnel.personnelCode}
                </span>
                <StatusPill tone={statusToneMap[personnel.employmentStatus] || "ok"}>
                  {t(`personnel.status.${personnel.employmentStatus}`)}
                </StatusPill>
              </div>
              <p className="text-sm text-muted-foreground">{personnel.fullNameEn}</p>
              <p className="text-xs font-medium text-foreground/80">
                {personnel.positionName} {personnel.academicPosition ? `(${personnel.academicPosition})` : ""}
              </p>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employment Info */}
            <div className="space-y-3 p-4 rounded-xl border bg-card">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground border-b pb-2">
                <Building className="h-4 w-4 text-primary" />
                {t("personnel.tabEmployment")}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-muted">
                  <span className="text-muted-foreground">{t("personnel.colType")}:</span>
                  <span className="font-medium text-foreground">{t(`personnel.type.${personnel.personnelType}`)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-muted">
                  <span className="text-muted-foreground">{t("personnel.colDept")}:</span>
                  <span className="font-medium text-foreground">
                    {locale === "en" ? personnel.departmentNameEn : personnel.departmentNameTh}
                  </span>
                </div>
                {personnel.subDepartmentName && (
                  <div className="flex justify-between py-1 border-b border-muted">
                    <span className="text-muted-foreground">{t("personnel.subDept")}:</span>
                    <span className="font-medium text-foreground">{personnel.subDepartmentName}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-muted">
                  <span className="text-muted-foreground">{t("personnel.startDate")}:</span>
                  <span className="font-medium text-foreground">
                    {personnel.startDate ? formatDate(personnel.startDate, locale) : "-"}
                  </span>
                </div>
                {personnel.retirementDate && (
                  <div className="flex justify-between py-1 border-b border-muted">
                    <span className="text-muted-foreground">{t("personnel.retirementDate")}:</span>
                    <span className="font-medium text-foreground">{formatDate(personnel.retirementDate, locale)}</span>
                  </div>
                )}
                {personnel.workLocation && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">{t("personnel.workLocation")}:</span>
                    <span className="font-medium text-foreground">{personnel.workLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 p-4 rounded-xl border bg-card">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground border-b pb-2">
                <Mail className="h-4 w-4 text-primary" />
                {t("personnel.tabContact")}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-muted">
                  <span className="text-muted-foreground">{t("personnel.universityEmail")}:</span>
                  <span className="font-medium text-foreground">{personnel.universityEmail || personnel.email}</span>
                </div>
                {personnel.personalEmail && (
                  <div className="flex justify-between py-1 border-b border-muted">
                    <span className="text-muted-foreground">{t("personnel.personalEmail")}:</span>
                    <span className="font-medium text-foreground">{personnel.personalEmail}</span>
                  </div>
                )}
                {personnel.phoneNumber && (
                  <div className="flex justify-between py-1 border-b border-muted">
                    <span className="text-muted-foreground">{t("personnel.phoneNumber")}:</span>
                    <span className="font-medium text-foreground">{personnel.phoneNumber}</span>
                  </div>
                )}
                {personnel.phoneExt && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">{t("personnel.phoneExt")}:</span>
                    <span className="font-medium text-foreground">{personnel.phoneExt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Link Info */}
          <div className="p-4 rounded-xl border bg-card space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground border-b pb-2">
              <Shield className="h-4 w-4 text-primary" />
              {t("personnel.tabAccount")}
            </h4>
            {personnel.user ? (
              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <p className="font-semibold text-foreground">{personnel.user.name}</p>
                  <p className="text-muted-foreground">{personnel.user.email}</p>
                  {personnel.user.googleEmail && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Google: {personnel.user.googleEmail}
                    </p>
                  )}
                </div>
                <StatusPill tone="ok">{t("status.active")}</StatusPill>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t("personnel.noLinkedAccount")}</p>
            )}
          </div>
        </div>
      </LiyonDialogBody>
      <LiyonDialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t("common.close")}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, GraduationCap, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ProgramDto } from "@/features/curriculum";
import {
  getProgramsAction,
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from "@/features/curriculum/actions";

interface Props {
  initialPrograms: ProgramDto[];
  canManage: boolean;
}

export function ProgramsClient({ initialPrograms, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [programs, setPrograms] = useState<ProgramDto[]>(initialPrograms);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ProgramDto | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formDegreeLevel, setFormDegreeLevel] = useState<ProgramDto["degreeLevel"]>("BACHELOR");
  const [formDegreeNameTh, setFormDegreeNameTh] = useState("");
  const [formDegreeNameEn, setFormDegreeNameEn] = useState("");
  const [formCurriculumYear, setFormCurriculumYear] = useState(2567);
  const [formTotalCredits, setFormTotalCredits] = useState(128);
  const [formTuition, setFormTuition] = useState(21000);
  const [formDurationYears, setFormDurationYears] = useState(4);
  const [formBrochureUrl, setFormBrochureUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<ProgramDto["status"]>("ACTIVE");

  const refreshList = async () => {
    const res = await getProgramsAction(levelFilter === "ALL" ? undefined : levelFilter);
    if (res.ok) setPrograms(res.data);
  };

  const openCreateDialog = () => {
    setEditingProgram(null);
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormDegreeLevel("BACHELOR");
    setFormDegreeNameTh("วิทยาศาสตรบัณฑิต");
    setFormDegreeNameEn("Bachelor of Science");
    setFormCurriculumYear(2567);
    setFormTotalCredits(128);
    setFormTuition(21000);
    setFormDurationYears(4);
    setFormBrochureUrl("");
    setFormDescription("");
    setFormStatus("ACTIVE");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ProgramDto) => {
    setEditingProgram(item);
    setFormCode(item.code);
    setFormNameTh(item.nameTh);
    setFormNameEn(item.nameEn);
    setFormDegreeLevel(item.degreeLevel);
    setFormDegreeNameTh(item.degreeNameTh);
    setFormDegreeNameEn(item.degreeNameEn);
    setFormCurriculumYear(item.curriculumYear);
    setFormTotalCredits(item.totalCredits);
    setFormTuition(Number(item.tuitionFeeSemester) || 0);
    setFormDurationYears(item.durationYears);
    setFormBrochureUrl(item.brochureFileUrl || "");
    setFormDescription(item.description || "");
    setFormStatus(item.status);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      if (editingProgram) {
        const res = await updateProgramAction({
          id: editingProgram.id,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeLevel: formDegreeLevel,
          degreeNameTh: formDegreeNameTh,
          degreeNameEn: formDegreeNameEn,
          curriculumYear: Number(formCurriculumYear),
          totalCredits: Number(formTotalCredits),
          tuitionFeeSemester: Number(formTuition),
          durationYears: Number(formDurationYears),
          brochureFileUrl: formBrochureUrl || undefined,
          description: formDescription || undefined,
          status: formStatus,
        });

        if (res.ok) {
          toast.success(t("curriculum.updateSuccess"));
          setIsDialogOpen(false);
          await refreshList();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createProgramAction({
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeLevel: formDegreeLevel,
          degreeNameTh: formDegreeNameTh,
          degreeNameEn: formDegreeNameEn,
          curriculumYear: Number(formCurriculumYear),
          totalCredits: Number(formTotalCredits),
          tuitionFeeSemester: Number(formTuition),
          durationYears: Number(formDurationYears),
          brochureFileUrl: formBrochureUrl || undefined,
          description: formDescription || undefined,
          status: formStatus,
        });

        if (res.ok) {
          toast.success(t("curriculum.createSuccess"));
          setIsDialogOpen(false);
          await refreshList();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteProgramAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("curriculum.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.nameTh.toLowerCase().includes(search.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || p.degreeLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const columns: DataTableColumn<ProgramDto>[] = [
    {
      key: "code",
      header: t("curriculum.code"),
      render: (row) => <span className="font-mono font-semibold text-xs text-primary">{row.code}</span>,
    },
    {
      key: "name",
      header: t("curriculum.nameTh"),
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground leading-tight">{locale === "en" ? row.nameEn : row.nameTh}</p>
          <p className="text-xs text-muted-foreground">{locale === "en" ? row.nameTh : row.nameEn}</p>
        </div>
      ),
    },
    {
      key: "level",
      header: t("curriculum.degreeLevel"),
      render: (row) => {
        const labels: Record<string, string> = {
          BACHELOR: t("curriculum.level.bachelor"),
          MASTER: t("curriculum.level.master"),
          DOCTORAL: t("curriculum.level.doctoral"),
          DIPLOMA: t("curriculum.level.diploma"),
        };
        return <span className="text-xs font-medium text-muted-foreground">{labels[row.degreeLevel]}</span>;
      },
    },
    {
      key: "credits",
      header: t("curriculum.totalCredits"),
      render: (row) => (
        <div className="text-xs">
          <span>{row.totalCredits} หน่วยกิต</span>
          <span className="text-muted-foreground ml-1">({row.durationYears} ปี)</span>
        </div>
      ),
    },
    {
      key: "tuition",
      header: t("curriculum.tuitionFeeSemester"),
      render: (row) => (
        <span className="text-xs font-medium">
          {Number(row.tuitionFeeSemester).toLocaleString()} ฿
        </span>
      ),
    },
    {
      key: "status",
      header: t("curriculum.status"),
      render: (row) => {
        const statusMap: Record<string, { tone: "ok" | "warn" | "off"; label: string }> = {
          OPEN_ADMISSION: { tone: "ok", label: t("curriculum.status.open_admission") },
          ACTIVE: { tone: "ok", label: t("curriculum.status.active") },
          REVISED: { tone: "warn", label: t("curriculum.status.revised") },
          CLOSED: { tone: "off", label: t("curriculum.status.closed") },
        };
        const conf = statusMap[row.status] || { tone: "off", label: row.status };
        return <StatusPill tone={conf.tone}>{conf.label}</StatusPill>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            {t("curriculum.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("curriculum.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("curriculum.create")}
          </Button>
        )}
      </div>

      <LiyonCard>
        <DataTable<ProgramDto>
          state={filteredPrograms.length === 0 ? "empty" : "data"}
          headHeading={t("curriculum.title")}
          rows={filteredPrograms}
          columns={columns}
          getRowId={(row) => row.id}
          toolbar={
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="tsearch flex-1 min-w-[200px]">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหารหัส หรือชื่อหลักสูตร..."
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  startTransition(async () => {
                    const res = await getProgramsAction(e.target.value === "ALL" ? undefined : e.target.value);
                    if (res.ok) setPrograms(res.data);
                  });
                }}
              >
                <option value="ALL">ทุกระดับการศึกษา</option>
                <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                <option value="MASTER">{t("curriculum.level.master")}</option>
                <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
                <option value="DIPLOMA">{t("curriculum.level.diploma")}</option>
              </LiyonSelect>
            </div>
          }
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => openEditDialog(row)}
                      icon={<Pencil className="h-4 w-4" />}
                    >
                      {t("curriculum.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmItem(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("curriculum.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <GraduationCap className="h-10 w-10 text-muted-foreground/50" />,
            title: t("curriculum.empty"),
            description: t("curriculum.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} wide>
        <LiyonDialogHeader
          title={editingProgram ? t("curriculum.edit") : t("curriculum.create")}
          description={t("curriculum.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.code")}>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="เช่น CS-BSc"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("curriculum.degreeLevel")}>
                <LiyonSelect
                  value={formDegreeLevel}
                  onChange={(e) => setFormDegreeLevel(e.target.value as ProgramDto["degreeLevel"])}
                >
                  <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                  <option value="MASTER">{t("curriculum.level.master")}</option>
                  <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
                  <option value="DIPLOMA">{t("curriculum.level.diploma")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.nameTh")}>
                <input
                  type="text"
                  value={formNameTh}
                  onChange={(e) => setFormNameTh(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("curriculum.nameEn")}>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.degreeNameTh")}>
                <input
                  type="text"
                  value={formDegreeNameTh}
                  onChange={(e) => setFormDegreeNameTh(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("curriculum.degreeNameEn")}>
                <input
                  type="text"
                  value={formDegreeNameEn}
                  onChange={(e) => setFormDegreeNameEn(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <LiyonField label={t("curriculum.curriculumYear")}>
                <input
                  type="number"
                  value={formCurriculumYear}
                  onChange={(e) => setFormCurriculumYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("curriculum.totalCredits")}>
                <input
                  type="number"
                  value={formTotalCredits}
                  onChange={(e) => setFormTotalCredits(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("curriculum.durationYears")}>
                <input
                  type="number"
                  value={formDurationYears}
                  onChange={(e) => setFormDurationYears(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("curriculum.tuitionFeeSemester")}>
                <input
                  type="number"
                  value={formTuition}
                  onChange={(e) => setFormTuition(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.status")}>
                <LiyonSelect
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as ProgramDto["status"])}
                >
                  <option value="OPEN_ADMISSION">{t("curriculum.status.open_admission")}</option>
                  <option value="ACTIVE">{t("curriculum.status.active")}</option>
                  <option value="REVISED">{t("curriculum.status.revised")}</option>
                  <option value="CLOSED">{t("curriculum.status.closed")}</option>
                </LiyonSelect>
              </LiyonField>
              <LiyonField label={t("curriculum.brochureFileUrl")}>
                <input
                  type="url"
                  value={formBrochureUrl}
                  onChange={(e) => setFormBrochureUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("curriculum.description")}>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            {t("curriculum.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {t("curriculum.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteConfirmItem(null)}>
        <LiyonDialogHeader
          title={t("curriculum.delete")}
          description={t("curriculum.deleteConfirm")}
        />
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmItem(null)}>
            {t("curriculum.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("curriculum.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

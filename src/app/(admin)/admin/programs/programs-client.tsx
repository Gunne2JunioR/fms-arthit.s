"use client";

import { useState, useTransition } from "react";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Search,
  Landmark,
  GitBranch,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";
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
import type { ProgramDto, FacultyDto } from "@/features/curriculum";
import type { DepartmentDto, StaffProfileDto } from "@/features/directory";
import {
  getProgramsAction,
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from "@/features/curriculum/actions";

interface Props {
  initialPrograms: ProgramDto[];
  faculties: FacultyDto[];
  departments: DepartmentDto[];
  staffList: StaffProfileDto[];
  canManage: boolean;
}

export function ProgramsClient({
  initialPrograms,
  faculties,
  departments,
  staffList,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [programs, setPrograms] = useState<ProgramDto[]>(initialPrograms);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ProgramDto | null>(null);
  const [formTab, setFormTab] = useState<"basic" | "affiliation" | "details">("basic");
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form State
  const [formFacultyId, setFormFacultyId] = useState<string>("");
  const [formDepartmentId, setFormDepartmentId] = useState<string>("");
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formDegreeLevel, setFormDegreeLevel] = useState<ProgramDto["degreeLevel"]>("BACHELOR");
  const [formDegreeNameTh, setFormDegreeNameTh] = useState("");
  const [formDegreeNameEn, setFormDegreeNameEn] = useState("");
  const [formDegreeShortTh, setFormDegreeShortTh] = useState("");
  const [formDegreeShortEn, setFormDegreeShortEn] = useState("");
  const [formProgramType, setFormProgramType] = useState("regular");
  const [formMajorName, setFormMajorName] = useState("");
  const [formCurriculumYear, setFormCurriculumYear] = useState(2567);
  const [formStartAcademicYear, setFormStartAcademicYear] = useState(2567);
  const [formStudyFormat, setFormStudyFormat] = useState("onsite");
  const [formInstructionLanguage, setFormInstructionLanguage] = useState("th");
  const [formTotalCredits, setFormTotalCredits] = useState(128);
  const [formTuition, setFormTuition] = useState(21000);
  const [formDurationYears, setFormDurationYears] = useState(4);
  const [formBrochureUrl, setFormBrochureUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDirectors, setFormDirectors] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<ProgramDto["status"]>("ACTIVE");

  const refreshList = async () => {
    const res = await getProgramsAction(
      levelFilter === "ALL" ? undefined : levelFilter,
      departmentFilter === "ALL" ? undefined : departmentFilter,
      facultyFilter === "ALL" ? undefined : facultyFilter,
      statusFilter === "ALL" ? undefined : statusFilter
    );
    if (res.ok) setPrograms(res.data);
  };

  // Dynamic department options filtered by selected faculty in form
  const availableFormDepartments = departments.filter(
    (d) => !formFacultyId || d.facultyId === formFacultyId
  );

  // Dynamic department options filtered by selected faculty in toolbar
  const availableFilterDepartments = departments.filter(
    (d) => facultyFilter === "ALL" || d.facultyId === facultyFilter
  );

  const openCreateDialog = () => {
    setEditingProgram(null);
    setFormTab("basic");
    const defaultFacId = faculties[0]?.id || "";
    setFormFacultyId(defaultFacId);
    const initialDepts = departments.filter((d) => !defaultFacId || d.facultyId === defaultFacId);
    setFormDepartmentId(initialDepts[0]?.id || "");
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormDegreeLevel("BACHELOR");
    setFormDegreeNameTh("วิทยาศาสตรบัณฑิต");
    setFormDegreeNameEn("Bachelor of Science");
    setFormDegreeShortTh("วท.บ.");
    setFormDegreeShortEn("B.Sc.");
    setFormProgramType("regular");
    setFormMajorName("");
    setFormCurriculumYear(2567);
    setFormStartAcademicYear(2567);
    setFormStudyFormat("onsite");
    setFormInstructionLanguage("th");
    setFormTotalCredits(128);
    setFormTuition(21000);
    setFormDurationYears(4);
    setFormBrochureUrl("");
    setFormDescription("");
    setFormDirectors([]);
    setFormStatus("ACTIVE");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ProgramDto) => {
    setEditingProgram(item);
    setFormTab("basic");
    setFormFacultyId(item.facultyId || faculties[0]?.id || "");
    setFormDepartmentId(item.departmentId || "");
    setFormCode(item.code);
    setFormNameTh(item.nameTh);
    setFormNameEn(item.nameEn);
    setFormDegreeLevel(item.degreeLevel);
    setFormDegreeNameTh(item.degreeNameTh);
    setFormDegreeNameEn(item.degreeNameEn);
    setFormDegreeShortTh(item.degreeShortTh || "");
    setFormDegreeShortEn(item.degreeShortEn || "");
    setFormProgramType(item.programType || "regular");
    setFormMajorName(item.majorName || "");
    setFormCurriculumYear(item.curriculumYear);
    setFormStartAcademicYear(item.startAcademicYear || item.curriculumYear);
    setFormStudyFormat(item.studyFormat || "onsite");
    setFormInstructionLanguage(item.instructionLanguage || "th");
    setFormTotalCredits(item.totalCredits);
    setFormTuition(Number(item.tuitionFeeSemester) || 0);
    setFormDurationYears(item.durationYears);
    setFormBrochureUrl(item.brochureFileUrl || "");
    setFormDescription(item.description || "");
    setFormDirectors(item.programDirectorIds || []);
    setFormStatus(item.status);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      if (editingProgram) {
        const res = await updateProgramAction({
          id: editingProgram.id,
          facultyId: formFacultyId,
          departmentId: formDepartmentId || null,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeLevel: formDegreeLevel,
          degreeNameTh: formDegreeNameTh,
          degreeNameEn: formDegreeNameEn,
          degreeShortTh: formDegreeShortTh || undefined,
          degreeShortEn: formDegreeShortEn || undefined,
          programType: formProgramType || undefined,
          majorName: formMajorName || undefined,
          curriculumYear: Number(formCurriculumYear),
          startAcademicYear: Number(formStartAcademicYear) || undefined,
          studyFormat: formStudyFormat || undefined,
          instructionLanguage: formInstructionLanguage || undefined,
          totalCredits: Number(formTotalCredits),
          tuitionFeeSemester: Number(formTuition),
          durationYears: Number(formDurationYears),
          brochureFileUrl: formBrochureUrl || undefined,
          description: formDescription || undefined,
          programDirectorIds: formDirectors,
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
          facultyId: formFacultyId,
          departmentId: formDepartmentId || null,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeLevel: formDegreeLevel,
          degreeNameTh: formDegreeNameTh,
          degreeNameEn: formDegreeNameEn,
          degreeShortTh: formDegreeShortTh || undefined,
          degreeShortEn: formDegreeShortEn || undefined,
          programType: formProgramType || undefined,
          majorName: formMajorName || undefined,
          curriculumYear: Number(formCurriculumYear),
          startAcademicYear: Number(formStartAcademicYear) || undefined,
          studyFormat: formStudyFormat || undefined,
          instructionLanguage: formInstructionLanguage || undefined,
          totalCredits: Number(formTotalCredits),
          tuitionFeeSemester: Number(formTuition),
          durationYears: Number(formDurationYears),
          brochureFileUrl: formBrochureUrl || undefined,
          description: formDescription || undefined,
          programDirectorIds: formDirectors,
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
        if (res.data.archived) {
          toast.success(t("curriculum.archivedSuccess"));
        } else {
          toast.success(t("curriculum.deleteSuccess"));
        }
        setDeleteConfirmItem(null);
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "รหัสหลักสูตร",
      "ชื่อภาษาไทย",
      "ชื่อภาษาอังกฤษ",
      "ระดับการศึกษา",
      "ชื่อปริญญา (ไทย)",
      "ชื่อย่อ (ไทย)",
      "คณะที่สังกัด",
      "ภาควิชาที่รับผิดชอบ",
      "ปีหลักสูตร",
      "หน่วยกิต",
      "ค่าเทอม",
      "ระยะเวลา (ปี)",
      "สถานะ",
    ];

    const rows = filteredPrograms.map((p) => [
      `"${p.code}"`,
      `"${p.nameTh}"`,
      `"${p.nameEn}"`,
      `"${p.degreeLevel}"`,
      `"${p.degreeNameTh}"`,
      `"${p.degreeShortTh || ""}"`,
      `"${p.facultyNameTh || ""}"`,
      `"${p.departmentNameTh || ""}"`,
      `"${p.curriculumYear}"`,
      `"${p.totalCredits}"`,
      `"${p.tuitionFeeSemester}"`,
      `"${p.durationYears}"`,
      `"${p.status}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `programs_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ส่งออกข้อมูล CSV สำเร็จ");
  };

  const filteredPrograms = programs.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.code.toLowerCase().includes(q) ||
      p.nameTh.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      (p.facultyNameTh && p.facultyNameTh.toLowerCase().includes(q)) ||
      (p.departmentNameTh && p.departmentNameTh.toLowerCase().includes(q));
    const matchesLevel = levelFilter === "ALL" || p.degreeLevel === levelFilter;
    const matchesFaculty = facultyFilter === "ALL" || p.facultyId === facultyFilter;
    const matchesDept = departmentFilter === "ALL" || p.departmentId === departmentFilter;
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesLevel && matchesFaculty && matchesDept && matchesStatus;
  });

  const columns: DataTableColumn<ProgramDto>[] = [
    {
      key: "code",
      header: t("curriculum.code"),
      render: (row) => (
        <span className="font-mono font-semibold text-xs text-primary px-2 py-0.5 rounded bg-primary/10">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: t("curriculum.nameTh"),
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground leading-tight">
              {locale === "en" ? row.nameEn : row.nameTh}
            </span>
            {row.degreeShortTh && (
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                {row.degreeShortTh}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {locale === "en" ? row.nameTh : row.nameEn}
          </p>
        </div>
      ),
    },
    {
      key: "degreeLevel",
      header: t("curriculum.degreeLevel"),
      render: (row) => {
        const labels: Record<string, string> = {
          BACHELOR: t("curriculum.level.bachelor"),
          MASTER: t("curriculum.level.master"),
          DOCTORAL: t("curriculum.level.doctoral"),
          DIPLOMA: t("curriculum.level.diploma"),
        };
        return <span className="text-xs font-medium text-foreground">{labels[row.degreeLevel]}</span>;
      },
    },
    {
      key: "faculty",
      header: t("curriculum.faculty"),
      render: (row) => {
        if (!row.facultyNameTh) return <span className="text-xs text-muted-foreground italic">-</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs text-foreground">
            <Landmark className="h-3 w-3 text-muted-foreground" />
            <span>{locale === "en" ? (row.facultyNameEn || row.facultyNameTh) : row.facultyNameTh}</span>
          </span>
        );
      },
    },
    {
      key: "department",
      header: t("curriculum.department"),
      render: (row) => {
        if (!row.departmentNameTh) return <span className="text-xs text-muted-foreground italic">{t("curriculum.noDepartment")}</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            <span>{locale === "en" ? (row.departmentNameEn || row.departmentNameTh) : row.departmentNameTh}</span>
          </span>
        );
      },
    },
    {
      key: "curriculumYear",
      header: t("curriculum.curriculumYear"),
      render: (row) => <span className="text-xs font-mono">{row.curriculumYear}</span>,
    },
    {
      key: "totalCredits",
      header: t("curriculum.totalCredits"),
      render: (row) => (
        <span className="text-xs">
          {row.totalCredits} นก. ({row.durationYears} ปี)
        </span>
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
      key: "directors",
      header: t("curriculum.directors"),
      render: (row) => {
        if (!row.directors || row.directors.length === 0) {
          return <span className="text-xs text-muted-foreground italic">-</span>;
        }
        return (
          <div className="space-y-0.5 max-w-[180px]">
            {row.directors.slice(0, 2).map((d) => (
              <p key={d.id} className="text-xs truncate text-foreground">
                • {locale === "en" ? d.nameEn : d.nameTh}
              </p>
            ))}
            {row.directors.length > 2 && (
              <span className="text-[11px] text-muted-foreground font-semibold">
                +{row.directors.length - 2} ท่าน
              </span>
            )}
          </div>
        );
      },
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
          ARCHIVED: { tone: "off", label: t("curriculum.status.archived") },
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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleExportCsv} className="gap-2">
            <Download className="h-4 w-4" />
            {t("curriculum.exportBtn")}
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            {t("curriculum.importBtn")}
          </Button>
          {canManage && (
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("curriculum.create")}
            </Button>
          )}
        </div>
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
                  placeholder="ค้นหารหัส, ชื่อหลักสูตร, คณะ หรือภาควิชา..."
                  aria-label={t("common.search")}
                />
              </span>

              <div className="w-40">
                <LiyonSelect
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  aria-label={t("curriculum.filterLevel")}
                >
                  <option value="ALL">{t("curriculum.filterLevel")}</option>
                  <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                  <option value="MASTER">{t("curriculum.level.master")}</option>
                  <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
                  <option value="DIPLOMA">{t("curriculum.level.diploma")}</option>
                </LiyonSelect>
              </div>

              <div className="w-48">
                <LiyonSelect
                  value={facultyFilter}
                  onChange={(e) => {
                    setFacultyFilter(e.target.value);
                    setDepartmentFilter("ALL");
                  }}
                  aria-label={t("curriculum.filterFaculty")}
                >
                  <option value="ALL">{t("curriculum.filterFaculty")}</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {locale === "en" ? f.nameEn : f.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </div>

              <div className="w-48">
                <LiyonSelect
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  aria-label={t("curriculum.filterDepartment")}
                >
                  <option value="ALL">{t("curriculum.filterDepartment")}</option>
                  {availableFilterDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "en" ? d.nameEn : d.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </div>

              <div className="w-40">
                <LiyonSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label={t("curriculum.filterStatus")}
                >
                  <option value="ALL">{t("curriculum.filterStatus")}</option>
                  <option value="OPEN_ADMISSION">{t("curriculum.status.open_admission")}</option>
                  <option value="ACTIVE">{t("curriculum.status.active")}</option>
                  <option value="REVISED">{t("curriculum.status.revised")}</option>
                  <option value="CLOSED">{t("curriculum.status.closed")}</option>
                  <option value="ARCHIVED">{t("curriculum.status.archived")}</option>
                </LiyonSelect>
              </div>
            </div>
          }
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem onSelect={() => openEditDialog(row)} icon={<Pencil className="h-4 w-4 mr-2" />}>
                      {t("curriculum.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmItem(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4 mr-2" />}
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

      {/* Program Create / Edit Modal (Tabbed Form) */}
      <LiyonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>
                {editingProgram ? t("curriculum.edit") : t("curriculum.create")}
              </span>
            </div>
          }
        />

        {/* Tab Navigation */}
        <div className="flex border-b px-6 gap-6 text-sm font-medium">
          <button
            type="button"
            className={`py-3 border-b-2 transition-colors ${
              formTab === "basic"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setFormTab("basic")}
          >
            1. {t("curriculum.tabBasic")}
          </button>
          <button
            type="button"
            className={`py-3 border-b-2 transition-colors ${
              formTab === "affiliation"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setFormTab("affiliation")}
          >
            2. {t("curriculum.tabAffiliation")}
          </button>
          <button
            type="button"
            className={`py-3 border-b-2 transition-colors ${
              formTab === "details"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setFormTab("details")}
          >
            3. {t("curriculum.tabDetails")}
          </button>
        </div>

        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pt-4">
          {formTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.code")}>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="เช่น CS-2567, BBA-65"
                    className="w-full px-3 py-2 rounded-md border text-sm font-mono"
                    required
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.degreeLevel")}>
                  <LiyonSelect
                    value={formDegreeLevel}
                    onChange={(e) => setFormDegreeLevel(e.target.value as ProgramDto["degreeLevel"])}
                    required
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
                    placeholder="ชื่อหลักสูตรภาษาไทย"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    required
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.nameEn")}>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="Program Name in English"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    required
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.degreeNameTh")}>
                  <input
                    type="text"
                    value={formDegreeNameTh}
                    onChange={(e) => setFormDegreeNameTh(e.target.value)}
                    placeholder="เช่น วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    required
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.degreeNameEn")}>
                  <input
                    type="text"
                    value={formDegreeNameEn}
                    onChange={(e) => setFormDegreeNameEn(e.target.value)}
                    placeholder="Bachelor of Science (Computer Science)"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    required
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.degreeShortTh")}>
                  <input
                    type="text"
                    value={formDegreeShortTh}
                    onChange={(e) => setFormDegreeShortTh(e.target.value)}
                    placeholder="เช่น วท.บ. (วิทยาการคอมพิวเตอร์)"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.degreeShortEn")}>
                  <input
                    type="text"
                    value={formDegreeShortEn}
                    onChange={(e) => setFormDegreeShortEn(e.target.value)}
                    placeholder="เช่น B.Sc. (Computer Science)"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.programType")}>
                  <LiyonSelect
                    value={formProgramType}
                    onChange={(e) => setFormProgramType(e.target.value)}
                  >
                    <option value="regular">{t("curriculum.type.regular")}</option>
                    <option value="special">{t("curriculum.type.special")}</option>
                    <option value="international">{t("curriculum.type.international")}</option>
                    <option value="bilingual">{t("curriculum.type.bilingual")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label={t("curriculum.majorName")}>
                  <input
                    type="text"
                    value={formMajorName}
                    onChange={(e) => setFormMajorName(e.target.value)}
                    placeholder="เช่น ปัญญาประดิษฐ์และวิทยาการข้อมูล"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                  />
                </LiyonField>
              </div>
            </div>
          )}

          {formTab === "affiliation" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.faculty")}>
                  <LiyonSelect
                    value={formFacultyId}
                    onChange={(e) => {
                      setFormFacultyId(e.target.value);
                      setFormDepartmentId("");
                    }}
                    required
                  >
                    <option value="">{t("curriculum.filterFaculty")}</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.code} - {locale === "en" ? f.nameEn : f.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label={t("curriculum.department")}>
                  <LiyonSelect
                    value={formDepartmentId}
                    onChange={(e) => setFormDepartmentId(e.target.value)}
                  >
                    <option value="">{t("curriculum.noDepartment")}</option>
                    {availableFormDepartments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {locale === "en" ? d.nameEn : d.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>
              </div>

              <LiyonField label={t("curriculum.directors")}>
                <div className="p-3 border rounded-lg max-h-48 overflow-y-auto space-y-2 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-2">{t("curriculum.selectDirectors")}</p>
                  {staffList.map((s) => {
                    const isSelected = formDirectors.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-card cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormDirectors((prev) => [...prev, s.id]);
                            } else {
                              setFormDirectors((prev) => prev.filter((id) => id !== s.id));
                            }
                          }}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="font-medium text-foreground">{s.fullNameTh}</span>
                        <span className="text-muted-foreground">({s.departmentNameTh})</span>
                      </label>
                    );
                  })}
                </div>
              </LiyonField>
            </div>
          )}

          {formTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.curriculumYear")}>
                  <input
                    type="number"
                    value={formCurriculumYear}
                    onChange={(e) => setFormCurriculumYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    required
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.startAcademicYear")}>
                  <input
                    type="number"
                    value={formStartAcademicYear}
                    onChange={(e) => setFormStartAcademicYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.studyFormat")}>
                  <LiyonSelect
                    value={formStudyFormat}
                    onChange={(e) => setFormStudyFormat(e.target.value)}
                  >
                    <option value="onsite">{t("curriculum.format.onsite")}</option>
                    <option value="online">{t("curriculum.format.online")}</option>
                    <option value="hybrid">{t("curriculum.format.hybrid")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label={t("curriculum.instructionLanguage")}>
                  <LiyonSelect
                    value={formInstructionLanguage}
                    onChange={(e) => setFormInstructionLanguage(e.target.value)}
                  >
                    <option value="th">{t("curriculum.lang.th")}</option>
                    <option value="en">{t("curriculum.lang.en")}</option>
                    <option value="bilingual">{t("curriculum.lang.bilingual")}</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LiyonField label={t("curriculum.totalCredits")}>
                  <input
                    type="number"
                    value={formTotalCredits}
                    onChange={(e) => setFormTotalCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    required
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.durationYears")}>
                  <input
                    type="number"
                    value={formDurationYears}
                    onChange={(e) => setFormDurationYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    required
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.tuitionFeeSemester")}>
                  <input
                    type="number"
                    value={formTuition}
                    onChange={(e) => setFormTuition(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border text-sm"
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
                    <option value="ARCHIVED">{t("curriculum.status.archived")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label={t("curriculum.brochureFileUrl")}>
                  <input
                    type="url"
                    value={formBrochureUrl}
                    onChange={(e) => setFormBrochureUrl(e.target.value)}
                    placeholder="https://.../brochure.pdf"
                    className="w-full px-3 py-2 rounded-md border text-sm"
                  />
                </LiyonField>
              </div>

              <LiyonField label={t("curriculum.description")}>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t("curriculum.description")}
                  className="w-full px-3 py-2 rounded-md border text-sm"
                />
              </LiyonField>
            </div>
          )}
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            {t("curriculum.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !formCode || !formNameTh || !formNameEn || !formFacultyId}
          >
            {isPending ? t("common.saving") : t("curriculum.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Modal */}
      <LiyonDialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <LiyonDialogHeader
          title={<span className="text-destructive">{t("curriculum.delete")}</span>}
        />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("curriculum.archiveConfirm")}</p>
          {deleteConfirmItem && (
            <p className="mt-2 text-sm font-semibold text-foreground">
              {deleteConfirmItem.code} - {deleteConfirmItem.nameTh}
            </p>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmItem(null)}>
            {t("curriculum.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? t("common.deleting") : t("curriculum.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* CSV Import Modal */}
      <LiyonDialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>{t("curriculum.importTitle")}</span>
            </div>
          }
        />
        <LiyonDialogBody className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("curriculum.importDesc")}</p>
          <div className="p-4 border rounded-lg bg-muted/40 space-y-2">
            <p className="text-xs font-semibold text-foreground">{t("curriculum.downloadTemplate")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const sample = "\uFEFFรหัสหลักสูตร,ชื่อภาษาไทย,ชื่อภาษาอังกฤษ,ระดับการศึกษา,ชื่อปริญญา(ไทย),ชื่อปริญญา(อังกฤษ),รหัสคณะ,รหัสภาควิชา,ปีปรับปรุง,หน่วยกิต,ค่าเทอม,ระยะเวลาปี,สถานะ\r\nCS-2567,หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์,Bachelor of Science in Computer Science,BACHELOR,วิทยาศาสตรบัณฑิต,Bachelor of Science,FMS,CS,2567,128,21000,4,ACTIVE";
                const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "programs_template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              programs_template.csv
            </Button>
          </div>
          <LiyonField label={t("curriculum.uploadFile")}>
            <input
              type="file"
              accept=".csv"
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (event) => {
                  try {
                    const text = event.target?.result as string;
                    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
                    if (lines.length <= 1) {
                      toast.error("ไฟล์ไม่มีข้อมูล");
                      return;
                    }
                    let count = 0;
                    for (let i = 1; i < lines.length; i++) {
                      const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
                      if (!cols[0] || !cols[1] || !cols[2]) continue;
                      const matchedFaculty = faculties.find((f) => f.code === cols[6]);
                      const matchedDept = departments.find((d) => d.code === cols[7]);
                      await createProgramAction({
                        code: cols[0],
                        nameTh: cols[1],
                        nameEn: cols[2],
                        degreeLevel: cols[3] || "BACHELOR",
                        degreeNameTh: cols[4] || cols[1],
                        degreeNameEn: cols[5] || cols[2],
                        facultyId: matchedFaculty?.id || faculties[0]?.id,
                        departmentId: matchedDept?.id || null,
                        curriculumYear: Number(cols[8]) || 2567,
                        totalCredits: Number(cols[9]) || 128,
                        tuitionFeeSemester: Number(cols[10]) || 0,
                        durationYears: Number(cols[11]) || 4,
                        status: cols[12] || "ACTIVE",
                      });
                      count++;
                    }
                    toast.success(`นำเข้าสำเร็จ ${count} รายการ`);
                    setIsImportOpen(false);
                    await refreshList();
                  } catch {
                    toast.error("เกิดข้อผิดพลาดในการนำเข้าไฟล์");
                  }
                };
                reader.readAsText(file);
              }}
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setIsImportOpen(false)}>
            {t("curriculum.cancel")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

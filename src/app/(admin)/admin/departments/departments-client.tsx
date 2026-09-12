"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
  Users,
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  Landmark,
  User,
  Mail,
  Phone,
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
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentDto, StaffProfileDto } from "@/features/directory";
import type { FacultyDto } from "@/features/curriculum";
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/features/directory/actions";

interface Props {
  initialDepartments: DepartmentDto[];
  faculties: FacultyDto[];
  staffList: StaffProfileDto[];
  canManage: boolean;
}

export function DepartmentsClient({ initialDepartments, faculties, staffList, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [departments, setDepartments] = useState<DepartmentDto[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Create / Edit modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);

  // Programs Drawer/Modal state
  const [viewingProgramsDept, setViewingProgramsDept] = useState<DepartmentDto | null>(null);

  // Delete modal state
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentDto | null>(null);

  // Import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form states
  const [formFacultyId, setFormFacultyId] = useState<string>("");
  const [formHeadStaffId, setFormHeadStaffId] = useState<string>("");
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formShortNameTh, setFormShortNameTh] = useState("");
  const [formShortNameEn, setFormShortNameEn] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formOfficeLocation, setFormOfficeLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<DepartmentDto["status"]>("ACTIVE");
  const [formSortOrder, setFormSortOrder] = useState(0);

  const refreshList = async () => {
    const res = await getDepartmentsAction(
      selectedFaculty === "ALL" ? undefined : selectedFaculty,
      selectedStatus === "ALL" ? undefined : selectedStatus
    );
    if (res.ok) setDepartments(res.data);
  };

  const openCreateDialog = () => {
    setEditingDept(null);
    setFormFacultyId(faculties[0]?.id || "");
    setFormHeadStaffId("");
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormShortNameTh("");
    setFormShortNameEn("");
    setFormEmail("");
    setFormPhone("");
    setFormOfficeLocation("");
    setFormDescription("");
    setFormStatus("ACTIVE");
    setFormSortOrder(departments.length + 1);
    setIsDialogOpen(true);
  };

  const openEditDialog = (dept: DepartmentDto) => {
    setEditingDept(dept);
    setFormFacultyId(dept.facultyId || "");
    setFormHeadStaffId(dept.headStaffId || "");
    setFormCode(dept.code);
    setFormNameTh(dept.nameTh);
    setFormNameEn(dept.nameEn);
    setFormShortNameTh(dept.shortNameTh || "");
    setFormShortNameEn(dept.shortNameEn || "");
    setFormEmail(dept.email || "");
    setFormPhone(dept.phone || "");
    setFormOfficeLocation(dept.officeLocation || "");
    setFormDescription(dept.description || "");
    setFormStatus(dept.status);
    setFormSortOrder(dept.sortOrder);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      if (editingDept) {
        const res = await updateDepartmentAction({
          id: editingDept.id,
          facultyId: formFacultyId || null,
          headStaffId: formHeadStaffId || null,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          shortNameTh: formShortNameTh || undefined,
          shortNameEn: formShortNameEn || undefined,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          officeLocation: formOfficeLocation || undefined,
          description: formDescription || undefined,
          status: formStatus,
          sortOrder: Number(formSortOrder),
        });
        if (res.ok) {
          toast.success(t("department.updateSuccess"));
          setIsDialogOpen(false);
          await refreshList();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createDepartmentAction({
          facultyId: formFacultyId || null,
          headStaffId: formHeadStaffId || null,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          shortNameTh: formShortNameTh || undefined,
          shortNameEn: formShortNameEn || undefined,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          officeLocation: formOfficeLocation || undefined,
          description: formDescription || undefined,
          status: formStatus,
          sortOrder: Number(formSortOrder),
        });
        if (res.ok) {
          toast.success(t("department.createSuccess"));
          setIsDialogOpen(false);
          await refreshList();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmDept) return;
    startTransition(async () => {
      const res = await deleteDepartmentAction(deleteConfirmDept.id);
      if (res.ok) {
        if (res.data.archived) {
          toast.success(t("department.archiveSuccess"));
        } else {
          toast.success(t("department.deleteSuccess"));
        }
        setDeleteConfirmDept(null);
        await refreshList();
      } else {
        if (res.error.code === "conflict" || res.error.message.includes("department_has_relations")) {
          toast.error(t("department.hasRelationsError"));
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "รหัสภาควิชา",
      "ชื่อภาษาไทย",
      "ชื่อภาษาอังกฤษ",
      "ชื่อย่อภาษาไทย",
      "ชื่อย่อภาษาอังกฤษ",
      "คณะที่สังกัด",
      "หัวหน้าภาควิชา",
      "อีเมล",
      "เบอร์โทร",
      "สถานที่ตั้ง",
      "สถานะ",
      "จำนวนหลักสูตร",
      "จำนวนบุคลากร",
    ];

    const rows = filteredDepts.map((d) => [
      `"${d.code}"`,
      `"${d.nameTh}"`,
      `"${d.nameEn}"`,
      `"${d.shortNameTh || ""}"`,
      `"${d.shortNameEn || ""}"`,
      `"${d.facultyNameTh || ""}"`,
      `"${d.headStaffNameTh || ""}"`,
      `"${d.email || ""}"`,
      `"${d.phone || ""}"`,
      `"${d.officeLocation || ""}"`,
      `"${d.status}"`,
      `"${d.programsCount ?? 0}"`,
      `"${d.staffCount ?? 0}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `departments_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ส่งออกข้อมูล CSV สำเร็จ");
  };

  const filteredDepts = departments.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      d.code.toLowerCase().includes(q) ||
      d.nameTh.toLowerCase().includes(q) ||
      d.nameEn.toLowerCase().includes(q) ||
      (d.facultyNameTh && d.facultyNameTh.toLowerCase().includes(q)) ||
      (d.headStaffNameTh && d.headStaffNameTh.toLowerCase().includes(q));
    const matchesFaculty = selectedFaculty === "ALL" || d.facultyId === selectedFaculty;
    const matchesStatus = selectedStatus === "ALL" || d.status === selectedStatus;
    return matchesSearch && matchesFaculty && matchesStatus;
  });

  const columns: DataTableColumn<DepartmentDto>[] = [
    {
      key: "code",
      header: t("department.code"),
      render: (row) =>
        canManage ? (
          <button
            type="button"
            onClick={() => openEditDialog(row)}
            className="font-mono font-semibold text-xs text-primary px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 hover:underline transition-colors cursor-pointer"
            title={t("department.editBtn")}
          >
            {row.code}
          </button>
        ) : (
          <span className="font-mono font-semibold text-xs text-primary px-2 py-0.5 rounded bg-primary/10">
            {row.code}
          </span>
        ),
    },
    {
      key: "name",
      header: t("department.nameTh"),
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            {canManage ? (
              <button
                type="button"
                onClick={() => openEditDialog(row)}
                className="font-medium text-foreground leading-tight text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                title={t("department.editBtn")}
              >
                {locale === "en" ? row.nameEn : row.nameTh}
              </button>
            ) : (
              <span className="font-medium text-foreground leading-tight">
                {locale === "en" ? row.nameEn : row.nameTh}
              </span>
            )}
            {row.shortNameTh && (
              <span className="text-xs px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono shrink-0">
                {row.shortNameTh}
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
      key: "faculty",
      header: t("department.faculty"),
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
      key: "head",
      header: t("department.head"),
      render: (row) => {
        if (!row.headStaffNameTh) return <span className="text-xs text-muted-foreground italic">-</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs text-foreground">
            <User className="h-3 w-3 text-muted-foreground" />
            <span>{locale === "en" ? (row.headStaffNameEn || row.headStaffNameTh) : row.headStaffNameTh}</span>
          </span>
        );
      },
    },
    {
      key: "contact",
      header: t("department.email"),
      render: (row) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          {row.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{row.phone}</span>
            </div>
          )}
          {!row.email && !row.phone && <span>-</span>}
        </div>
      ),
    },
    {
      key: "programs",
      header: t("department.programsCount"),
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewingProgramsDept(row)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>{row.programsCount ?? 0}</span>
        </button>
      ),
    },
    {
      key: "staff",
      header: t("department.staffCount"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{row.staffCount ?? 0}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: t("department.status"),
      render: (row) => {
        const map: Record<string, { tone: "ok" | "warn" | "off"; label: string }> = {
          ACTIVE: { tone: "ok", label: t("faculty.status.active") },
          INACTIVE: { tone: "warn", label: t("faculty.status.inactive") },
          ARCHIVED: { tone: "off", label: t("faculty.status.archived") },
        };
        const conf = map[row.status] || { tone: "off", label: row.status };
        return <StatusPill tone={conf.tone}>{conf.label}</StatusPill>;
      },
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: t("curriculum.actions"),
            className:
              "text-right sticky right-0 bg-background/95 backdrop-blur-md z-10 min-w-[145px] px-3 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] border-l",
            render: (row: DepartmentDto) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium"
                  onClick={() => openEditDialog(row)}
                  title={t("department.editBtn")}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {t("department.editBtn")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-colors text-xs font-medium"
                  onClick={() => setDeleteConfirmDept(row)}
                  title={t("department.deleteBtn")}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {t("department.deleteBtn")}
                </Button>
              </div>
            ),
          } as DataTableColumn<DepartmentDto>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            {t("department.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("department.subtitle")}</p>
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
              {t("department.addBtn")}
            </Button>
          )}
        </div>
      </div>

      <LiyonCard>
        <DataTable<DepartmentDto>
          state={filteredDepts.length === 0 ? "empty" : "data"}
          headHeading={t("department.listTitle")}
          rows={filteredDepts}
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
                  placeholder="ค้นหารหัส, ชื่อภาควิชา หรือหัวหน้าภาค..."
                  aria-label={t("common.search")}
                />
              </span>

              <div className="w-56">
                <LiyonSelect
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  aria-label={t("department.filterFaculty")}
                >
                  <option value="ALL">{t("department.filterFaculty")}</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {locale === "en" ? f.nameEn : f.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </div>

              <div className="w-44">
                <LiyonSelect
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label={t("department.filterStatus")}
                >
                  <option value="ALL">{t("department.filterStatus")}</option>
                  <option value="ACTIVE">{t("faculty.status.active")}</option>
                  <option value="INACTIVE">{t("faculty.status.inactive")}</option>
                  <option value="ARCHIVED">{t("faculty.status.archived")}</option>
                </LiyonSelect>
              </div>
            </div>
          }
          empty={{
            icon: <GitBranch className="h-10 w-10 text-muted-foreground/50" />,
            title: t("department.empty"),
            description: t("department.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Programs List Drawer / Dialog */}
      <LiyonDialog open={!!viewingProgramsDept} onOpenChange={() => setViewingProgramsDept(null)}>
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>
                {viewingProgramsDept?.nameTh} ({viewingProgramsDept?.code})
              </span>
            </div>
          }
        />
        <LiyonDialogBody className="space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-muted-foreground">{t("department.viewPrograms")}</p>
          {viewingProgramsDept?.programs && viewingProgramsDept.programs.length > 0 ? (
            <div className="divide-y border rounded-lg overflow-hidden">
              {viewingProgramsDept.programs.map((p) => (
                <div key={p.id} className="p-3 bg-card hover:bg-muted/50 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary mr-2">[{p.code}]</span>
                    <span className="text-sm font-medium text-foreground">
                      {locale === "en" ? p.nameEn : p.nameTh}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ระดับ: {p.degreeLevel} • สถานะ: {p.status}
                    </div>
                  </div>
                  <Link
                    href="/admin/programs"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <span>ไปหน้าหลักสูตร</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
              <AlertCircle className="h-6 w-6 mx-auto mb-1 text-muted-foreground/60" />
              <p>{t("department.noPrograms")}</p>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setViewingProgramsDept(null)}>
            {t("curriculum.cancel")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Create / Edit Department Modal */}
      <LiyonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              <span>
                {editingDept ? t("department.editBtn") : t("department.addBtn")}
              </span>
            </div>
          }
        />

        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("department.faculty")}>
              <LiyonSelect
                value={formFacultyId}
                onChange={(e) => setFormFacultyId(e.target.value)}
                required
              >
                <option value="">{t("department.selectFaculty")}</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.code} - {locale === "en" ? f.nameEn : f.nameTh}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("department.code")}>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="เช่น CS, IT, BA"
                className="w-full px-3 py-2 rounded-md border text-sm font-mono"
                required
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("department.nameTh")}>
              <input
                type="text"
                value={formNameTh}
                onChange={(e) => setFormNameTh(e.target.value)}
                placeholder="ชื่อภาควิชาภาษาไทย"
                className="w-full px-3 py-2 rounded-md border text-sm"
                required
              />
            </LiyonField>

            <LiyonField label={t("department.nameEn")}>
              <input
                type="text"
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
                placeholder="Department Name in English"
                className="w-full px-3 py-2 rounded-md border text-sm"
                required
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("department.shortNameTh")}>
              <input
                type="text"
                value={formShortNameTh}
                onChange={(e) => setFormShortNameTh(e.target.value)}
                placeholder="เช่น วค."
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>

            <LiyonField label={t("department.shortNameEn")}>
              <input
                type="text"
                value={formShortNameEn}
                onChange={(e) => setFormShortNameEn(e.target.value)}
                placeholder="เช่น CS"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>
          </div>

          <LiyonField label={t("department.head")}>
            <LiyonSelect
              value={formHeadStaffId}
              onChange={(e) => setFormHeadStaffId(e.target.value)}
            >
              <option value="">{t("department.selectHead")}</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullNameTh} ({s.departmentNameTh})
                </option>
              ))}
            </LiyonSelect>
          </LiyonField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("department.email")}>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="head.cs@faculty.ac.th"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>

            <LiyonField label={t("department.phone")}>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="02-xxx-xxxx ต่อ 2001"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("department.officeLocation")}>
              <input
                type="text"
                value={formOfficeLocation}
                onChange={(e) => setFormOfficeLocation(e.target.value)}
                placeholder="อาคาร 2 ชั้น 3 ห้อง 305"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>

            <LiyonField label={t("department.status")}>
              <LiyonSelect
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as DepartmentDto["status"])}
              >
                <option value="ACTIVE">{t("faculty.status.active")}</option>
                <option value="INACTIVE">{t("faculty.status.inactive")}</option>
                <option value="ARCHIVED">{t("faculty.status.archived")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          <LiyonField label={t("department.description")}>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={t("department.description")}
              className="w-full px-3 py-2 rounded-md border text-sm"
            />
          </LiyonField>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            {t("curriculum.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !formCode || !formNameTh || !formNameEn}>
            {isPending ? t("common.saving") : t("curriculum.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Modal */}
      <LiyonDialog open={!!deleteConfirmDept} onOpenChange={() => setDeleteConfirmDept(null)}>
        <LiyonDialogHeader
          title={<span className="text-destructive">{t("department.deleteBtn")}</span>}
        />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("department.deleteConfirm")}</p>
          {deleteConfirmDept && (
            <p className="mt-2 text-sm font-semibold text-foreground">
              {deleteConfirmDept.code} - {deleteConfirmDept.nameTh}
            </p>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmDept(null)}>
            {t("curriculum.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? t("common.deleting") : t("department.deleteBtn")}
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
                const sample = "\uFEFFรหัสภาควิชา,ชื่อภาษาไทย,ชื่อภาษาอังกฤษ,ชื่อย่อภาษาไทย,ชื่อย่อภาษาอังกฤษ,รหัสคณะ,อีเมล,เบอร์โทร,สถานที่ตั้ง,สถานะ\r\nCS,สาขาวิชาวิทยาการคอมพิวเตอร์,Department of Computer Science,วค.,CS,FMS,cs@univ.ac.th,02-123-4567,อาคาร 2 ชั้น 3,ACTIVE";
                const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "departments_template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              departments_template.csv
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
                      const matchedFaculty = faculties.find((f) => f.code === cols[5]);
                      await createDepartmentAction({
                        code: cols[0],
                        nameTh: cols[1],
                        nameEn: cols[2],
                        shortNameTh: cols[3] || undefined,
                        shortNameEn: cols[4] || undefined,
                        facultyId: matchedFaculty?.id || faculties[0]?.id,
                        email: cols[6] || undefined,
                        phone: cols[7] || undefined,
                        officeLocation: cols[8] || undefined,
                        status: cols[9] === "INACTIVE" ? "INACTIVE" : "ACTIVE",
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

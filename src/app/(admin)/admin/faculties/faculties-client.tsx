"use client";

import { useState, useTransition } from "react";
import {
  Landmark,
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  GitBranch,
  User,
  Download,
  Upload,
  Mail,
  Phone,
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
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { FacultyDto } from "@/features/curriculum";
import type { StaffProfileDto } from "@/features/directory";
import {
  getFacultiesAction,
  createFacultyAction,
  updateFacultyAction,
  deleteFacultyAction,
} from "@/features/curriculum/actions";

interface Props {
  initialFaculties: FacultyDto[];
  staffList: StaffProfileDto[];
  canManage: boolean;
}

export function FacultiesClient({ initialFaculties, staffList, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [faculties, setFaculties] = useState<FacultyDto[]>(initialFaculties);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<FacultyDto | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formShortNameTh, setFormShortNameTh] = useState("");
  const [formShortNameEn, setFormShortNameEn] = useState("");
  const [formDeanStaffId, setFormDeanStaffId] = useState<string>("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formBuildingLocation, setFormBuildingLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formStatus, setFormStatus] = useState<FacultyDto["status"]>("ACTIVE");
  const [formSortOrder, setFormSortOrder] = useState(0);

  // Import Dialog State
  const [isImportOpen, setIsImportOpen] = useState(false);

  const refreshList = async () => {
    const res = await getFacultiesAction();
    if (res.ok) setFaculties(res.data);
  };

  const openCreateDialog = () => {
    setEditingFaculty(null);
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormShortNameTh("");
    setFormShortNameEn("");
    setFormDeanStaffId("");
    setFormEmail("");
    setFormPhone("");
    setFormWebsite("");
    setFormBuildingLocation("");
    setFormDescription("");
    setFormLogoUrl("");
    setFormStatus("ACTIVE");
    setFormSortOrder(faculties.length + 1);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: FacultyDto) => {
    setEditingFaculty(item);
    setFormCode(item.code);
    setFormNameTh(item.nameTh);
    setFormNameEn(item.nameEn);
    setFormShortNameTh(item.shortNameTh || "");
    setFormShortNameEn(item.shortNameEn || "");
    setFormDeanStaffId(item.deanStaffId || "");
    setFormEmail(item.email || "");
    setFormPhone(item.phone || "");
    setFormWebsite(item.website || "");
    setFormBuildingLocation(item.buildingLocation || "");
    setFormDescription(item.description || "");
    setFormLogoUrl(item.logoUrl || "");
    setFormStatus(item.status);
    setFormSortOrder(item.sortOrder);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      if (editingFaculty) {
        const res = await updateFacultyAction({
          id: editingFaculty.id,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          shortNameTh: formShortNameTh || undefined,
          shortNameEn: formShortNameEn || undefined,
          deanStaffId: formDeanStaffId || null,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          website: formWebsite || undefined,
          buildingLocation: formBuildingLocation || undefined,
          description: formDescription || undefined,
          logoUrl: formLogoUrl || undefined,
          status: formStatus,
          sortOrder: Number(formSortOrder),
        });

        if (res.ok) {
          toast.success(t("faculty.updateSuccess"));
          setIsDialogOpen(false);
          await refreshList();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createFacultyAction({
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          shortNameTh: formShortNameTh || undefined,
          shortNameEn: formShortNameEn || undefined,
          deanStaffId: formDeanStaffId || null,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          website: formWebsite || undefined,
          buildingLocation: formBuildingLocation || undefined,
          description: formDescription || undefined,
          logoUrl: formLogoUrl || undefined,
          status: formStatus,
          sortOrder: Number(formSortOrder),
        });

        if (res.ok) {
          toast.success(t("faculty.createSuccess"));
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
      const res = await deleteFacultyAction(deleteConfirmItem.id);
      if (res.ok) {
        if (res.data.archived) {
          toast.success(t("faculty.archiveSuccess"));
        } else {
          toast.success(t("faculty.deleteSuccess"));
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
      "รหัสคณะ",
      "ชื่อภาษาไทย",
      "ชื่อภาษาอังกฤษ",
      "ชื่อย่อภาษาไทย",
      "ชื่อย่อภาษาอังกฤษ",
      "คณบดี",
      "อีเมล",
      "เบอร์โทร",
      "เว็บไซต์",
      "สถานที่ตั้ง",
      "สถานะ",
      "จำนวนภาควิชา",
      "จำนวนหลักสูตร",
    ];

    const rows = filteredFaculties.map((f) => [
      `"${f.code}"`,
      `"${f.nameTh}"`,
      `"${f.nameEn}"`,
      `"${f.shortNameTh || ""}"`,
      `"${f.shortNameEn || ""}"`,
      `"${f.deanStaffNameTh || ""}"`,
      `"${f.email || ""}"`,
      `"${f.phone || ""}"`,
      `"${f.website || ""}"`,
      `"${f.buildingLocation || ""}"`,
      `"${f.status}"`,
      `"${f.departmentsCount ?? 0}"`,
      `"${f.programsCount ?? 0}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faculties_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ส่งออกข้อมูล CSV สำเร็จ");
  };

  const filteredFaculties = faculties.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      f.code.toLowerCase().includes(q) ||
      f.nameTh.toLowerCase().includes(q) ||
      f.nameEn.toLowerCase().includes(q) ||
      (f.shortNameTh && f.shortNameTh.toLowerCase().includes(q)) ||
      (f.shortNameEn && f.shortNameEn.toLowerCase().includes(q)) ||
      (f.deanStaffNameTh && f.deanStaffNameTh.toLowerCase().includes(q));
    const matchStatus = statusFilter === "ALL" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: DataTableColumn<FacultyDto>[] = [
    {
      key: "code",
      header: t("faculty.code"),
      render: (row) =>
        canManage ? (
          <button
            type="button"
            onClick={() => openEditDialog(row)}
            className="font-mono font-semibold text-xs text-primary px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 hover:underline transition-colors cursor-pointer"
            title={t("faculty.edit")}
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
      header: t("faculty.nameTh"),
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            {canManage ? (
              <button
                type="button"
                onClick={() => openEditDialog(row)}
                className="font-medium text-foreground leading-tight text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                title={t("faculty.edit")}
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
      key: "dean",
      header: t("faculty.dean"),
      render: (row) => {
        if (!row.deanStaffNameTh) return <span className="text-xs text-muted-foreground italic">-</span>;
        return (
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>{locale === "en" ? (row.deanStaffNameEn || row.deanStaffNameTh) : row.deanStaffNameTh}</span>
          </div>
        );
      },
    },
    {
      key: "contact",
      header: t("faculty.email"),
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
      key: "departmentsCount",
      header: t("faculty.departmentsCount"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-foreground font-medium">
          <GitBranch className="h-3.5 w-3.5 text-primary" />
          <span>{row.departmentsCount ?? 0}</span>
        </span>
      ),
    },
    {
      key: "programsCount",
      header: t("faculty.programsCount"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-foreground font-medium">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span>{row.programsCount ?? 0}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: t("faculty.status"),
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
    {
      key: "sortOrder",
      header: t("faculty.sortOrder"),
      render: (row) => <span className="text-xs text-muted-foreground">{row.sortOrder}</span>,
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: t("curriculum.actions"),
            className:
              "text-right sticky right-0 bg-background/95 backdrop-blur-md z-10 min-w-[145px] px-3 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] border-l",
            render: (row: FacultyDto) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium"
                  onClick={() => openEditDialog(row)}
                  title={t("faculty.edit")}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {t("faculty.edit")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-colors text-xs font-medium"
                  onClick={() => setDeleteConfirmItem(row)}
                  title={t("faculty.delete")}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {t("faculty.delete")}
                </Button>
              </div>
            ),
          } as DataTableColumn<FacultyDto>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            {t("faculty.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("faculty.subtitle")}</p>
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
              {t("faculty.create")}
            </Button>
          )}
        </div>
      </div>

      <LiyonCard>
        <DataTable<FacultyDto>
          state={filteredFaculties.length === 0 ? "empty" : "data"}
          headHeading={t("faculty.listTitle")}
          rows={filteredFaculties}
          columns={columns}
          getRowId={(row) => row.id}
          toolbar={
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="tsearch flex-1 min-w-[220px]">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหารหัส, ชื่อคณะ หรือคณบดี..."
                  aria-label={t("common.search")}
                />
              </span>
              <div className="w-48">
                <LiyonSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label={t("curriculum.filterStatus")}
                >
                  <option value="ALL">{t("curriculum.filterStatus")}</option>
                  <option value="ACTIVE">{t("faculty.status.active")}</option>
                  <option value="INACTIVE">{t("faculty.status.inactive")}</option>
                  <option value="ARCHIVED">{t("faculty.status.archived")}</option>
                </LiyonSelect>
              </div>
            </div>
          }
          empty={{
            icon: <Landmark className="h-10 w-10 text-muted-foreground/50" />,
            title: t("faculty.empty"),
            description: t("faculty.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Faculty Create / Edit Modal */}
      <LiyonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              <span>{editingFaculty ? t("faculty.edit") : t("faculty.create")}</span>
            </div>
          }
        />

        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("faculty.code")}>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="เช่น FMS, ENG, MED"
                className="w-full px-3 py-2 rounded-md border text-sm font-mono"
                required
              />
            </LiyonField>

            <LiyonField label={t("faculty.sortOrder")}>
              <input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("faculty.nameTh")}>
              <input
                type="text"
                value={formNameTh}
                onChange={(e) => setFormNameTh(e.target.value)}
                placeholder="ชื่อคณะภาษาไทย"
                className="w-full px-3 py-2 rounded-md border text-sm"
                required
              />
            </LiyonField>

            <LiyonField label={t("faculty.nameEn")}>
              <input
                type="text"
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
                placeholder="Faculty Name in English"
                className="w-full px-3 py-2 rounded-md border text-sm"
                required
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("faculty.shortNameTh")}>
              <input
                type="text"
                value={formShortNameTh}
                onChange={(e) => setFormShortNameTh(e.target.value)}
                placeholder="เช่น วค."
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>

            <LiyonField label={t("faculty.shortNameEn")}>
              <input
                type="text"
                value={formShortNameEn}
                onChange={(e) => setFormShortNameEn(e.target.value)}
                placeholder="เช่น FMS"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>
          </div>

          <LiyonField label={t("faculty.dean")}>
            <LiyonSelect
              value={formDeanStaffId}
              onChange={(e) => setFormDeanStaffId(e.target.value)}
            >
              <option value="">{t("faculty.selectDean")}</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullNameTh} ({s.departmentNameTh})
                </option>
              ))}
            </LiyonSelect>
          </LiyonField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("faculty.email")}>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="dean.office@faculty.ac.th"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>

            <LiyonField label={t("faculty.phone")}>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="02-xxx-xxxx ต่อ 1000"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("faculty.website")}>
              <input
                type="url"
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                placeholder="https://fms.university.ac.th"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>

            <LiyonField label={t("faculty.buildingLocation")}>
              <input
                type="text"
                value={formBuildingLocation}
                onChange={(e) => setFormBuildingLocation(e.target.value)}
                placeholder="อาคาร 4 ชั้น 2"
                className="w-full px-3 py-2 rounded-md border text-sm"
              />
            </LiyonField>
          </div>

          <LiyonField label={t("faculty.status")}>
            <LiyonSelect
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as FacultyDto["status"])}
            >
              <option value="ACTIVE">{t("faculty.status.active")}</option>
              <option value="INACTIVE">{t("faculty.status.inactive")}</option>
              <option value="ARCHIVED">{t("faculty.status.archived")}</option>
            </LiyonSelect>
          </LiyonField>

          <LiyonField label={t("faculty.logoUrl")}>
            <input
              type="url"
              value={formLogoUrl}
              onChange={(e) => setFormLogoUrl(e.target.value)}
              placeholder="https://.../logo.png"
              className="w-full px-3 py-2 rounded-md border text-sm"
            />
          </LiyonField>

          <LiyonField label={t("faculty.description")}>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={t("faculty.description")}
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
      <LiyonDialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <LiyonDialogHeader
          title={<span className="text-destructive">{t("faculty.delete")}</span>}
        />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("faculty.deleteConfirm")}</p>
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
            {isPending ? t("common.deleting") : t("faculty.delete")}
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
                const sample = "\uFEFFรหัสคณะ,ชื่อภาษาไทย,ชื่อภาษาอังกฤษ,ชื่อย่อภาษาไทย,ชื่อย่อภาษาอังกฤษ,อีเมล,เบอร์โทร,เว็บไซต์,สถานที่ตั้ง,สถานะ,ลำดับ\r\nFMS,คณะวิทยาการจัดการ,Faculty of Management Sciences,วค.,FMS,fms@univ.ac.th,02-123-4567,https://fms.ac.th,อาคาร 1 ชั้น 2,ACTIVE,1";
                const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "faculties_template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              faculties_template.csv
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
                      await createFacultyAction({
                        code: cols[0],
                        nameTh: cols[1],
                        nameEn: cols[2],
                        shortNameTh: cols[3] || undefined,
                        shortNameEn: cols[4] || undefined,
                        email: cols[5] || undefined,
                        phone: cols[6] || undefined,
                        website: cols[7] || undefined,
                        buildingLocation: cols[8] || undefined,
                        status: cols[9] === "INACTIVE" ? "INACTIVE" : "ACTIVE",
                        sortOrder: Number(cols[10]) || 0,
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

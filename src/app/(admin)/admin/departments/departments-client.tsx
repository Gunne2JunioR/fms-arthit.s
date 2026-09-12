"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  GraduationCap,
  Users,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentDto } from "@/features/directory";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/features/directory/actions";

interface Props {
  initialDepartments: DepartmentDto[];
  canManage: boolean;
}

export function DepartmentsClient({ initialDepartments, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [departments, setDepartments] = useState<DepartmentDto[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create / Edit modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);

  // Programs Drawer/Modal state
  const [viewingProgramsDept, setViewingProgramsDept] = useState<DepartmentDto | null>(null);

  // Delete modal state
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentDto | null>(null);

  // Form states
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const openCreateDialog = () => {
    setEditingDept(null);
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormDescription("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (dept: DepartmentDto) => {
    setEditingDept(dept);
    setFormCode(dept.code);
    setFormNameTh(dept.nameTh);
    setFormNameEn(dept.nameEn);
    setFormDescription(dept.description || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      if (editingDept) {
        const res = await updateDepartmentAction({
          id: editingDept.id,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          description: formDescription || undefined,
        });
        if (res.ok) {
          toast.success(t("department.updateSuccess"));
          setIsDialogOpen(false);
          setDepartments((prev) =>
            prev.map((d) => (d.id === res.data.id ? { ...d, ...res.data } : d))
          );
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createDepartmentAction({
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          description: formDescription || undefined,
        });
        if (res.ok) {
          toast.success(t("department.createSuccess"));
          setIsDialogOpen(false);
          setDepartments((prev) => [res.data, ...prev]);
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
        toast.success(t("department.deleteSuccess"));
        setDeleteConfirmDept(null);
        setDepartments((prev) => prev.filter((d) => d.id !== deleteConfirmDept.id));
      } else {
        if (res.error.code === "conflict" || res.error.message.includes("department_has_relations")) {
          toast.error(t("department.hasRelationsError"));
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  const filteredDepts = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.code.toLowerCase().includes(q) ||
      d.nameTh.toLowerCase().includes(q) ||
      d.nameEn.toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<DepartmentDto>[] = [
    {
      key: "code",
      header: t("department.code"),
      render: (row) => (
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
          <p className="font-medium text-foreground leading-tight">
            {locale === "en" ? row.nameEn : row.nameTh}
          </p>
          <p className="text-xs text-muted-foreground">
            {locale === "en" ? row.nameTh : row.nameEn}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      header: t("department.description"),
      render: (row) => (
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-sm">
          {row.description || "-"}
        </p>
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
          <span>{row.programsCount ?? 0} {t("department.programsCount")}</span>
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            {t("department.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("department.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("department.addBtn")}
          </Button>
        )}
      </div>

      <LiyonCard>
        <DataTable<DepartmentDto>
          state={filteredDepts.length === 0 ? "empty" : "data"}
          headHeading={t("department.listTitle")}
          rows={filteredDepts}
          columns={columns}
          getRowId={(row) => row.id}
          toolbar={
            <div className="flex items-center gap-3 w-full">
              <span className="tsearch flex-1">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหารหัส หรือชื่อภาควิชา..."
                  aria-label={t("common.search")}
                />
              </span>
            </div>
          }
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => setViewingProgramsDept(row)}
                      icon={<GraduationCap className="h-4 w-4" />}
                    >
                      {t("department.viewPrograms")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => openEditDialog(row)}
                      icon={<Pencil className="h-4 w-4" />}
                    >
                      {t("department.editBtn")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmDept(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("department.deleteBtn")}
                    </RowMenuItem>
                  </>
                )
              : (row) => (
                  <RowMenuItem
                    onSelect={() => setViewingProgramsDept(row)}
                    icon={<GraduationCap className="h-4 w-4" />}
                  >
                    {t("department.viewPrograms")}
                  </RowMenuItem>
                )
          }
          empty={{
            icon: <Building2 className="h-10 w-10 text-muted-foreground/50" />,
            title: t("department.empty"),
            description: t("department.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiyonDialogHeader
          title={editingDept ? t("department.editBtn") : t("department.addBtn")}
          description={t("department.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("department.code")}>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="เช่น CS, IT, BA, MKT"
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                required
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("department.nameTh")}>
                <input
                  type="text"
                  value={formNameTh}
                  onChange={(e) => setFormNameTh(e.target.value)}
                  placeholder="เช่น ภาควิชาวิทยาการคอมพิวเตอร์"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  required
                />
              </LiyonField>
              <LiyonField label={t("department.nameEn")}>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                  required
                />
              </LiyonField>
            </div>

            <LiyonField label={t("department.description")}>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="ระบุพันธกิจ ภารกิจ หรือรายละเอียดภาควิชา..."
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            {t("directory.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !formCode || !formNameTh || !formNameEn}>
            {t("directory.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* View Curricula / Programs Modal */}
      <LiyonDialog
        open={!!viewingProgramsDept}
        onOpenChange={(open) => !open && setViewingProgramsDept(null)}
        wide
      >
        <LiyonDialogHeader
          title={
            viewingProgramsDept
              ? `${t("department.viewPrograms")} - ${locale === "en" ? viewingProgramsDept.nameEn : viewingProgramsDept.nameTh}`
              : t("department.viewPrograms")
          }
          description={`รหัสสังกัด: ${viewingProgramsDept?.code}`}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            {viewingProgramsDept?.programs && viewingProgramsDept.programs.length > 0 ? (
              <div className="divide-y rounded-xl border bg-card">
                {viewingProgramsDept.programs.map((prog) => (
                  <div key={prog.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {prog.code}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {prog.degreeLevel}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {locale === "en" ? prog.nameEn : prog.nameTh}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                      <Link href="/admin/programs">
                        <span>{t("curriculum.edit")}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-xl bg-card text-muted-foreground space-y-3">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm">{t("department.noPrograms")}</p>
                {canManage && (
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href="/admin/programs">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      <span>{t("curriculum.create")}</span>
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setViewingProgramsDept(null)}>
            {t("directory.cancel")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={!!deleteConfirmDept}
        onOpenChange={(open) => !open && setDeleteConfirmDept(null)}
      >
        <LiyonDialogHeader
          title={t("department.deleteBtn")}
          description={t("department.deleteConfirm")}
        />
        <LiyonDialogBody>
          {deleteConfirmDept && (
            <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
              <p className="font-semibold text-foreground">{deleteConfirmDept.nameTh} ({deleteConfirmDept.code})</p>
              <p className="text-xs text-muted-foreground">{deleteConfirmDept.nameEn}</p>
              {(deleteConfirmDept.programsCount ?? 0) > 0 && (
                <p className="text-xs text-destructive font-medium mt-2">
                  * มีหลักสูตรในสังกัด {deleteConfirmDept.programsCount} หลักสูตร
                </p>
              )}
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmDept(null)}>
            {t("directory.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("department.deleteBtn")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  Users as UsersIcon,
  Search,
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  Eye,
  Link2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
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
  type DataTableSelection,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { StaffProfileDto, DepartmentDto, EmploymentStatus, PersonnelType } from "@/features/directory";
import {
  getStaffListAction,
  deleteStaffAction,
  changePersonnelStatusAction,
  exportPersonnelCsvAction,
} from "@/features/directory/actions";
import { PersonnelDialog } from "./personnel-dialog";
import { PersonnelDetailDialog } from "./personnel-detail-dialog";
import { LinkUserDialog } from "./link-user-dialog";
import { ImportExportDialog } from "./import-export-dialog";

interface Props {
  initialPersonnel: StaffProfileDto[];
  departments: DepartmentDto[];
  roles: { id: string; code: string; nameTh: string; nameEn: string }[];
  users: { id: string; name: string; email: string; googleEmail?: string | null }[];
  canManage: boolean;
}

export function PersonnelClient({
  initialPersonnel,
  departments,
  roles,
  users,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [personnelList, setPersonnelList] = useState<StaffProfileDto[]>(initialPersonnel);
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Selection for bulk
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<StaffProfileDto | null>(null);

  const [detailPersonnel, setDetailPersonnel] = useState<StaffProfileDto | null>(null);
  const [linkingPersonnel, setLinkingPersonnel] = useState<StaffProfileDto | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Status Change Dialog
  const [statusChangeTarget, setStatusChangeTarget] = useState<StaffProfileDto | null>(null);
  const [newStatus, setNewStatus] = useState<StaffProfileDto["employmentStatus"]>("ACTIVE");

  // Delete Confirm Dialog
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<StaffProfileDto | null>(null);

  const refreshList = async () => {
    const res = await getStaffListAction({
      departmentId: selectedDept === "all" ? undefined : selectedDept,
      personnelType: selectedType === "all" ? undefined : selectedType,
      employmentStatus: selectedStatus === "all" ? undefined : selectedStatus,
      search: search.trim() || undefined,
    });
    if (res.ok) setPersonnelList(res.data);
  };

  const handleOpenCreate = () => {
    setEditingPersonnel(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: StaffProfileDto) => {
    setEditingPersonnel(item);
    setIsFormOpen(true);
  };

  const handleExport = () => {
    startTransition(async () => {
      const res = await exportPersonnelCsvAction({
        departmentId: selectedDept === "all" ? undefined : selectedDept,
        personnelType: selectedType === "all" ? undefined : selectedType,
        employmentStatus: selectedStatus === "all" ? undefined : selectedStatus,
        search: search.trim() || undefined,
      });

      if (res.ok) {
        const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `personnel_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("ส่งออกข้อมูลเรียบร้อยแล้ว");
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmTarget) return;
    startTransition(async () => {
      const res = await deleteStaffAction(deleteConfirmTarget.id);
      if (res.ok) {
        if (res.data.mode === "archived") {
          toast.success(t("personnel.archiveSuccess"));
        } else {
          toast.success(t("personnel.deleteSuccess"));
        }
        setDeleteConfirmTarget(null);
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleSaveStatusChange = () => {
    if (!statusChangeTarget) return;
    startTransition(async () => {
      const res = await changePersonnelStatusAction(statusChangeTarget.id, newStatus);
      if (res.ok) {
        toast.success(t("personnel.statusChangeSuccess"));
        setStatusChangeTarget(null);
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  // Filtered List
  const filteredList = personnelList.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.personnelCode.toLowerCase().includes(q) ||
      p.fullNameTh.toLowerCase().includes(q) ||
      p.fullNameEn.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.universityEmail && p.universityEmail.toLowerCase().includes(q));

    const matchDept = selectedDept === "all" || p.departmentId === selectedDept;
    const matchType = selectedType === "all" || p.personnelType === selectedType;
    const matchStatus = selectedStatus === "all" || p.employmentStatus === selectedStatus;

    return matchSearch && matchDept && matchType && matchStatus;
  });

  // Table Columns
  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "avatar",
      header: "",
      render: (row) => (
        <div className="h-9 w-9 rounded-full overflow-hidden border bg-muted/40 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-2xs">
          {row.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.avatarUrl} alt={row.fullNameTh} className="h-full w-full object-cover" />
          ) : (
            row.firstNameTh.slice(0, 1)
          )}
        </div>
      ),
    },
    {
      key: "code",
      header: t("personnel.colCode"),
      render: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
          {row.personnelCode}
        </span>
      ),
    },
    {
      key: "name",
      header: t("personnel.colName"),
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground leading-tight text-xs">{row.fullNameTh}</p>
          <p className="text-[11px] text-muted-foreground">{row.fullNameEn}</p>
        </div>
      ),
    },
    {
      key: "position",
      header: t("personnel.colPosition"),
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium text-foreground">{row.positionName}</p>
          {row.academicPosition && <p className="text-[11px] text-muted-foreground">{row.academicPosition}</p>}
        </div>
      ),
    },
    {
      key: "department",
      header: t("personnel.colDept"),
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <span className="font-medium text-foreground">
            {locale === "en" ? row.departmentNameEn : row.departmentNameTh}
          </span>
          {row.subDepartmentName && (
            <p className="text-[11px] text-muted-foreground">{row.subDepartmentName}</p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: t("personnel.colType"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {t(`personnel.type.${row.personnelType}` as `personnel.type.${PersonnelType}`)}
        </span>
      ),
    },
    {
      key: "email",
      header: t("personnel.colEmail"),
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">{row.universityEmail || row.email}</span>
      ),
    },
    {
      key: "user",
      header: t("personnel.colUser"),
      render: (row) => {
        if (!row.user) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground/80">
              {t("personnel.noUser")}
            </span>
          );
        }
        return (
          <div className="space-y-0.5 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              {row.user.name}
            </span>
            {row.user.googleEmail && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {row.user.googleEmail}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("personnel.colStatus"),
      render: (row) => {
        const toneMap: Record<string, "ok" | "warn" | "bad" | "off"> = {
          ACTIVE: "ok",
          ON_LEAVE_STUDY: "warn",
          ON_LEAVE_SICK: "warn",
          RETIRED: "off",
          TERMINATED: "bad",
          ARCHIVED: "off",
        };
        return (
          <StatusPill tone={toneMap[row.employmentStatus] || "ok"}>
            {t(`personnel.status.${row.employmentStatus}` as `personnel.status.${EmploymentStatus}`)}
          </StatusPill>
        );
      },
    },
    {
      key: "updatedAt",
      header: t("personnel.colUpdatedAt"),
      render: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {formatDate(row.updatedAt, locale, { time: true })}
        </span>
      ),
    },
  ];

  // Selection Config
  const isRowSelectable = () => true;
  const selectableIds = filteredList.map((p) => p.id);

  const selection: DataTableSelection<StaffProfileDto> | undefined = canManage
    ? {
        selectedIds,
        onToggleRow: (row) => {
          const next = new Set(selectedIds);
          if (next.has(row.id)) next.delete(row.id);
          else next.add(row.id);
          setSelectedIds(next);
        },
        onToggleAll: () => {
          setSelectedIds(selectedIds.size === selectableIds.length ? new Set() : new Set(selectableIds));
        },
        allSelected: selectableIds.length > 0 && selectedIds.size === selectableIds.length,
        ariaLabelAll: t("users.selectAll"),
        ariaLabelRow: (row) => t("users.selectRow", { name: row.fullNameTh }),
        isRowSelectable,
        bulkBar: {
          countLabel: (n) => t("users.selected", { n }),
          actions: (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={handleExport}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                {t("personnel.exportBtn")}
              </Button>
            </div>
          ),
          onClear: () => setSelectedIds(new Set()),
          clearLabel: t("users.clearSelection"),
        },
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            {t("personnel.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("personnel.subtitle")}</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4" />
              <span>{t("personnel.importBtn")}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={handleExport} disabled={isPending}>
              <Download className="h-4 w-4" />
              <span>{t("personnel.exportBtn")}</span>
            </Button>
            <Button onClick={handleOpenCreate} className="gap-1.5 text-xs h-9">
              <Plus className="h-4 w-4" />
              <span>{t("personnel.addBtn")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <LiyonCard>
        <DataTable<StaffProfileDto>
          state={filteredList.length === 0 ? "empty" : "data"}
          headHeading={t("personnel.title")}
          rows={filteredList}
          columns={columns}
          getRowId={(row) => row.id}
          selection={selection}
          toolbar={
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="tsearch flex-1 min-w-[220px]">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("personnel.searchPlaceholder")}
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="all">{t("personnel.filterDept")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === "en" ? d.nameEn : d.nameTh} ({d.code})
                  </option>
                ))}
              </LiyonSelect>
              <LiyonSelect value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="all">{t("personnel.filterType")}</option>
                <option value="EXECUTIVE">{t("personnel.type.EXECUTIVE")}</option>
                <option value="ACADEMIC">{t("personnel.type.ACADEMIC")}</option>
                <option value="SUPPORT">{t("personnel.type.SUPPORT")}</option>
                <option value="CONTRACT">{t("personnel.type.CONTRACT")}</option>
                <option value="OTHER">{t("personnel.type.OTHER")}</option>
              </LiyonSelect>
              <LiyonSelect value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">{t("personnel.filterStatus")}</option>
                <option value="ACTIVE">{t("personnel.status.ACTIVE")}</option>
                <option value="ON_LEAVE_STUDY">{t("personnel.status.ON_LEAVE_STUDY")}</option>
                <option value="ON_LEAVE_SICK">{t("personnel.status.ON_LEAVE_SICK")}</option>
                <option value="RETIRED">{t("personnel.status.RETIRED")}</option>
                <option value="TERMINATED">{t("personnel.status.TERMINATED")}</option>
              </LiyonSelect>
            </div>
          }
          renderRowMenu={(row) => (
            <>
              <RowMenuItem icon={<Eye className="h-4 w-4" />} onSelect={() => setDetailPersonnel(row)}>
                {t("personnel.menuView")}
              </RowMenuItem>
              {canManage && (
                <>
                  <RowMenuItem icon={<Pencil className="h-4 w-4" />} onSelect={() => handleOpenEdit(row)}>
                    {t("personnel.menuEdit")}
                  </RowMenuItem>
                  <RowMenuItem icon={<Link2 className="h-4 w-4" />} onSelect={() => setLinkingPersonnel(row)}>
                    {t("personnel.menuLink")}
                  </RowMenuItem>
                  <RowMenuItem
                    icon={<RefreshCw className="h-4 w-4" />}
                    onSelect={() => {
                      setStatusChangeTarget(row);
                      setNewStatus(row.employmentStatus);
                    }}
                  >
                    {t("personnel.menuChangeStatus")}
                  </RowMenuItem>
                  <RowMenuItem danger icon={<Trash2 className="h-4 w-4" />} onSelect={() => setDeleteConfirmTarget(row)}>
                    {t("personnel.menuDelete")}
                  </RowMenuItem>
                </>
              )}
            </>
          )}
          empty={{
            icon: <UsersIcon className="h-10 w-10 text-muted-foreground/40" />,
            title: t("directory.empty"),
            description: t("personnel.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* 1. Add / Edit Modal */}
      {isFormOpen && (
        <PersonnelDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          personnel={editingPersonnel}
          departments={departments}
          users={users}
          onSuccess={refreshList}
        />
      )}

      {/* 2. Detail Modal */}
      <PersonnelDetailDialog
        personnel={detailPersonnel}
        onClose={() => setDetailPersonnel(null)}
      />

      {/* 3. Link User / Create User Modal */}
      <LinkUserDialog
        personnel={linkingPersonnel}
        users={users}
        roles={roles}
        onClose={() => setLinkingPersonnel(null)}
        onSuccess={refreshList}
      />

      {/* 4. Import / Export Modal */}
      <ImportExportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        departments={departments}
        onSuccess={refreshList}
      />

      {/* 5. Change Status Dialog */}
      <LiyonDialog open={!!statusChangeTarget} onOpenChange={(open) => !open && setStatusChangeTarget(null)}>
        <LiyonDialogHeader
          title={t("personnel.menuChangeStatus")}
          description={statusChangeTarget ? `${statusChangeTarget.fullNameTh} (${statusChangeTarget.personnelCode})` : ""}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("personnel.colStatus")}>
              <LiyonSelect
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
              >
                <option value="ACTIVE">{t("personnel.status.ACTIVE")}</option>
                <option value="ON_LEAVE_STUDY">{t("personnel.status.ON_LEAVE_STUDY")}</option>
                <option value="ON_LEAVE_SICK">{t("personnel.status.ON_LEAVE_SICK")}</option>
                <option value="RETIRED">{t("personnel.status.RETIRED")}</option>
                <option value="TERMINATED">{t("personnel.status.TERMINATED")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setStatusChangeTarget(null)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSaveStatusChange} disabled={isPending}>
            {t("common.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* 6. Delete Confirmation Dialog */}
      <LiyonDialog open={!!deleteConfirmTarget} onOpenChange={(open) => !open && setDeleteConfirmTarget(null)}>
        <LiyonDialogHeader
          title={t("personnel.menuDelete")}
          description={t("personnel.deleteConfirm")}
        />
        <LiyonDialogBody>
          {deleteConfirmTarget && (
            <div className="p-3 rounded-lg border bg-muted/40 text-xs space-y-1">
              <p className="font-semibold text-foreground">{deleteConfirmTarget.fullNameTh}</p>
              <p className="text-muted-foreground">{deleteConfirmTarget.personnelCode} - {deleteConfirmTarget.positionName}</p>
              {deleteConfirmTarget.user && (
                <p className="text-amber-600 dark:text-amber-400 font-medium mt-1">
                  * บุคลากรท่านนี้มีบัญชีผู้ใช้ระบบเชื่อมโยงอยู่ ({deleteConfirmTarget.user.email}) ระบบจะเปลี่ยนสถานะเป็น &quot;เก็บถาวร&quot; แทนการลบถาวร
                </p>
              )}
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmTarget(null)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("personnel.menuDelete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

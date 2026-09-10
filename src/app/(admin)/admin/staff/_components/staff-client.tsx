"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Search, Users, AlertCircle } from "lucide-react";
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
import type { StaffProfileDto, DepartmentDto } from "@/features/directory";
import {
  getStaffListAction,
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "@/features/directory/actions";

interface Props {
  initialStaff: StaffProfileDto[];
  departments: DepartmentDto[];
  canManage: boolean;
}

export function StaffClient({ initialStaff, departments, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [staffList, setStaffList] = useState<StaffProfileDto[]>(initialStaff);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<StaffProfileDto | null>(null);
  const [editingItem, setEditingItem] = useState<StaffProfileDto | null>(null);

  // Form states
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id ?? "");
  const [formAcademicTitleTh, setFormAcademicTitleTh] = useState("");
  const [formAcademicTitleEn, setFormAcademicTitleEn] = useState("");
  const [formFirstNameTh, setFormFirstNameTh] = useState("");
  const [formFirstNameEn, setFormFirstNameEn] = useState("");
  const [formLastNameTh, setFormLastNameTh] = useState("");
  const [formLastNameEn, setFormLastNameEn] = useState("");
  const [formPositionTh, setFormPositionTh] = useState("");
  const [formPositionEn, setFormPositionEn] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhoneExt, setFormPhoneExt] = useState("");
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formExpertiseText, setFormExpertiseText] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "ON_LEAVE" | "RESIGNED">("ACTIVE");

  const refreshList = async () => {
    const res = await getStaffListAction({
      departmentId: selectedDept || undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      search: searchInput.trim() || undefined,
    });
    if (res.ok) setStaffList(res.data);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormDeptId(departments[0]?.id ?? "");
    setFormAcademicTitleTh("อาจารย์ ดร.");
    setFormAcademicTitleEn("Dr.");
    setFormFirstNameTh("");
    setFormFirstNameEn("");
    setFormLastNameTh("");
    setFormLastNameEn("");
    setFormPositionTh("");
    setFormPositionEn("");
    setFormEmail("");
    setFormPhoneExt("");
    setFormRoomNumber("");
    setFormAvatarUrl("");
    setFormExpertiseText("");
    setFormSortOrder(staffList.length + 1);
    setFormStatus("ACTIVE");
    setModalOpen(true);
  };

  const openEditDialog = (item: StaffProfileDto) => {
    setEditingItem(item);
    setFormDeptId(item.departmentId);
    setFormAcademicTitleTh(item.academicTitleTh);
    setFormAcademicTitleEn(item.academicTitleEn);
    setFormFirstNameTh(item.firstNameTh);
    setFormFirstNameEn(item.firstNameEn);
    setFormLastNameTh(item.lastNameTh);
    setFormLastNameEn(item.lastNameEn);
    setFormPositionTh(item.positionTh ?? "");
    setFormPositionEn(item.positionEn ?? "");
    setFormEmail(item.email);
    setFormPhoneExt(item.phoneExt ?? "");
    setFormRoomNumber(item.roomNumber ?? "");
    setFormAvatarUrl(item.avatarUrl ?? "");
    setFormExpertiseText(item.expertise.join(", "));
    setFormSortOrder(item.sortOrder);
    setFormStatus(item.status);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formFirstNameTh.trim() || !formLastNameTh.trim() || !formEmail.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    const expertise = formExpertiseText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editingItem) {
        const res = await updateStaffAction({
          id: editingItem.id,
          departmentId: formDeptId,
          academicTitleTh: formAcademicTitleTh.trim(),
          academicTitleEn: formAcademicTitleEn.trim(),
          firstNameTh: formFirstNameTh.trim(),
          firstNameEn: formFirstNameEn.trim(),
          lastNameTh: formLastNameTh.trim(),
          lastNameEn: formLastNameEn.trim(),
          positionTh: formPositionTh.trim() || undefined,
          positionEn: formPositionEn.trim() || undefined,
          email: formEmail.trim(),
          phoneExt: formPhoneExt.trim() || undefined,
          roomNumber: formRoomNumber.trim() || undefined,
          avatarUrl: formAvatarUrl.trim() || undefined,
          expertise,
          sortOrder: formSortOrder,
          status: formStatus,
        });
        if (res.ok) {
          toast.success(t("directory.updateSuccess"));
          setModalOpen(false);
          await refreshList();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createStaffAction({
          departmentId: formDeptId,
          academicTitleTh: formAcademicTitleTh.trim(),
          academicTitleEn: formAcademicTitleEn.trim(),
          firstNameTh: formFirstNameTh.trim(),
          firstNameEn: formFirstNameEn.trim(),
          lastNameTh: formLastNameTh.trim(),
          lastNameEn: formLastNameEn.trim(),
          positionTh: formPositionTh.trim() || undefined,
          positionEn: formPositionEn.trim() || undefined,
          email: formEmail.trim(),
          phoneExt: formPhoneExt.trim() || undefined,
          roomNumber: formRoomNumber.trim() || undefined,
          avatarUrl: formAvatarUrl.trim() || undefined,
          expertise,
          sortOrder: formSortOrder,
          status: formStatus,
        });
        if (res.ok) {
          toast.success(t("directory.createSuccess"));
          setModalOpen(false);
          await refreshList();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDelete = (item: StaffProfileDto) => {
    startTransition(async () => {
      const res = await deleteStaffAction(item.id);
      if (res.ok) {
        toast.success(t("directory.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshList();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "name",
      header: t("directory.name"),
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100"}
            alt={row.fullNameTh}
            className="w-10 h-10 rounded-full object-cover border shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {locale === "en" ? row.fullNameEn : row.fullNameTh}
            </span>
            <span className="text-xs text-muted-foreground">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: t("directory.department"),
      render: (row) => (
        <span className="text-xs">
          {locale === "en" ? row.departmentNameEn : row.departmentNameTh}
        </span>
      ),
    },
    {
      key: "position",
      header: t("directory.position"),
      render: (row) => (
        <span className="text-xs font-medium text-primary">
          {row.positionTh || "—"}
        </span>
      ),
    },
    {
      key: "contact",
      header: "สถานที่ / โทร",
      className: "nowrap text-xs text-muted-foreground",
      render: (row) => (
        <span>
          ห้อง {row.roomNumber || "—"} (ต่อ {row.phoneExt || "—"})
        </span>
      ),
    },
    {
      key: "status",
      header: t("directory.status"),
      render: (row) => {
        const tone = row.status === "ACTIVE" ? "ok" : row.status === "ON_LEAVE" ? "warn" : "off";
        const labelKey = `directory.status.${row.status.toLowerCase()}`;
        return <StatusPill tone={tone}>{t(labelKey)}</StatusPill>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("directory.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("directory.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("directory.create")}
          </Button>
        )}
      </div>

      <LiyonCard>
        <DataTable<StaffProfileDto>
          state={staffList.length === 0 ? "empty" : "data"}
          headHeading={t("directory.title")}
          rows={staffList}
          columns={columns}
          getRowId={(row) => row.id}
          toolbar={
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="tsearch flex-1 min-w-[200px]">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && refreshList()}
                  placeholder="ค้นหาชื่อ, สกุล, อีเมล..."
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  startTransition(async () => {
                    const res = await getStaffListAction({
                      departmentId: e.target.value || undefined,
                      status: selectedStatus === "all" ? undefined : selectedStatus,
                      search: searchInput.trim() || undefined,
                    });
                    if (res.ok) setStaffList(res.data);
                  });
                }}
              >
                <option value="">สาขาวิชาทั้งหมด</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === "en" ? d.nameEn : d.nameTh}
                  </option>
                ))}
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
                      {t("directory.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmItem(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("directory.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Users className="h-10 w-10 text-muted-foreground/50" />,
            title: t("directory.empty"),
            description: t("directory.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Dialog สร้าง/แก้ไขข้อมูลบุคลากร */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen} wide>
        <LiyonDialogHeader
          title={editingItem ? t("directory.edit") : t("directory.create")}
          description={t("directory.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("directory.department")} htmlFor="staff-dept">
                <LiyonSelect
                  id="staff-dept"
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "en" ? d.nameEn : d.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("directory.status")} htmlFor="staff-status">
                <LiyonSelect
                  id="staff-status"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "ACTIVE" | "ON_LEAVE" | "RESIGNED")
                  }
                >
                  <option value="ACTIVE">{t("directory.status.active")}</option>
                  <option value="ON_LEAVE">{t("directory.status.on_leave")}</option>
                  <option value="RESIGNED">{t("directory.status.resigned")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            {/* Thai Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <LiyonField label="คำนำหน้า (ไทย)" htmlFor="staff-title-th">
                <input
                  id="staff-title-th"
                  value={formAcademicTitleTh}
                  onChange={(e) => setFormAcademicTitleTh(e.target.value)}
                  placeholder="ผศ.ดร. / อาจารย์"
                  required
                />
              </LiyonField>
              <LiyonField label={t("directory.firstNameTh")} htmlFor="staff-first-th">
                <input
                  id="staff-first-th"
                  value={formFirstNameTh}
                  onChange={(e) => setFormFirstNameTh(e.target.value)}
                  required
                />
              </LiyonField>
              <LiyonField label={t("directory.lastNameTh")} htmlFor="staff-last-th">
                <input
                  id="staff-last-th"
                  value={formLastNameTh}
                  onChange={(e) => setFormLastNameTh(e.target.value)}
                  required
                />
              </LiyonField>
            </div>

            {/* English Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <LiyonField label="Title (EN)" htmlFor="staff-title-en">
                <input
                  id="staff-title-en"
                  value={formAcademicTitleEn}
                  onChange={(e) => setFormAcademicTitleEn(e.target.value)}
                  placeholder="Asst. Prof. Dr."
                  required
                />
              </LiyonField>
              <LiyonField label={t("directory.firstNameEn")} htmlFor="staff-first-en">
                <input
                  id="staff-first-en"
                  value={formFirstNameEn}
                  onChange={(e) => setFormFirstNameEn(e.target.value)}
                  required
                />
              </LiyonField>
              <LiyonField label={t("directory.lastNameEn")} htmlFor="staff-last-en">
                <input
                  id="staff-last-en"
                  value={formLastNameEn}
                  onChange={(e) => setFormLastNameEn(e.target.value)}
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("directory.position")} htmlFor="staff-pos-th">
                <input
                  id="staff-pos-th"
                  value={formPositionTh}
                  onChange={(e) => setFormPositionTh(e.target.value)}
                  placeholder="เช่น คณบดี, รองคณบดี, หัวหน้าสาขาวิชา"
                />
              </LiyonField>
              <LiyonField label={t("directory.email")} htmlFor="staff-email">
                <input
                  id="staff-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="lecturer@faculty.university.ac.th"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <LiyonField label={t("directory.roomNumber")} htmlFor="staff-room">
                <input
                  id="staff-room"
                  value={formRoomNumber}
                  onChange={(e) => setFormRoomNumber(e.target.value)}
                  placeholder="เช่น 401"
                />
              </LiyonField>
              <LiyonField label={t("directory.phoneExt")} htmlFor="staff-phone">
                <input
                  id="staff-phone"
                  value={formPhoneExt}
                  onChange={(e) => setFormPhoneExt(e.target.value)}
                  placeholder="เช่น 1001"
                />
              </LiyonField>
              <LiyonField label={t("directory.sortOrder")} htmlFor="staff-sort">
                <input
                  id="staff-sort"
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                />
              </LiyonField>
            </div>

            <LiyonField label={t("directory.avatarUrl")} htmlFor="staff-avatar">
              <input
                id="staff-avatar"
                value={formAvatarUrl}
                onChange={(e) => setFormAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </LiyonField>

            <LiyonField label={t("directory.expertise")} htmlFor="staff-expertise">
              <input
                id="staff-expertise"
                value={formExpertiseText}
                onChange={(e) => setFormExpertiseText(e.target.value)}
                placeholder="เช่น Artificial Intelligence, Machine Learning, Data Science"
              />
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isPending}>
            {t("directory.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {t("directory.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog ยืนยันการลบ */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogHeader
          title={t("directory.delete")}
          description={t("directory.deleteConfirm")}
        />
        <LiyonDialogBody>
          <p className="text-sm font-medium text-foreground">
            {deleteConfirmItem?.fullNameTh} ({deleteConfirmItem?.email})
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("directory.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem)}
            disabled={isPending}
          >
            {t("directory.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

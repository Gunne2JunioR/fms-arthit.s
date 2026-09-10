"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X, Calendar as CalendarIcon, Clock, MapPin, Users, Search, AlertCircle } from "lucide-react";
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
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { BookingReservationDto, FacilityResourceDto } from "@/features/booking";
import {
  getBookingsAction,
  createBookingAction,
  updateBookingStatusAction,
} from "@/features/booking/actions";

interface Props {
  initialBookings: BookingReservationDto[];
  resources: FacilityResourceDto[];
  canManage: boolean;
}

export function BookingsClient({ initialBookings, resources, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [bookings, setBookings] = useState<BookingReservationDto[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Create Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formResourceId, setFormResourceId] = useState(resources[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formAttendees, setFormAttendees] = useState(10);
  const [formStartAt, setFormStartAt] = useState("");
  const [formEndAt, setFormEndAt] = useState("");
  const [formNote, setFormNote] = useState("");

  const refreshList = async () => {
    const res = await getBookingsAction();
    if (res.ok) setBookings(res.data);
  };

  const handleCreate = () => {
    if (!formStartAt || !formEndAt) {
      toast.error("กรุณาระบุวันเวลาเริ่มต้นและสิ้นสุด");
      return;
    }
    startTransition(async () => {
      const res = await createBookingAction({
        resourceId: formResourceId,
        title: formTitle,
        attendeeCount: Number(formAttendees),
        startAt: new Date(formStartAt).toISOString(),
        endAt: new Date(formEndAt).toISOString(),
        note: formNote || undefined,
      });

      if (res.ok) {
        toast.success(t("booking.createSuccess"));
        setIsCreateOpen(false);
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleStatusChange = (id: string, newStatus: "CONFIRMED" | "REJECTED" | "CANCELLED") => {
    startTransition(async () => {
      const res = await updateBookingStatusAction({
        id,
        status: newStatus,
      });

      if (res.ok) {
        if (newStatus === "CONFIRMED") toast.success(t("booking.approveSuccess"));
        if (newStatus === "REJECTED") toast.success(t("booking.rejectSuccess"));
        if (newStatus === "CANCELLED") toast.success(t("booking.cancelSuccess"));
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.resource.nameTh.toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: DataTableColumn<BookingReservationDto>[] = [
    {
      key: "resource",
      header: t("booking.resource"),
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground leading-tight flex items-center gap-1.5">
            {locale === "en" ? row.resource.nameEn : row.resource.nameTh}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {row.resource.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {row.attendeeCount} คน
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "purpose",
      header: t("booking.purpose"),
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">{row.title}</p>
          {row.user && (
            <p className="text-xs text-muted-foreground">ผู้จอง: {row.user.name}</p>
          )}
        </div>
      ),
    },
    {
      key: "time",
      header: t("booking.startTime"),
      render: (row) => {
        const start = new Date(row.startAt);
        const end = new Date(row.endAt);
        const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        return (
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1 font-medium">
              <CalendarIcon className="h-3 w-3 text-primary" />
              {formatDate(start, locale)}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeStr}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("booking.status"),
      render: (row) => {
        const statusMap: Record<string, { tone: "warn" | "ok" | "off"; label: string }> = {
          PENDING_APPROVAL: { tone: "warn", label: t("booking.status.pending") },
          CONFIRMED: { tone: "ok", label: t("booking.status.confirmed") },
          REJECTED: { tone: "off", label: t("booking.status.rejected") },
          CANCELLED: { tone: "off", label: t("booking.status.cancelled") },
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
            <CalendarIcon className="h-6 w-6 text-primary" />
            {t("booking.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("booking.subtitle")}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("booking.create")}
        </Button>
      </div>

      <LiyonCard>
        <DataTable<BookingReservationDto>
          state={filteredBookings.length === 0 ? "empty" : "data"}
          headHeading={t("booking.title")}
          rows={filteredBookings}
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
                  placeholder="ค้นหาชื่อรายการ, สถานที่ หรือผู้จอง..."
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="PENDING_APPROVAL">{t("booking.status.pending")}</option>
                <option value="CONFIRMED">{t("booking.status.confirmed")}</option>
                <option value="REJECTED">{t("booking.status.rejected")}</option>
                <option value="CANCELLED">{t("booking.status.cancelled")}</option>
              </LiyonSelect>
            </div>
          }
          renderRowMenu={(row) => (
            <>
              {row.status === "PENDING_APPROVAL" && canManage && (
                <>
                  <RowMenuItem
                    onSelect={() => handleStatusChange(row.id, "CONFIRMED")}
                    icon={<Check className="h-4 w-4" />}
                  >
                    {t("booking.approve")}
                  </RowMenuItem>
                  <RowMenuItem
                    onSelect={() => handleStatusChange(row.id, "REJECTED")}
                    danger
                    icon={<X className="h-4 w-4" />}
                  >
                    {t("booking.reject")}
                  </RowMenuItem>
                </>
              )}
              {row.status === "CONFIRMED" && (
                <RowMenuItem
                  onSelect={() => handleStatusChange(row.id, "CANCELLED")}
                  danger
                  icon={<X className="h-4 w-4" />}
                >
                  {t("booking.cancel")}
                </RowMenuItem>
              )}
            </>
          )}
          empty={{
            icon: <CalendarIcon className="h-10 w-10 text-muted-foreground/50" />,
            title: t("booking.empty"),
            description: t("booking.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create Booking Dialog */}
      <LiyonDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} wide>
        <LiyonDialogHeader
          title={t("booking.create")}
          description={t("booking.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("booking.resource")}>
              <LiyonSelect
                value={formResourceId}
                onChange={(e) => setFormResourceId(e.target.value)}
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nameTh} ({r.location} - จุได้ {r.capacity} คน)
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("booking.purpose")}>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น ประชุมคณะกรรมการบริหารหลักสูตร"
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>

            <LiyonField label={t("booking.attendees")}>
              <input
                type="number"
                value={formAttendees}
                onChange={(e) => setFormAttendees(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("booking.startTime")}>
                <input
                  type="datetime-local"
                  value={formStartAt}
                  onChange={(e) => setFormStartAt(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("booking.endTime")}>
                <input
                  type="datetime-local"
                  value={formEndAt}
                  onChange={(e) => setFormEndAt(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("booking.note")}>
              <textarea
                rows={2}
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="ความต้องการเพิ่มเติม เช่น ไมโครโฟนไร้สาย 2 ตัว"
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {t("booking.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

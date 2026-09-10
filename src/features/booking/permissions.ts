import type { PermissionDef } from "@/shared/lib/permission-def";

export const BOOKING_P = {
  bookingRead: "booking:read",
  bookingManage: "booking:manage",
} as const;

export const BOOKING_PERMISSIONS: readonly PermissionDef[] = [
  { code: BOOKING_P.bookingRead, module: "booking", action: "read", description: "เข้าถึงและดูปฏิทินการจองห้องและยานพาหนะ" },
  { code: BOOKING_P.bookingManage, module: "booking", action: "manage", description: "อนุมัติ ปฏิเสธ หรือยกเลิกการจองทรัพยากร" },
];

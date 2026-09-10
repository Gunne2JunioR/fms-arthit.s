import type { PermissionDef } from "@/shared/lib/permission-def";

export const DIRECTORY_P = {
  staffRead: "staff:read",
  staffManage: "staff:manage",
} as const;

export const DIRECTORY_PERMISSIONS: readonly PermissionDef[] = [
  { code: DIRECTORY_P.staffRead, module: "directory", action: "read", description: "เข้าถึงและดูรายชื่อบุคลากรหลังบ้าน" },
  { code: DIRECTORY_P.staffManage, module: "directory", action: "manage", description: "เพิ่ม แก้ไข หรือระงับข้อมูลบุคลากร" },
];

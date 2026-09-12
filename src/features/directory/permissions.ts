import type { PermissionDef } from "@/shared/lib/permission-def";

export const DIRECTORY_P = {
  staffRead: "staff:read",
  staffManage: "staff:manage",
  departmentRead: "department:read",
  departmentManage: "department:manage",
} as const;

export const DIRECTORY_PERMISSIONS: readonly PermissionDef[] = [
  { code: DIRECTORY_P.staffRead, module: "directory", action: "read", description: "เข้าถึงและดูรายชื่อบุคลากรหลังบ้าน" },
  { code: DIRECTORY_P.staffManage, module: "directory", action: "manage", description: "เพิ่ม แก้ไข หรือระงับข้อมูลบุคลากร" },
  { code: DIRECTORY_P.departmentRead, module: "directory", action: "read", description: "เข้าถึงและดูข้อมูลภาควิชาหรือส่วนงาน" },
  { code: DIRECTORY_P.departmentManage, module: "directory", action: "manage", description: "เพิ่ม แก้ไข หรือลบข้อมูลภาควิชาหรือส่วนงาน" },
];

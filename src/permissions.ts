import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { NEWS_PERMISSIONS } from "@/features/news/permissions";
import { DIRECTORY_PERMISSIONS } from "@/features/directory/permissions";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum/permissions";
import { BOOKING_PERMISSIONS } from "@/features/booking/permissions";
import { DOCUMENT_PERMISSIONS } from "@/features/document/permissions";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...DIRECTORY_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...BOOKING_PERMISSIONS,
  ...DOCUMENT_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");

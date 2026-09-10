import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "directory.nav": { th: "จัดการบุคลากร", en: "Staff Directory", cn: "教职工管理" },
  "directory.title": { th: "ทำเนียบบุคลากร", en: "Faculty & Staff", cn: "师资队伍" },
  "directory.subtitle": { th: "จัดการข้อมูลคณาจารย์และบุคลากรสายสนับสนุนประจำคณะ", en: "Manage faculty members and administrative personnel", cn: "管理学院教学与行政支持人员信息" },
  "directory.create": { th: "เพิ่มบุคลากรใหม่", en: "Add Staff Member", cn: "新增人员" },
  "directory.edit": { th: "แก้ไขข้อมูล", en: "Edit Profile", cn: "编辑资料" },
  "directory.delete": { th: "ลบข้อมูล", en: "Delete Staff", cn: "删除人员" },

  // Fields
  "directory.name": { th: "ชื่อ-นามสกุล", en: "Full Name", cn: "姓名" },
  "directory.academicTitle": { th: "ตำแหน่งทางวิชาการ", en: "Academic Title", cn: "职称" },
  "directory.firstNameTh": { th: "ชื่อ (ไทย)", en: "First Name (Thai)", cn: "名字（泰文）" },
  "directory.lastNameTh": { th: "นามสกุล (ไทย)", en: "Last Name (Thai)", cn: "姓氏（泰文）" },
  "directory.firstNameEn": { th: "ชื่อ (อังกฤษ)", en: "First Name (English)", cn: "名字（英文）" },
  "directory.lastNameEn": { th: "นามสกุล (อังกฤษ)", en: "Last Name (English)", cn: "姓氏（英文）" },
  "directory.department": { th: "สังกัดสาขาวิชา/ฝ่าย", en: "Department", cn: "所属学系/部门" },
  "directory.position": { th: "ตำแหน่งบริหาร/หน้าที่", en: "Executive / Admin Position", cn: "行政职务" },
  "directory.email": { th: "อีเมลติดต่อ", en: "Email Address", cn: "电子邮箱" },
  "directory.phoneExt": { th: "เบอร์ต่อภายใน", en: "Ext. Phone", cn: "分机电话" },
  "directory.roomNumber": { th: "ห้องทำงาน", en: "Office Room", cn: "办公室号" },
  "directory.avatarUrl": { th: "URL รูปถ่าย", en: "Photo URL", cn: "照片网址" },
  "directory.expertise": { th: "ความเชี่ยวชาญ (คั่นด้วยจุลภาค)", en: "Expertise (Comma separated)", cn: "专业特长（逗号分隔）" },
  "directory.sortOrder": { th: "ลำดับการแสดงผล", en: "Sort Order", cn: "排序序号" },
  "directory.status": { th: "สถานะ", en: "Status", cn: "状态" },

  // Statuses
  "directory.status.active": { th: "ปฏิบัติงานปกติ", en: "Active", cn: "在职" },
  "directory.status.on_leave": { th: "ลาศึกษาต่อ/ลาพัก", en: "On Leave", cn: "进修/休假" },
  "directory.status.resigned": { th: "พ้นสภาพ/เกษียณ", en: "Resigned", cn: "离职/退休" },

  // Feedback
  "directory.empty": { th: "ยังไม่มีรายชื่อบุคลากรในระบบ", en: "No personnel records found", cn: "暂无教职工记录" },
  "directory.createSuccess": { th: "เพิ่มข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Staff member created successfully", cn: "新增人员成功" },
  "directory.updateSuccess": { th: "บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว", en: "Staff member updated successfully", cn: "更新人员成功" },
  "directory.deleteSuccess": { th: "ลบข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Staff member deleted successfully", cn: "删除人员成功" },
  "directory.deleteConfirm": { th: "คุณต้องการลบข้อมูลบุคลากรท่านนี้ใช่หรือไม่?", en: "Are you sure you want to delete this staff record?", cn: "确定要删除此人员记录吗？" },
  "directory.save": { th: "บันทึก", en: "Save", cn: "保存" },
  "directory.cancel": { th: "ยกเลิก", en: "Cancel", cn: "取消" },

  // RBAC Registry
  "roles.module.directory": { th: "ระบบจัดการบุคลากร", en: "Staff Directory", cn: "教职工管理系统" },
  "perm.staff:read": { th: "เข้าถึงและดูรายชื่อบุคลากรหลังบ้าน", en: "View staff directory", cn: "查看后台教职工列表" },
  "perm.staff:manage": { th: "จัดการ เพิ่ม แก้ไข หรือลบข้อมูลบุคลากร", en: "Manage staff directory", cn: "管理教职工信息" },
};

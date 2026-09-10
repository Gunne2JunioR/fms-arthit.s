import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "curriculum.nav": { th: "จัดการหลักสูตร", en: "Academic Programs", cn: "课程管理" },
  "curriculum.title": { th: "หลักสูตรการศึกษา", en: "Curriculum & Programs", cn: "学术课程" },
  "curriculum.subtitle": { th: "จัดการข้อมูลหลักสูตรระดับปริญญาตรี ปริญญาโท และปริญญาเอก", en: "Manage bachelor, master, and doctoral degree programs", cn: "管理学士、硕士及博士学位课程" },
  "curriculum.create": { th: "เพิ่มหลักสูตรใหม่", en: "Add Program", cn: "新增课程" },
  "curriculum.edit": { th: "แก้ไขหลักสูตร", en: "Edit Program", cn: "编辑课程" },
  "curriculum.delete": { th: "ลบหลักสูตร", en: "Delete Program", cn: "删除课程" },

  // Fields
  "curriculum.code": { th: "รหัสหลักสูตร", en: "Program Code", cn: "课程代码" },
  "curriculum.nameTh": { th: "ชื่อหลักสูตร (ไทย)", en: "Program Name (Thai)", cn: "课程名称（泰文）" },
  "curriculum.nameEn": { th: "ชื่อหลักสูตร (อังกฤษ)", en: "Program Name (English)", cn: "课程名称（英文）" },
  "curriculum.degreeLevel": { th: "ระดับการศึกษา", en: "Degree Level", cn: "学历层次" },
  "curriculum.degreeNameTh": { th: "ชื่อปริญญา (ไทย)", en: "Degree Title (Thai)", cn: "学位名称（泰文）" },
  "curriculum.degreeNameEn": { th: "ชื่อปริญญา (อังกฤษ)", en: "Degree Title (English)", cn: "学位名称（英文）" },
  "curriculum.curriculumYear": { th: "ปีปรับปรุงหลักสูตร (พ.ศ.)", en: "Curriculum Year", cn: "课程修订年（佛历）" },
  "curriculum.totalCredits": { th: "หน่วยกิตรวม", en: "Total Credits", cn: "总学分" },
  "curriculum.tuitionFeeSemester": { th: "ค่าธรรมเนียมต่อภาคการศึกษา (บาท)", en: "Tuition Fee / Term (THB)", cn: "每学期学费（泰铢）" },
  "curriculum.durationYears": { th: "ระยะเวลาศึกษา (ปี)", en: "Duration (Years)", cn: "学制（年）" },
  "curriculum.brochureFileUrl": { th: "URL เอกสารหลักสูตร/Brochure", en: "Brochure URL", cn: "课程手册下载链接" },
  "curriculum.description": { th: "คำอธิบายหลักสูตร", en: "Description", cn: "课程简介" },
  "curriculum.status": { th: "สถานะหลักสูตร", en: "Status", cn: "状态" },

  // Levels
  "curriculum.level.bachelor": { th: "ปริญญาตรี", en: "Bachelor's Degree", cn: "本科" },
  "curriculum.level.master": { th: "ปริญญาโท", en: "Master's Degree", cn: "硕士" },
  "curriculum.level.doctoral": { th: "ปริญญาเอก", en: "Doctoral Degree", cn: "博士" },
  "curriculum.level.diploma": { th: "ประกาศนียบัตร", en: "Diploma", cn: "专科/文凭" },

  // Statuses
  "curriculum.status.open_admission": { th: "เปิดรับสมัคร", en: "Open for Admission", cn: "招生中" },
  "curriculum.status.active": { th: "จัดการเรียนการสอนปกติ", en: "Active", cn: "正常开课" },
  "curriculum.status.revised": { th: "อยู่ระหว่างปรับปรุงหลักสูตร", en: "Under Revision", cn: "修订中" },
  "curriculum.status.closed": { th: "ปิดหลักสูตร", en: "Closed", cn: "已停办" },

  // Feedback
  "curriculum.empty": { th: "ยังไม่มีข้อมูลหลักสูตรในระบบ", en: "No programs found", cn: "暂无课程数据" },
  "curriculum.createSuccess": { th: "สร้างข้อมูลหลักสูตรเรียบร้อยแล้ว", en: "Program created successfully", cn: "课程创建成功" },
  "curriculum.updateSuccess": { th: "บันทึกการแก้ไขหลักสูตรเรียบร้อยแล้ว", en: "Program updated successfully", cn: "课程更新成功" },
  "curriculum.deleteSuccess": { th: "ลบหลักสูตรเรียบร้อยแล้ว", en: "Program deleted successfully", cn: "课程删除成功" },
  "curriculum.deleteConfirm": { th: "คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?", en: "Are you sure you want to delete this program?", cn: "确定要删除此课程吗？" },
  "curriculum.save": { th: "บันทึก", en: "Save", cn: "保存" },
  "curriculum.cancel": { th: "ยกเลิก", en: "Cancel", cn: "取消" },

  // RBAC Registry
  "roles.module.curriculum": { th: "ระบบจัดการหลักสูตร", en: "Academic Programs", cn: "课程管理系统" },
  "perm.curriculum:read": { th: "เข้าถึงและดูรายชื่อหลักสูตรหลังบ้าน", en: "View curriculum programs", cn: "查看后台课程列表" },
  "perm.curriculum:manage": { th: "จัดการ เพิ่ม แก้ไข หรือลบหลักสูตร", en: "Manage curriculum programs", cn: "管理课程信息" },
};

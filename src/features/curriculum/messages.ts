import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & Group Titles
  "curriculum.nav": { th: "จัดการหลักสูตร", en: "Academic Programs", cn: "课程管理" },
  "curriculum.nav.overview": { th: "ภาพรวมหลักสูตร", en: "Curriculum Overview", cn: "课程概览" },
  "curriculum.nav.programs": { th: "จัดการหลักสูตร", en: "Manage Programs", cn: "课程管理" },
  "curriculum.nav.faculties": { th: "จัดการคณะ", en: "Manage Faculties", cn: "学院管理" },
  "curriculum.nav.departments": { th: "จัดการภาควิชา", en: "Manage Departments", cn: "学系管理" },

  "curriculum.title": { th: "หลักสูตรการศึกษา", en: "Curriculum & Programs", cn: "学术课程" },
  "curriculum.subtitle": { th: "จัดการข้อมูลหลักสูตรระดับปริญญาตรี ปริญญาโท และปริญญาเอก", en: "Manage bachelor, master, and doctoral degree programs", cn: "管理学士、硕士及博士学位课程" },
  "curriculum.create": { th: "เพิ่มหลักสูตรใหม่", en: "Add Program", cn: "新增课程" },
  "curriculum.edit": { th: "แก้ไขหลักสูตร", en: "Edit Program", cn: "编辑课程" },
  "curriculum.delete": { th: "ลบหลักสูตร", en: "Delete Program", cn: "删除课程" },
  "curriculum.archiveConfirm": { th: "คุณต้องการลบหรือเก็บถาวรหลักสูตรนี้ใช่หรือไม่?", en: "Are you sure you want to delete or archive this program?", cn: "确定要删除或归档此课程吗？" },
  "curriculum.archivedSuccess": { th: "จัดเก็บหลักสูตรเข้าสู่สถานะเก็บถาวรเรียบร้อยแล้ว", en: "Program archived successfully", cn: "课程已成功归档" },

  // Program Fields
  "curriculum.code": { th: "รหัสหลักสูตร", en: "Program Code", cn: "课程代码" },
  "curriculum.nameTh": { th: "ชื่อหลักสูตร (ไทย)", en: "Program Name (Thai)", cn: "课程名称（泰文）" },
  "curriculum.nameEn": { th: "ชื่อหลักสูตร (อังกฤษ)", en: "Program Name (English)", cn: "课程名称（英文）" },
  "curriculum.degreeLevel": { th: "ระดับการศึกษา", en: "Degree Level", cn: "学历层次" },
  "curriculum.degreeNameTh": { th: "ชื่อปริญญา (ไทย)", en: "Degree Title (Thai)", cn: "学位名称（泰文）" },
  "curriculum.degreeNameEn": { th: "ชื่อปริญญา (อังกฤษ)", en: "Degree Title (English)", cn: "学位名称（英文）" },
  "curriculum.degreeShortTh": { th: "ชื่อย่อปริญญา (ไทย)", en: "Degree Abbreviation (Thai)", cn: "学位简称（泰文）" },
  "curriculum.degreeShortEn": { th: "ชื่อย่อปริญญา (อังกฤษ)", en: "Degree Abbreviation (English)", cn: "学位简称（英文）" },
  "curriculum.programType": { th: "ประเภทหลักสูตร", en: "Program Type", cn: "课程类型" },
  "curriculum.majorName": { th: "สาขาวิชา/แขนงวิชา", en: "Major / Field of Study", cn: "专业/研究方向" },
  "curriculum.curriculumYear": { th: "ปีปรับปรุงหลักสูตร (พ.ศ.)", en: "Curriculum Year", cn: "课程修订年（佛历）" },
  "curriculum.startAcademicYear": { th: "ปีการศึกษาที่เริ่มใช้", en: "Start Academic Year", cn: "开始实行学年" },
  "curriculum.studyFormat": { th: "รูปแบบการศึกษา", en: "Study Format", cn: "学习形式" },
  "curriculum.instructionLanguage": { th: "ภาษาที่ใช้ในการสอน", en: "Instruction Language", cn: "授课语言" },
  "curriculum.totalCredits": { th: "หน่วยกิตรวม", en: "Total Credits", cn: "总学分" },
  "curriculum.tuitionFeeSemester": { th: "ค่าธรรมเนียมต่อภาคการศึกษา (บาท)", en: "Tuition Fee / Term (THB)", cn: "每学期学费（泰铢）" },
  "curriculum.durationYears": { th: "ระยะเวลาศึกษา (ปี)", en: "Duration (Years)", cn: "学制（年）" },
  "curriculum.brochureFileUrl": { th: "URL เอกสารหลักสูตร/Brochure", en: "Brochure URL", cn: "课程手册下载链接" },
  "curriculum.description": { th: "คำอธิบายหลักสูตร", en: "Description", cn: "课程简介" },
  "curriculum.status": { th: "สถานะหลักสูตร", en: "Status", cn: "状态" },
  "curriculum.faculty": { th: "คณะที่สังกัด", en: "Affiliated Faculty", cn: "所属学院" },
  "curriculum.department": { th: "ภาควิชา/ส่วนงานที่รับผิดชอบ", en: "Responsible Department", cn: "负责学系/部门" },
  "curriculum.filterFaculty": { th: "ทุกคณะ", en: "All Faculties", cn: "所有学院" },
  "curriculum.filterDepartment": { th: "ทุกภาควิชา/ส่วนงาน", en: "All Departments", cn: "所有学系/部门" },
  "curriculum.filterLevel": { th: "ทุกระดับการศึกษา", en: "All Degree Levels", cn: "所有学历层次" },
  "curriculum.filterStatus": { th: "ทุกสถานะ", en: "All Statuses", cn: "所有状态" },
  "curriculum.noDepartment": { th: "ไม่ระบุภาควิชา (สังกัดคณะโดยตรง)", en: "Direct Faculty (No Department)", cn: "直属学院（无所属系）" },
  "curriculum.directors": { th: "อาจารย์ผู้รับผิดชอบหลักสูตร", en: "Program Directors", cn: "专业负责人/学术导师" },
  "curriculum.selectDirectors": { th: "เลือกอาจารย์ผู้รับผิดชอบหลักสูตร", en: "Select Program Directors", cn: "选择课程负责人" },

  // Program Form Tabs
  "curriculum.tabBasic": { th: "ข้อมูลหลักสูตร", en: "Basic Information", cn: "基本信息" },
  "curriculum.tabAffiliation": { th: "หน่วยงานรับผิดชอบ", en: "Faculty & Department", cn: "所属院系" },
  "curriculum.tabDetails": { th: "รายละเอียดและเอกสาร", en: "Details & Documents", cn: "详细资料与附件" },

  // Levels
  "curriculum.level.bachelor": { th: "ปริญญาตรี", en: "Bachelor's Degree", cn: "本科" },
  "curriculum.level.master": { th: "ปริญญาโท", en: "Master's Degree", cn: "硕士" },
  "curriculum.level.doctoral": { th: "ปริญญาเอก", en: "Doctoral Degree", cn: "博士" },
  "curriculum.level.diploma": { th: "ประกาศนียบัตร", en: "Diploma", cn: "专科/文凭" },

  // Statuses
  "curriculum.status.open_admission": { th: "เปิดรับสมัคร", en: "Open for Admission", cn: "招生中" },
  "curriculum.status.active": { th: "จัดการเรียนการสอนปกติ", en: "Active", cn: "正常开课" },
  "curriculum.status.revised": { th: "อยู่ระหว่างปรับปรุง", en: "Under Revision", cn: "修订中" },
  "curriculum.status.closed": { th: "ปิดหลักสูตร", en: "Closed", cn: "已停办" },
  "curriculum.status.archived": { th: "เก็บถาวร", en: "Archived", cn: "已归档" },

  // Program Types & Formats
  "curriculum.type.regular": { th: "หลักสูตรปกติ (ภาคปกติ)", en: "Regular Program", cn: "普通课程" },
  "curriculum.type.special": { th: "หลักสูตรพิเศษ (ภาคค่ำ/เสาร์-อาทิตย์)", en: "Special Program (Weekend/Evening)", cn: "特设/周末班" },
  "curriculum.type.international": { th: "หลักสูตรนานาชาติ", en: "International Program", cn: "国际课程" },
  "curriculum.type.bilingual": { th: "หลักสูตรสองภาษา", en: "Bilingual Program", cn: "双语课程" },

  "curriculum.format.onsite": { th: "จัดการเรียนการสอนในชั้นเรียน (On-site)", en: "On-site", cn: "线下授课" },
  "curriculum.format.online": { th: "จัดการเรียนการสอนออนไลน์ (Online)", en: "Online", cn: "线上授课" },
  "curriculum.format.hybrid": { th: "จัดการเรียนการสอนแบบผสมผสาน (Hybrid)", en: "Hybrid", cn: "混合式教学" },

  "curriculum.lang.th": { th: "ภาษาไทย", en: "Thai", cn: "泰语" },
  "curriculum.lang.en": { th: "ภาษาอังกฤษ", en: "English", cn: "英语" },
  "curriculum.lang.bilingual": { th: "ไทยและอังกฤษ", en: "Thai & English", cn: "泰英双语" },

  // Feedback
  "curriculum.empty": { th: "ยังไม่มีข้อมูลหลักสูตรในระบบ", en: "No programs found", cn: "暂无课程数据" },
  "curriculum.createSuccess": { th: "สร้างข้อมูลหลักสูตรเรียบร้อยแล้ว", en: "Program created successfully", cn: "课程创建成功" },
  "curriculum.updateSuccess": { th: "บันทึกการแก้ไขหลักสูตรเรียบร้อยแล้ว", en: "Program updated successfully", cn: "课程更新成功" },
  "curriculum.deleteSuccess": { th: "ลบหลักสูตรเรียบร้อยแล้ว", en: "Program deleted successfully", cn: "课程删除成功" },
  "curriculum.deleteConfirm": { th: "คุณต้องการลบหลักสูตรนี้ใช่หรือไม่? การดำเนินการนี้จะลบข้อมูลหลักสูตรออกจากระบบอย่างถาวร", en: "Are you sure you want to delete this program? This action will permanently remove it from the system.", cn: "确定要删除此课程吗？此操作将从系统中永久删除该课程。" },
  "curriculum.save": { th: "บันทึก", en: "Save", cn: "保存" },
  "curriculum.cancel": { th: "ยกเลิก", en: "Cancel", cn: "取消" },

  // Faculty Management Module (/admin/faculties)
  "faculty.title": { th: "จัดการคณะ", en: "Faculty Management", cn: "学院管理" },
  "faculty.subtitle": { th: "จัดการโครงสร้างคณะ หน่วยงานระดับคณะ และข้อมูลผู้บริหาร", en: "Manage faculties, faculty structures, and executive details", cn: "管理学院组织架构及院领导信息" },
  "faculty.listTitle": { th: "รายชื่อคณะทั้งหมด", en: "All Faculties", cn: "所有学院列表" },
  "faculty.create": { th: "เพิ่มคณะใหม่", en: "Add Faculty", cn: "新增学院" },
  "faculty.edit": { th: "แก้ไขคณะ", en: "Edit Faculty", cn: "编辑学院" },
  "faculty.delete": { th: "ลบคณะ", en: "Delete Faculty", cn: "删除学院" },
  "faculty.deleteConfirm": { th: "คุณต้องการลบคณะนี้ใช่หรือไม่? หากมีภาควิชาหรือหลักสูตรสังกัดอยู่ จะถูกเปลี่ยนเป็นสถานะ 'เก็บถาวร' แทน", en: "Are you sure you want to delete this faculty? If departments or programs exist, it will be archived safely.", cn: "确定要删除此学院吗？若下属存在学系或课程，将被安全归档。" },
  "faculty.createSuccess": { th: "สร้างข้อมูลคณะเรียบร้อยแล้ว", en: "Faculty created successfully", cn: "学院创建成功" },
  "faculty.updateSuccess": { th: "บันทึกการแก้ไขคณะเรียบร้อยแล้ว", en: "Faculty updated successfully", cn: "学院更新成功" },
  "faculty.deleteSuccess": { th: "ลบข้อมูลคณะเรียบร้อยแล้ว", en: "Faculty deleted successfully", cn: "学院删除成功" },
  "faculty.archiveSuccess": { th: "จัดเก็บเข้าสู่สถานะเก็บถาวรเรียบร้อยแล้ว (เนื่องจากมีข้อมูลอ้างอิง)", en: "Archived successfully due to existing references", cn: "已成功转为归档（由于存在关联数据）" },
  "faculty.empty": { th: "ยังไม่มีข้อมูลคณะในระบบ", en: "No faculties found", cn: "暂无学院数据" },

  "faculty.code": { th: "รหัสคณะ", en: "Faculty Code", cn: "学院代码" },
  "faculty.nameTh": { th: "ชื่อคณะ (ไทย)", en: "Faculty Name (Thai)", cn: "学院名称（泰文）" },
  "faculty.nameEn": { th: "ชื่อคณะ (อังกฤษ)", en: "Faculty Name (English)", cn: "学院名称（英文）" },
  "faculty.shortNameTh": { th: "ชื่อย่อ (ไทย)", en: "Abbreviation (Thai)", cn: "学院简称（泰文）" },
  "faculty.shortNameEn": { th: "ชื่อย่อ (อังกฤษ)", en: "Abbreviation (English)", cn: "学院简称（英文）" },
  "faculty.dean": { th: "คณบดี", en: "Dean of Faculty", cn: "院长" },
  "faculty.selectDean": { th: "เลือกคณบดีจากทำเนียบบุคลากร", en: "Select Dean from Staff Directory", cn: "从师资名录选择院长" },
  "faculty.email": { th: "อีเมลติดต่อ", en: "Contact Email", cn: "联络邮箱" },
  "faculty.phone": { th: "เบอร์โทรศัพท์", en: "Phone Number", cn: "联系电话" },
  "faculty.website": { th: "เว็บไซต์", en: "Website", cn: "学院官方网站" },
  "faculty.buildingLocation": { th: "อาคาร/สถานที่ตั้ง", en: "Building Location", cn: "办公楼宇/地点" },
  "faculty.description": { th: "คำอธิบาย/วิสัยทัศน์", en: "Description / Vision", cn: "学院简介/愿景" },
  "faculty.logoUrl": { th: "URL ตราสัญลักษณ์คณะ", en: "Faculty Logo URL", cn: "学院院徽网址" },
  "faculty.departmentsCount": { th: "จำนวนภาควิชา", en: "Departments", cn: "下属学系数" },
  "faculty.programsCount": { th: "จำนวนหลักสูตร", en: "Programs", cn: "开设课程数" },
  "faculty.status": { th: "สถานะ", en: "Status", cn: "状态" },
  "faculty.sortOrder": { th: "ลำดับการแสดงผล", en: "Sort Order", cn: "排序序号" },

  // Statuses
  "faculty.status.active": { th: "เปิดดำเนินการ", en: "Active", cn: "正常运营" },
  "faculty.status.inactive": { th: "ระงับชั่วคราว", en: "Inactive", cn: "暂停运营" },
  "faculty.status.archived": { th: "เก็บถาวร", en: "Archived", cn: "已归档" },

  // Overview Dashboard Module (/admin/programs/overview)
  "curriculum.overview.title": { th: "ภาพรวมโครงสร้างทางวิชาการและหลักสูตร", en: "Academic & Curriculum Overview", cn: "学术架构与课程概览" },
  "curriculum.overview.subtitle": { th: "สถิติสรุปจำนวนคณะ ภาควิชา และหลักสูตรการศึกษาจำแนกตามระดับและสถานะ", en: "Summary statistics of faculties, departments, and degree programs", cn: "学院、学系及各层次学术课程统计概览" },
  "curriculum.overview.totalFaculties": { th: "คณะทั้งหมด", en: "Total Faculties", cn: "学院总数" },
  "curriculum.overview.totalDepartments": { th: "ภาควิชาทั้งหมด", en: "Total Departments", cn: "学系总数" },
  "curriculum.overview.totalPrograms": { th: "หลักสูตรทั้งหมด", en: "Total Programs", cn: "课程总数" },
  "curriculum.overview.activePrograms": { th: "หลักสูตรที่เปิดสอนปกติ", en: "Active Programs", cn: "正常开课课程" },
  "curriculum.overview.openPrograms": { th: "หลักสูตรที่เปิดรับสมัคร", en: "Open for Admission", cn: "招生中课程" },
  "curriculum.overview.programsByLevel": { th: "จำแนกตามระดับการศึกษา", en: "Programs by Degree Level", cn: "按学历层次分布" },
  "curriculum.overview.programsByFaculty": { th: "จำนวนหลักสูตรแยกตามคณะ", en: "Programs by Faculty", cn: "各学院开设课程分布" },
  "curriculum.overview.programsByStatus": { th: "จำแนกตามสถานะการดำเนินงาน", en: "Programs by Status", cn: "按课程状态分布" },
  "curriculum.overview.recentPrograms": { th: "หลักสูตรปรับปรุงล่าสุด", en: "Recently Updated Programs", cn: "最近更新的课程" },

  // Import / Export
  "curriculum.importBtn": { th: "นำเข้าข้อมูล CSV", en: "Import CSV", cn: "导入 CSV" },
  "curriculum.exportBtn": { th: "ส่งออกข้อมูล CSV", en: "Export CSV", cn: "导出 CSV" },
  "curriculum.importTitle": { th: "นำเข้าข้อมูลจากไฟล์ CSV", en: "Import Data from CSV", cn: "从 CSV 文件导入数据" },
  "curriculum.importDesc": { th: "อัปโหลดไฟล์ CSV ตามเทมเพลตที่กำหนดเพื่อเพิ่มข้อมูลอย่างรวดเร็ว", en: "Upload a CSV file according to the template to import records.", cn: "上传符合模板格式的 CSV 文件以批量导入数据。" },
  "curriculum.downloadTemplate": { th: "ดาวน์โหลดตัวอย่างเทมเพลต CSV", en: "Download CSV Template", cn: "下载 CSV 模板" },
  "curriculum.uploadFile": { th: "เลือกไฟล์ CSV", en: "Select CSV File", cn: "选择 CSV 文件" },

  // RBAC Registry
  "roles.module.curriculum": { th: "ระบบจัดการหลักสูตรและโครงสร้างวิชาการ", en: "Curriculum & Academic Structure", cn: "学术课程与组织架构管理" },
  "perm.curriculum:read": { th: "เข้าถึงและดูรายชื่อหลักสูตรและคณะหลังบ้าน", en: "View curriculum programs & faculties", cn: "查看后台课程与学院列表" },
  "perm.curriculum:manage": { th: "จัดการ เพิ่ม แก้ไข หรือลบหลักสูตรและคณะ", en: "Manage curriculum programs & faculties", cn: "管理课程与学院信息" },
};


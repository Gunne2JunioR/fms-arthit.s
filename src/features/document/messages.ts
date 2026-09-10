import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "document.nav": { th: "ระบบสารบรรณ", en: "e-Documents", cn: "公文流转" },
  "document.title": { th: "ระบบสารบรรณและอนุมัติเอกสาร", en: "e-Document & Approval Workflow", cn: "电子公文与审批流转" },
  "document.subtitle": { th: "จัดการและติดตามคำขออนุมัติตามสายการบังคับบัญชาแบบ Paperless", en: "Manage official memos, requests, and multi-step approval workflows", cn: "无纸化管理行政公文、申请及多级逐级审批流程" },
  "document.create": { th: "ยื่นคำขอใหม่", en: "Submit Request", cn: "发起公文申请" },
  "document.approve": { th: "อนุมัติคำขอ", en: "Approve Step", cn: "签字批准" },
  "document.reject": { th: "ตีกลับ/ปฏิเสธ", en: "Reject Request", cn: "驳回申请" },

  // Fields
  "document.docNumber": { th: "เลขที่หนังสือ", en: "Document No.", cn: "公文编号" },
  "document.type": { th: "ประเภทเอกสาร", en: "Document Type", cn: "公文类型" },
  "document.type.memo": { th: "บันทึกข้อความภายใน", en: "Internal Memo", cn: "内部函件" },
  "document.type.purchase": { th: "ขออนุมัติจัดซื้อ/จัดจ้าง", en: "Purchase Request", cn: "采购/招投标申请" },
  "document.type.leave": { th: "ขออนุมัติลาพักผ่อน/ลากิจ", en: "Leave Request", cn: "请假申请" },
  "document.type.travel": { th: "ขออนุมัติเดินทางไปราชการ", en: "Official Travel", cn: "出差公务申请" },

  "document.urgency": { th: "ความเร่งด่วน", en: "Urgency", cn: "紧急程度" },
  "document.urgency.normal": { th: "ปกติ", en: "Normal", cn: "普通" },
  "document.urgency.urgent": { th: "ด่วน", en: "Urgent", cn: "急件" },
  "document.urgency.very_urgent": { th: "ด่วนที่สุด", en: "Very Urgent", cn: "特急" },

  "document.subject": { th: "เรื่อง", en: "Subject", cn: "事由/主题" },
  "document.description": { th: "รายละเอียดข้อความ", en: "Description / Content", cn: "详细内容" },
  "document.requester": { th: "ผู้ยื่นคำขอ", en: "Requester", cn: "申请人" },
  "document.workflow": { th: "ขั้นตอนการอนุมัติ", en: "Approval Progress", cn: "审批进度" },
  "document.status": { th: "สถานะ", en: "Status", cn: "状态" },

  // Statuses
  "document.status.draft": { th: "ร่างเอกสาร", en: "Draft", cn: "草稿" },
  "document.status.pending": { th: "รอการพิจารณา", en: "Pending Review", cn: "待审批" },
  "document.status.approved": { th: "อนุมัติครบถ้วน", en: "Fully Approved", cn: "已完成审批" },
  "document.status.rejected": { th: "ไม่อนุมัติ/ยุติ", en: "Rejected", cn: "已驳回" },
  "document.status.cancelled": { th: "ยกเลิกแล้ว", en: "Cancelled", cn: "已撤销" },

  // Steps
  "document.step.pending": { th: "รอพิจารณา", en: "Pending", cn: "待处理" },
  "document.step.approved": { th: "อนุมัติแล้ว", en: "Approved", cn: "已通过" },
  "document.step.rejected": { th: "ปฏิเสธ", en: "Rejected", cn: "已拒绝" },

  // Feedback
  "document.empty": { th: "ไม่พบเอกสารในระบบ", en: "No document requests found", cn: "暂无公文记录" },
  "document.createSuccess": { th: "สร้างและยื่นคำขออนุมัติเรียบร้อยแล้ว", en: "Document submitted successfully", cn: "公文申请已成功提交" },
  "document.approveSuccess": { th: "ลงนามอนุมัติเอกสารเรียบร้อยแล้ว", en: "Document approved successfully", cn: "公文签署审批成功" },
  "document.rejectSuccess": { th: "ตีกลับคำขอเรียบร้อยแล้ว", en: "Document rejected successfully", cn: "公文已驳回" },
  "document.save": { th: "ยื่นคำขอ", en: "Submit", cn: "提交申请" },

  // RBAC Registry
  "roles.module.document": { th: "ระบบบริหารและอนุมัติเอกสาร", en: "e-Document Workflow", cn: "公文与审批流系统" },
  "perm.document:read": { th: "เข้าถึงและดูรายการเอกสารหลังบ้าน", en: "View document requests", cn: "查看后台公文列表" },
  "perm.document:create": { th: "สร้างและยื่นเอกสารขออนุมัติ", en: "Create document requests", cn: "发起公文申请" },
  "perm.document:approve": { th: "ลงนามอนุมัติเอกสารตามสายงาน", en: "Approve document requests", cn: "审批签署公文" },
};

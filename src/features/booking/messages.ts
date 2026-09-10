import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "booking.nav": { th: "จัดการการจอง", en: "Resource Booking", cn: "预订管理" },
  "booking.title": { th: "ระบบจองห้องประชุมและยานพาหนะ", en: "Resource & Facility Booking", cn: "会议室与车辆预订系统" },
  "booking.subtitle": { th: "จัดการคำขอจองห้องประชุม ห้องปฏิบัติการ และรถยนต์ส่วนกลางของคณะ", en: "Manage room reservations and official vehicle booking requests", cn: "管理学院会议室、实验室及公车预订申请" },
  "booking.create": { th: "ทำรายการจอง", en: "New Booking", cn: "发起预订" },
  "booking.approve": { th: "อนุมัติ", en: "Approve", cn: "批准" },
  "booking.reject": { th: "ปฏิเสธ", en: "Reject", cn: "拒绝" },
  "booking.cancel": { th: "ยกเลิกการจอง", en: "Cancel Booking", cn: "取消预订" },

  // Fields
  "booking.resource": { th: "ทรัพยากร/สถานที่", en: "Resource / Facility", cn: "资源/场所" },
  "booking.type": { th: "ประเภท", en: "Type", cn: "类型" },
  "booking.type.room": { th: "ห้องประชุม/ห้องบรรยาย", en: "Meeting Room", cn: "会议室/报告厅" },
  "booking.type.vehicle": { th: "ยานพาหนะส่วนกลาง", en: "Official Vehicle", cn: "公用车辆" },
  "booking.purpose": { th: "วัตถุประสงค์การใช้", en: "Purpose / Title", cn: "用途/事由" },
  "booking.attendees": { th: "จำนวนผู้เข้าร่วม (คน)", en: "Attendees", cn: "参会人数" },
  "booking.startTime": { th: "วันเวลาเริ่มต้น", en: "Start Time", cn: "开始时间" },
  "booking.endTime": { th: "วันเวลาสิ้นสุด", en: "End Time", cn: "结束时间" },
  "booking.requester": { th: "ผู้ขอจอง", en: "Requester", cn: "预订人" },
  "booking.note": { th: "หมายเหตุเพิ่มเติม", en: "Note", cn: "备注说明" },
  "booking.status": { th: "สถานะ", en: "Status", cn: "状态" },

  // Statuses
  "booking.status.pending": { th: "รออนุมัติ", en: "Pending Approval", cn: "待审批" },
  "booking.status.confirmed": { th: "อนุมัติแล้ว", en: "Confirmed", cn: "已批准" },
  "booking.status.rejected": { th: "ไม่อนุมัติ", en: "Rejected", cn: "已驳回" },
  "booking.status.cancelled": { th: "ยกเลิกแล้ว", en: "Cancelled", cn: "已取消" },

  // Feedback
  "booking.empty": { th: "ไม่พบรายการจองในช่วงเวลานี้", en: "No booking records found", cn: "暂无预订记录" },
  "booking.conflict": { th: "ไม่สามารถจองได้ เนื่องจากมีการจองทับซ้อนในช่วงเวลาดังกล่าว", en: "Timeslot conflict: the resource is already booked", cn: "该时段已被占用，无法预订" },
  "booking.createSuccess": { th: "ส่งคำขอจองเรียบร้อยแล้ว", en: "Booking requested successfully", cn: "预订申请已提交" },
  "booking.approveSuccess": { th: "อนุมัติการจองเรียบร้อยแล้ว", en: "Booking approved successfully", cn: "预订已批准" },
  "booking.rejectSuccess": { th: "ปฏิเสธการจองเรียบร้อยแล้ว", en: "Booking rejected successfully", cn: "预订已驳回" },
  "booking.cancelSuccess": { th: "ยกเลิกการจองเรียบร้อยแล้ว", en: "Booking cancelled successfully", cn: "预订已取消" },
  "booking.save": { th: "ยืนยันการจอง", en: "Submit Booking", cn: "确认提交" },
  "booking.close": { th: "ปิด", en: "Close", cn: "关闭" },

  // RBAC Registry
  "roles.module.booking": { th: "ระบบจองห้องประชุมและยานพาหนะ", en: "Facility Booking", cn: "设施预订系统" },
  "perm.booking:read": { th: "เข้าถึงและดูปฏิทินการจองหลังบ้าน", en: "View facility bookings", cn: "查看后台预订日程" },
  "perm.booking:manage": { th: "อนุมัติ ปฏิเสธ หรือจัดการคำขอจอง", en: "Manage facility bookings", cn: "审批与管理预订" },
};

"use client";

import { useState, useTransition } from "react";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { createStaffAction } from "@/features/directory/actions";
import type { DepartmentDto, CreateStaffInput, PersonnelType } from "@/features/directory";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentDto[];
  onSuccess: () => void;
}

export function ImportExportDialog({
  open,
  onOpenChange,
  departments,
  onSuccess,
}: Props) {
  const t = useT();
  const [isPending, startTransition] = useTransition();
  const [parsedRows, setParsedRows] = useState<CreateStaffInput[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (content: string) => {
    try {
      const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length <= 1) {
        setErrorMsg("ไฟล์ไม่มีข้อมูล หรือมีเพียงแถวหัวตาราง");
        setParsedRows([]);
        return;
      }

      // Expected columns: รหัสบุคลากร, คำนำหน้า, ชื่อ, นามสกุล, รหัสหน่วยงาน, ประเภท, ตำแหน่ง, อีเมล
      const rows: CreateStaffInput[] = [];
      const dataLines = lines.slice(1);

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        if (cols.length < 5) continue;

        const [pCode, prefix, fName, lName, deptCode, type, pos, email] = cols;
        const targetDept = departments.find(
          (d) => d.code.toLowerCase() === (deptCode || "").toLowerCase()
        ) || departments[0];

        if (!targetDept) continue;

        const pType: PersonnelType =
          type === "EXECUTIVE" ||
          type === "ACADEMIC" ||
          type === "SUPPORT" ||
          type === "CONTRACT" ||
          type === "OTHER"
            ? type
            : "ACADEMIC";

        rows.push({
          personnelCode: pCode || `PERS-${Date.now()}-${i}`,
          prefix: prefix || "อาจารย์",
          firstNameTh: fName || "ชื่อ",
          lastNameTh: lName || "นามสกุล",
          firstNameEn: "",
          lastNameEn: "",
          academicTitleTh: prefix || "",
          academicTitleEn: "",
          departmentId: targetDept.id,
          personnelType: pType,
          employmentStatus: "ACTIVE",
          positionName: pos || "อาจารย์ประจำ",
          email: email || `${pCode || i}@fms.ac.th`,
          status: "ACTIVE",
          expertise: [],
          sortOrder: 0,
        });
      }

      setParsedRows(rows);
    } catch {
      setErrorMsg("ไม่สามารถประมวลผลไฟล์ CSV ได้ กรุณาตรวจสอบรูปแบบไฟล์");
    }
  };

  const handleImport = () => {
    if (parsedRows.length === 0) return;

    startTransition(async () => {
      let imported = 0;
      let failed = 0;

      for (const row of parsedRows) {
        try {
          const res = await createStaffAction(row);
          if (res.ok) imported++;
          else failed++;
        } catch {
          failed++;
        }
      }

      if (imported > 0) {
        toast.success(`นำเข้าข้อมูลบุคลากรสำเร็จ ${imported} รายการ${failed > 0 ? ` (ไม่สำเร็จ ${failed} รายการ)` : ""}`);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("การนำเข้าล้มเหลว กรุณาตรวจสอบข้อมูลซ้ำ");
      }
    });
  };

  const handleDownloadTemplate = () => {
    const template = "\uFEFFรหัสบุคลากร,คำนำหน้า,ชื่อ,นามสกุล,รหัสหน่วยงาน,ประเภท(ACADEMIC/SUPPORT/EXECUTIVE),ตำแหน่งงาน,อีเมล\r\nPERS-00001,อาจารย์ ดร.,สมใจ,รักเรียน,CS,ACADEMIC,อาจารย์ประจำ,somjai@fms.ac.th\r\nPERS-00002,นาย,ประสิทธิ์,มั่นคง,IT,SUPPORT,นักวิชาการคอมพิวเตอร์,prasit@fms.ac.th";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personnel_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <LiyonDialogHeader
        title={t("personnel.importBtn")}
        description="นำเข้าข้อมูลบุคลากรแบบกลุ่มผ่านไฟล์ CSV"
      />
      <LiyonDialogBody>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
            <div className="space-y-0.5 text-xs">
              <p className="font-semibold text-foreground">ไฟล์ต้นแบบสำหรับนำเข้า (Template)</p>
              <p className="text-muted-foreground">ดาวน์โหลดไฟล์ตัวอย่างและใส่ข้อมูลตามคอลัมน์ที่กำหนด</p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5" />
              <span>ดาวน์โหลด Template</span>
            </Button>
          </div>

          <div className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/10 transition-colors">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-xs font-semibold text-foreground">เลือกไฟล์ CSV จากเครื่องของคุณ</p>
            <p className="text-[11px] text-muted-foreground">รองรับการเข้ารหัส UTF-8</p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted cursor-pointer transition-colors shadow-2xs mt-2">
              <Upload className="h-3.5 w-3.5" />
              <span>เลือกไฟล์ CSV</span>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>พร้อมนำเข้าข้อมูลจำนวน {parsedRows.length} รายการ</span>
            </div>
          )}
        </div>
      </LiyonDialogBody>
      <LiyonDialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleImport} disabled={isPending || parsedRows.length === 0}>
          {isPending ? "กำลังนำเข้า..." : "ยืนยันนำเข้าข้อมูล"}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}

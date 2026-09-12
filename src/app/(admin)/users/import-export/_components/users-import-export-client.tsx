"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSelect } from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { localizedName } from "@/shared/lib/format";
import { exportUsersCsvAction, importUsersCsvAction } from "@/features/identity/actions";
import type { ImportUsersResult } from "@/features/identity";

interface RolePick {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface ParsedUserRow {
  name: string;
  email: string;
  roles: string;
  googleEmail?: string | null;
  allowGoogleLogin?: boolean;
}

export function UsersImportExportClient({
  canManage,
  roles,
}: {
  canManage: boolean;
  roles: RolePick[];
}) {
  const t = useT();
  const locale = useLocale();
  const [tab, setTab] = useState<"import" | "export">("import");

  // Export States
  const [exportStatus, setExportStatus] = useState<"all" | "active" | "inactive">("all");
  const [exportRoleId, setExportRoleId] = useState<string>("");
  const [isExporting, startExportTransition] = useTransition();

  // Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedUserRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportUsersResult | null>(null);
  const [isImporting, startImportTransition] = useTransition();

  // Helper parse simple CSV
  const parseCsvText = (text: string): ParsedUserRow[] => {
    // Remove UTF-8 BOM if present
    const cleanText = text.replace(/^\uFEFF/, "").trim();
    if (!cleanText) return [];

    const lines = cleanText.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) {
      throw new Error("ไฟล์ CSV ต้องมีแถวหัวตาราง (Header) และข้อมูลอย่างน้อย 1 แถว");
    }

    // Split CSV Line taking into account double quotes
    const splitLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === "," && !inQuotes) {
          result.push(cur.trim());
          cur = "";
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const header = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]/g, ""));
    const nameIdx = header.findIndex((h) => h === "name" || h === "ชื่อ" || h === "fullname");
    const emailIdx = header.findIndex((h) => h === "email" || h === "อีเมล");
    const rolesIdx = header.findIndex((h) => h === "roles" || h === "role" || h === "บทบาท");
    const googleEmailIdx = header.findIndex((h) => h === "googleemail" || h === "อีเมลgoogle");
    const allowGoogleIdx = header.findIndex(
      (h) => h === "allowgooglelogin" || h === "allowgoogle" || h === "เข้าสู่ระบบgoogle",
    );

    if (nameIdx === -1 || emailIdx === -1 || rolesIdx === -1) {
      throw new Error("หัวตาราง CSV ต้องมีคอลัมน์ Name (ชื่อ), Email (อีเมล), และ Roles (บทบาท)");
    }

    const rows: ParsedUserRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length <= 1 && cols[0] === "") continue;

      const name = cols[nameIdx] || "";
      const email = cols[emailIdx] || "";
      const rolesVal = cols[rolesIdx] || "";
      const googleEmail = googleEmailIdx !== -1 && cols[googleEmailIdx] ? cols[googleEmailIdx] : null;
      const allowGoogleLogin =
        allowGoogleIdx !== -1 && cols[allowGoogleIdx] !== undefined
          ? cols[allowGoogleIdx].toLowerCase() !== "false" && cols[allowGoogleIdx] !== "0"
          : true;

      if (!name || !email) continue;

      rows.push({
        name,
        email,
        roles: rolesVal,
        googleEmail,
        allowGoogleLogin,
      });
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCsvText(text);
        if (parsed.length === 0) {
          setParseError("ไม่พบแถวข้อมูลผู้ใช้งานในไฟล์ CSV");
          setPreviewRows([]);
        } else {
          setPreviewRows(parsed);
        }
      } catch (err: unknown) {
        setParseError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอ่านไฟล์ CSV");
        setPreviewRows([]);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplateCsv = () => {
    const header = ["Name", "Email", "Roles", "Google Email", "Allow Google Login"];
    const sampleRole = roles[0]?.code || "USER";
    const sampleRows = [
      ["ดร.สมชาย ใจดี", "somchai.j@university.ac.th", sampleRole, "somchai@gmail.com", "true"],
      ["นางสาวสมหญิง นามสกุล", "somying.n@university.ac.th", sampleRole, "", "true"],
    ];

    const csvContent =
      "\uFEFF" +
      [header.join(","), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    startExportTransition(async () => {
      const res = await exportUsersCsvAction({
        status: exportStatus,
        roleId: exportRoleId || undefined,
      });

      if (res.ok) {
        const blob = new Blob([res.data.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.data.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t("users.exportBtn") + " สำเร็จ");
      } else {
        toast.error(res.error?.message || t("common.error"));
      }
    });
  };

  const handleStartImport = () => {
    if (previewRows.length === 0) {
      toast.error("ไม่มีข้อมูลที่จะนำเข้า");
      return;
    }

    startImportTransition(async () => {
      const res = await importUsersCsvAction({ users: previewRows });
      if (res.ok) {
        setImportResult(res.data);
        if (res.data.failedCount === 0) {
          toast.success(t("users.importSuccess", { count: res.data.successCount }));
        } else {
          toast.warning(
            t("users.importPartial", {
              success: res.data.successCount,
              failed: res.data.failedCount,
            }),
          );
        }
      } else {
        toast.error(res.error?.message || t("common.error"));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <header className="ph hr">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("users.backToUsers")}</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <span>{t("users.importExportTitle")}</span>
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/40 border w-fit">
          <button
            type="button"
            onClick={() => setTab("import")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "import"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>{t("users.importTab")}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("export")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "export"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>{t("users.exportTab")}</span>
          </button>
        </div>

        {/* Tab 1: Import Users */}
        {tab === "import" && (
          <div className="space-y-6">
            {!canManage ? (
              <LiyonCard>
                <div className="flex items-center gap-3 text-destructive p-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลผู้ใช้งาน</span>
                </div>
              </LiyonCard>
            ) : (
              <>
                <LiyonCard>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div>
                      <h2 className="text-base font-semibold">{t("users.importTab")}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("users.csvFormatNotice")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplateCsv}
                      className="gap-2 shrink-0"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t("users.downloadTemplate")}</span>
                    </Button>
                  </div>

                  {/* Dropzone / Upload Area */}
                  <div className="pt-4 space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-muted/10 transition-colors space-y-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {selectedFile ? selectedFile.name : t("users.uploadCsvPrompt")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          รองรับไฟล์ .csv เข้ารหัสแบบ UTF-8
                        </p>
                      </div>
                    </div>

                    {parseError && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{parseError}</span>
                      </div>
                    )}
                  </div>
                </LiyonCard>

                {/* Preview Table */}
                {previewRows.length > 0 && !importResult && (
                  <LiyonCard>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold">{t("users.csvPreview")}</h3>
                        <p className="text-xs text-muted-foreground">
                          ตรวจพบข้อมูลทั้งหมด {previewRows.length} รายการ
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleStartImport}
                        disabled={isImporting}
                        className="gap-2"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t("users.importing")}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{t("users.startImport")}</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="rounded-lg border overflow-x-auto max-h-[360px]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b font-medium text-muted-foreground sticky top-0">
                          <tr>
                            <th className="p-2.5 w-10">#</th>
                            <th className="p-2.5">Name</th>
                            <th className="p-2.5">Email</th>
                            <th className="p-2.5">Roles</th>
                            <th className="p-2.5">Google Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {previewRows.map((r, i) => (
                            <tr key={i} className="hover:bg-muted/20">
                              <td className="p-2.5 text-muted-foreground font-mono">{i + 1}</td>
                              <td className="p-2.5 font-medium">{r.name}</td>
                              <td className="p-2.5 font-mono">{r.email}</td>
                              <td className="p-2.5">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[11px]">
                                  {r.roles}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-muted-foreground">
                                {r.googleEmail || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </LiyonCard>
                )}

                {/* Import Result Feedback */}
                {importResult && (
                  <LiyonCard>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border">
                        {importResult.failedCount === 0 ? (
                          <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            {importResult.failedCount === 0
                              ? "นำเข้าข้อมูลผู้ใช้งานสำเร็จทั้งหมด"
                              : "การนำเข้าเสร็จสิ้นบางส่วน"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            สำเร็จ {importResult.successCount} คน จากทั้งหมด {importResult.total} คน
                            {importResult.failedCount > 0 && ` (ล้มเหลว ${importResult.failedCount} คน)`}
                          </p>
                        </div>
                      </div>

                      {importResult.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{t("users.importErrorTitle")}</span>
                          </h4>
                          <div className="rounded-lg border border-destructive/20 overflow-hidden text-xs">
                            <table className="w-full text-left">
                              <thead className="bg-destructive/10 text-destructive font-medium border-b border-destructive/20">
                                <tr>
                                  <th className="p-2 w-12">แถว</th>
                                  <th className="p-2">ชื่อ</th>
                                  <th className="p-2">อีเมล</th>
                                  <th className="p-2">สาเหตุที่ไม่สำเร็จ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-destructive/10">
                                {importResult.errors.map((e, idx) => (
                                  <tr key={idx} className="hover:bg-destructive/5">
                                    <td className="p-2 font-mono">{e.row}</td>
                                    <td className="p-2">{e.name}</td>
                                    <td className="p-2 font-mono">{e.email}</td>
                                    <td className="p-2 text-destructive">{e.reason}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end gap-3">
                        <Button asChild variant="outline">
                          <Link href="/users">{t("users.backToUsers")}</Link>
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewRows([]);
                            setImportResult(null);
                          }}
                        >
                          นำเข้าไฟล์อื่นเพิ่มเติม
                        </Button>
                      </div>
                    </div>
                  </LiyonCard>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Export Users */}
        {tab === "export" && (
          <LiyonCard>
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold">{t("users.exportTab")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  เลือกเงื่อนไขในการส่งออกข้อมูลผู้ใช้งานเป็นไฟล์ CSV (รองรับเปิดใน Excel ภาษาไทย)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <LiyonField label={t("users.filterStatus")} htmlFor="export-status">
                  <LiyonSelect
                    id="export-status"
                    value={exportStatus}
                    onChange={(e) =>
                      setExportStatus(e.target.value as "all" | "active" | "inactive")
                    }
                  >
                    <option value="all">{t("common.all")}</option>
                    <option value="active">{t("status.active")}</option>
                    <option value="inactive">{t("status.inactive")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label={t("users.filterRole")} htmlFor="export-role">
                  <LiyonSelect
                    id="export-role"
                    value={exportRoleId}
                    onChange={(e) => setExportRoleId(e.target.value)}
                  >
                    <option value="">{t("common.all")}</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {localizedName(r, locale)}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <span className="text-xs font-semibold block text-foreground">
                      โครงสร้างไฟล์ส่งออก (Export Fields)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Name, Email, Roles, Google Email, Allow Google Login, Status, Last Login At
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="gap-2 shrink-0"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("users.exporting")}</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>{t("users.exportBtn")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </LiyonCard>
        )}
      </div>
    </div>
  );
}

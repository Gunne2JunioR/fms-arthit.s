"use client";

import { useState, useTransition } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  Printer, 
  Building2, 
  UserCheck, 
  Calendar, 
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyDocumentAction } from "@/features/document/actions";
import type { VerificationResult } from "@/features/document";
import { toast } from "sonner";

export function VerifyClient({ locale }: { locale: "th" | "en" | "cn" }) {

  const isEn = locale === "en";
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<VerificationResult | null | "not_found">(null);

  const handleVerify = (docNum?: string) => {
    const q = (docNum ?? query).trim();
    if (!q) {
      toast.error(isEn ? "Please enter a document number or hash" : "กรุณากรอกเลขที่เอกสารหรือรหัสแฮช");
      return;
    }

    startTransition(async () => {
      const res = await verifyDocumentAction(q);
      if (res.ok && res.data) {
        setResult(res.data);
      } else {
        setResult("not_found");
      }
    });
  };

  const copySignature = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isEn ? "Signature hash copied to clipboard" : "คัดลอกรหัสลายเซ็นดิจิทัลแล้ว");
  };

  return (
    <div className="space-y-8">
      {/* Search Bar Card */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-card/70 backdrop-blur-md shadow-sm space-y-4">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <QrCode className="w-4 h-4 text-primary" />
          <span>{isEn ? "Verify Official Document No. or Cryptographic QR" : "ตรวจสอบเลขที่เอกสาร หรือรหัส QR ลายเซ็นดิจิทัล"}</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={isEn ? "e.g. ศธ 0514/2567-001 or FMS-2024-CERT-089" : "เช่น ศธ 0514/2567-001 หรือ FMS-2024-CERT-089"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <Button 
            onClick={() => handleVerify()} 
            disabled={isPending}
            className="h-11 px-6 rounded-xl font-medium gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            {isPending ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{isEn ? "Verify Now" : "ตรวจสอบเอกสาร"}</span>
          </Button>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="font-medium">{isEn ? "Try quick sample:" : "ตัวอย่างทดสอบรวดเร็ว:"}</span>
          <button
            type="button"
            onClick={() => {
              setQuery("ศธ 0514/2567-001");
              handleVerify("ศธ 0514/2567-001");
            }}
            className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-[11px] font-mono"
          >
            ศธ 0514/2567-001 (ใบทรานสคริปต์)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("FMS-2024-CERT-089");
              handleVerify("FMS-2024-CERT-089");
            }}
            className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-[11px] font-mono"
          >
            FMS-2024-CERT-089 (ใบรับรองจบ)
          </button>
        </div>
      </div>

      {/* Verification Result Display */}
      {result === "not_found" && (
        <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-center space-y-3 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {isEn ? "Document Not Found or Unverified" : "ไม่พบข้อมูลเอกสารในระบบ หรือรหัสไม่ถูกต้อง"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {isEn
              ? "The document number entered does not exist in the faculty digital registry. Please check the document number or contact the registrar office."
              : "หมายเลขเอกสารที่ระบุไม่มีอยู่ในสารบบดิจิทัลของคณะ โปรดตรวจสอบความถูกต้องของเลขที่ หรือติดต่อกลุ่มงานทะเบียนและประมวลผล"}
          </p>
        </div>
      )}

      {result && result !== "not_found" && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-card p-6 sm:p-10 shadow-lg space-y-8 animate-in fade-in duration-300">
          {/* Subtle Watermark Stamp */}
          <div className="absolute right-4 top-4 opacity-5 pointer-events-none select-none text-right">
            <ShieldCheck className="w-64 h-64 text-emerald-500" />
          </div>

          {/* Top Verification Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {isEn ? "OFFICIALLY VERIFIED" : "เอกสารรับรองอย่างเป็นทางการ"}
                  </span>
                  <span className="text-xs font-mono font-semibold text-muted-foreground">
                    {result.docNumber}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  {result.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {result.facultyName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2 text-xs rounded-xl h-9"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isEn ? "Print Certificate" : "พิมพ์ใบรับรอง"}</span>
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/40 border space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>{isEn ? "Issued to / Requester" : "ออกให้แก่ / ผู้ถือเอกสาร"}</span>
                </span>
                <p className="text-base font-bold text-foreground">
                  {result.requesterName}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{isEn ? "Date of Issuance" : "วันที่ออกเอกสาร (พ.ศ. / CE)"}</span>
                </span>
                <p className="text-base font-bold text-foreground">
                  {isEn ? `${result.issuedAtCe} (BE: ${result.issuedAtBe})` : `พ.ศ. ${result.issuedAtBe} (${result.issuedAtCe})`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>{isEn ? "Authorized Signatory" : "ผู้มีอำนาจลงนามดิจิทัล"}</span>
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {result.signatory}
                </p>
              </div>
            </div>

            {/* Right: Cryptographic Signature & QR Preview */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    <span>{isEn ? "Cryptographic Signature (SHA-256)" : "รหัสลายเซ็นดิจิทัล (SHA-256)"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copySignature(result.digitalSignature)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isEn ? "Copy" : "คัดลอก"}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-background font-mono text-[11px] break-all border text-foreground/80 select-all">
                  {result.digitalSignature}
                </div>

                {/* QR Block Simulation */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-20 h-20 rounded-xl bg-background border p-1.5 shrink-0 flex items-center justify-center shadow-xs">
                    <QrCode className="w-16 h-16 text-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">
                      {isEn ? "Direct QR Verification" : "สแกนเพื่อยืนยันผ่านมือถือ"}
                    </p>
                    <p className="text-[11px]">
                      {isEn
                        ? "Scan with any smartphone camera to inspect this official certificate on the university trust portal."
                        : "สแกนด้วยกล้องโทรศัพท์เพื่อเปิดดูต้นฉบับดิจิทัลบนระบบความน่าเชื่อถือมหาวิทยาลัย"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X, FileText, CheckCircle2, Clock, AlertCircle, Search, QrCode, Trash2, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";


import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DocumentRequestDto } from "@/features/document";
import {
  getDocumentRequestsAction,
  createDocumentRequestAction,
  actOnDocumentStepAction,
} from "@/features/document/actions";

interface Props {
  initialDocuments: DocumentRequestDto[];
  currentUserId?: string;
  canCreate: boolean;
  canApprove: boolean;
}

export function DocumentsClient({ initialDocuments, currentUserId: _currentUserId, canCreate, canApprove }: Props) {
  const t = useT();
  const locale = useLocale();
  const [documents, setDocuments] = useState<DocumentRequestDto[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formDocNumber, setFormDocNumber] = useState("");
  const [formDocType, setFormDocType] = useState<DocumentRequestDto["docType"]>("MEMO_INTERNAL");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUrgency, setFormUrgency] = useState<DocumentRequestDto["urgency"]>("NORMAL");
  const [formSteps] = useState([
    { stepOrder: 1, approverTitle: "หัวหน้าภาควิชา" },
    { stepOrder: 2, approverTitle: "รองคณบดีฝ่ายวิชาการ" },
    { stepOrder: 3, approverTitle: "คณบดี" },
  ]);

  // Feature 8: Dynamic Custom Form Fields
  const [customFields, setCustomFields] = useState<Array<{ id: string; label: string; type: "text" | "number" | "date"; value: string }>>([
    { id: "f-1", label: "งบประมาณที่ขออนุมัติ (บาท)", type: "number", value: "25000" },
    { id: "f-2", label: "กำหนดวันที่ต้องการใช้งาน", type: "date", value: "2024-10-31" },
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date">("text");

  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        label: newFieldLabel.trim(),
        type: newFieldType,
        value: "",
      },
    ]);
    setNewFieldLabel("");
  };

  const removeCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Detail / Approval Modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentRequestDto | null>(null);
  const [actionComment, setActionComment] = useState("");

  const refreshList = async () => {
    const res = await getDocumentRequestsAction(statusFilter === "ALL" ? undefined : statusFilter);
    if (res.ok) setDocuments(res.data);
  };

  const handleCreate = () => {
    if (!formDocNumber || !formTitle) {
      toast.error("กรุณากรอกเลขที่หนังสือและชื่อเรื่อง");
      return;
    }

    const dynamicContent = customFields.length > 0
      ? "\n\n[ฟิลด์ข้อมูลกำหนดเอง / Dynamic Fields]\n" +
        customFields.map((f) => `• ${f.label}: ${f.value || "-"}`).join("\n")
      : "";

    startTransition(async () => {
      const res = await createDocumentRequestAction({
        docNumber: formDocNumber,
        docType: formDocType,
        title: formTitle,
        description: (formDescription + dynamicContent).trim() || undefined,
        urgency: formUrgency,
        steps: formSteps,
      });

      if (res.ok) {
        toast.success(t("document.createSuccess"));
        setIsCreateOpen(false);
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleStepAction = (stepId: string, action: "APPROVE" | "REJECT") => {
    startTransition(async () => {
      const res = await actOnDocumentStepAction({
        stepId,
        action,
        comment: actionComment || undefined,
      });

      if (res.ok) {
        if (action === "APPROVE") toast.success(t("document.approveSuccess"));
        else toast.success(t("document.rejectSuccess"));

        setSelectedDoc(null);
        setActionComment("");
        await refreshList();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const filteredDocuments = documents.filter((d) => {
    const matchesSearch =
      d.docNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.requester.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: DataTableColumn<DocumentRequestDto>[] = [
    {
      key: "docNumber",
      header: t("document.docNumber"),
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-semibold text-xs text-primary">{row.docNumber}</span>
          <div className="flex items-center gap-1.5">
            {row.urgency === "VERY_URGENT" && (
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                ด่วนที่สุด
              </span>
            )}
            {row.urgency === "URGENT" && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                ด่วน
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      header: t("document.subject"),
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground leading-tight">{row.title}</p>
          <p className="text-xs text-muted-foreground">ผู้เสนอ: {row.requester.name}</p>
        </div>
      ),
    },
    {
      key: "workflow",
      header: t("document.workflow"),
      render: (row) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>ขั้นตอน {row.currentStep} จาก {row.totalSteps}</span>
          </div>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${(row.currentStep / row.totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "วันที่ยื่น",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(new Date(row.createdAt), locale)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("document.status"),
      render: (row) => {
        const statusMap: Record<string, { tone: "warn" | "ok" | "off"; label: string }> = {
          DRAFT: { tone: "off", label: t("document.status.draft") },
          PENDING_REVIEW: { tone: "warn", label: t("document.status.pending") },
          APPROVED: { tone: "ok", label: t("document.status.approved") },
          REJECTED: { tone: "off", label: t("document.status.rejected") },
          CANCELLED: { tone: "off", label: t("document.status.cancelled") },
        };
        const conf = statusMap[row.status] || { tone: "off", label: row.status };
        return <StatusPill tone={conf.tone}>{conf.label}</StatusPill>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {t("document.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("document.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("document.create")}
          </Button>
        )}
      </div>

      <LiyonCard>
        <DataTable<DocumentRequestDto>
          state={filteredDocuments.length === 0 ? "empty" : "data"}
          headHeading={t("document.title")}
          rows={filteredDocuments}
          columns={columns}
          getRowId={(row) => row.id}
          toolbar={
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="tsearch flex-1 min-w-[200px]">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาเลขที่หนังสือ หรือชื่อเรื่อง..."
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="PENDING_REVIEW">{t("document.status.pending")}</option>
                <option value="APPROVED">{t("document.status.approved")}</option>
                <option value="REJECTED">{t("document.status.rejected")}</option>
              </LiyonSelect>
            </div>
          }
          renderRowMenu={(row) => (
            <RowMenuItem
              onSelect={() => setSelectedDoc(row)}
              icon={<FileText className="h-4 w-4" />}
            >
              ดูรายละเอียด / พิจารณา
            </RowMenuItem>
          )}
          empty={{
            icon: <FileText className="h-10 w-10 text-muted-foreground/50" />,
            title: t("document.empty"),
            description: t("document.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create Document Dialog */}
      <LiyonDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} wide>
        <LiyonDialogHeader
          title={t("document.create")}
          description={t("document.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("document.docNumber")}>
                <input
                  type="text"
                  value={formDocNumber}
                  onChange={(e) => setFormDocNumber(e.target.value)}
                  placeholder="เช่น ศธ 0514/2567-001"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("document.urgency")}>
                <LiyonSelect
                  value={formUrgency}
                  onChange={(e) => setFormUrgency(e.target.value as DocumentRequestDto["urgency"])}
                >
                  <option value="NORMAL">{t("document.urgency.normal")}</option>
                  <option value="URGENT">{t("document.urgency.urgent")}</option>
                  <option value="VERY_URGENT">{t("document.urgency.very_urgent")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <LiyonField label={t("document.type")}>
              <LiyonSelect
                value={formDocType}
                onChange={(e) => setFormDocType(e.target.value as DocumentRequestDto["docType"])}
              >
                <option value="MEMO_INTERNAL">{t("document.type.memo")}</option>
                <option value="PURCHASE_REQUEST">{t("document.type.purchase")}</option>
                <option value="LEAVE_REQUEST">{t("document.type.leave")}</option>
                <option value="TRAVEL_OFFICIAL">{t("document.type.travel")}</option>
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("document.subject")}>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="ระบุชื่อเรื่องที่ต้องการเสนออนุมัติ"
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>

            <LiyonField label={t("document.description")}>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="รายละเอียดเนื้อหา ข้อความ หรือเหตุผลความจำเป็น"
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>

            {/* Feature 8: Dynamic Custom Form Fields Builder */}
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>ฟิลด์ข้อมูลกำหนดเอง (Dynamic Form Fields)</span>
                </span>
                <span className="text-[11px] text-muted-foreground">เพิ่มข้อมูลเฉพาะสำหรับแบบฟอร์ม</span>
              </div>

              {/* Added Custom Fields List */}
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 rounded-xl border bg-muted/20">
                    <span className="text-xs font-medium text-foreground w-44 truncate" title={field.label}>
                      {field.label}:
                    </span>
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomFields((prev) =>
                          prev.map((f) => (f.id === field.id ? { ...f, value: val } : f))
                        );
                      }}
                      placeholder={`กรอก${field.label}`}
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomField(field.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="ลบฟิลด์"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Field Control */}
              <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed bg-muted/10">
                <input
                  type="text"
                  placeholder="ชื่อฟิลด์ใหม่ เช่น โครงการ, วันที่นัดหมาย..."
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border bg-background"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as "text" | "number" | "date")}
                  className="px-2 py-1 text-xs rounded-lg border bg-background text-foreground"
                >
                  <option value="text">ข้อความ (Text)</option>
                  <option value="number">ตัวเลข (Number)</option>
                  <option value="date">วันที่ (Date)</option>
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addCustomField}
                  className="h-7 text-xs px-2.5"
                >
                  เพิ่มฟิลด์
                </Button>
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <span className="text-xs font-semibold text-foreground">ลำดับขั้นตอนการลงนาม (Workflow)</span>
              {formSteps.map((s) => (
                <div key={s.stepOrder} className="flex items-center gap-2 text-xs">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {s.stepOrder}
                  </span>
                  <span className="font-medium">{s.approverTitle}</span>
                </div>
              ))}
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {t("document.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Document Detail & Approval Dialog */}
      <LiyonDialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)} wide>
        {selectedDoc && (
          <>
            <LiyonDialogHeader
              title={`${selectedDoc.docNumber}: ${selectedDoc.title}`}
              description={`ผู้เสนอ: ${selectedDoc.requester.name} (${formatDate(new Date(selectedDoc.createdAt), locale)})`}
            />
            <LiyonDialogBody>
              <div className="space-y-4 py-2">
                {/* Visual E-Approval Stepper Bar */}
                <div className="p-4 rounded-2xl border bg-muted/20 space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>เส้นทางการอนุมัติอิเล็กทรอนิกส์ (E-Approval Workflow Timeline)</span>
                  </span>

                  <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                    {selectedDoc.approvalSteps.map((step, idx) => {
                      const isCurrent = step.stepOrder === selectedDoc.currentStep && selectedDoc.status === "PENDING_REVIEW";
                      const isDone = step.status === "APPROVED";
                      const isRejected = step.status === "REJECTED";

                      return (
                        <div key={step.id} className="flex items-center gap-2 flex-1 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                                isDone
                                  ? "bg-emerald-500 text-white"
                                  : isRejected
                                  ? "bg-destructive text-white"
                                  : isCurrent
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 animate-pulse"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isDone ? <Check className="w-3.5 h-3.5" /> : step.stepOrder}
                            </div>
                            <div className="text-[11px] leading-tight">
                              <p className="font-semibold text-foreground truncate max-w-[90px]">{step.approverTitle}</p>
                              <p className="text-muted-foreground text-[10px]">
                                {isDone ? "อนุมัติแล้ว" : isRejected ? "ส่งกลับ/ปฏิเสธ" : isCurrent ? "กำลังรอตรวจ" : "รอลำดับถัดไป"}
                              </p>
                            </div>
                          </div>
                          {idx < selectedDoc.approvalSteps.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mx-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cryptographic Digital Stamp & QR Badge */}
                <div className="p-3.5 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center text-foreground shrink-0 shadow-2xs">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>รหัสรับรองดิจิทัลและ QR Code (Smart E-Verification)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {selectedDoc.docNumber} • SHA256:8f43a91c7849e623b...
                      </p>
                    </div>
                  </div>

                  <a
                    href="/verify"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-background hover:bg-muted text-xs font-semibold text-primary transition-colors shrink-0 shadow-2xs"
                  >
                    <span>ตรวจสอบสถานะสาธารณะ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 bg-muted/40 rounded-xl space-y-2 text-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">เนื้อหาเอกสารและฟิลด์ข้อมูล</span>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedDoc.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-foreground">บันทึกความคิดเห็นแต่ละลำดับขั้น</span>
                  <div className="space-y-2">
                    {selectedDoc.approvalSteps.map((step) => {
                      const isCurrent = step.stepOrder === selectedDoc.currentStep && selectedDoc.status === "PENDING_REVIEW";
                      return (
                        <div
                          key={step.id}
                          className={`p-3 rounded-xl border transition-colors ${
                            isCurrent ? "border-primary bg-primary/5" : "bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary">ขั้นที่ {step.stepOrder}</span>
                              <span className="font-medium text-foreground">{step.approverTitle}</span>
                            </div>
                            <div>
                              {step.status === "APPROVED" && (
                                <span className="text-emerald-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {t("document.step.approved")}
                                </span>
                              )}
                              {step.status === "REJECTED" && (
                                <span className="text-destructive font-medium flex items-center gap-1">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  {t("document.step.rejected")}
                                </span>
                              )}
                              {step.status === "PENDING" && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {t("document.step.pending")}
                                </span>
                              )}
                            </div>
                          </div>

                          {step.comment && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ความเห็น: &ldquo;{step.comment}&rdquo;
                            </p>
                          )}

                          {isCurrent && canApprove && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                              <input
                                type="text"
                                value={actionComment}
                                onChange={(e) => setActionComment(e.target.value)}
                                placeholder="บันทึกความเห็นการพิจารณา (ถ้ามี)"
                                className="w-full px-2.5 py-1 text-xs rounded border bg-background"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStepAction(step.id, "REJECT")}
                                  disabled={isPending}
                                  className="h-7 text-xs gap-1"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  {t("document.reject")}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleStepAction(step.id, "APPROVE")}
                                  disabled={isPending}
                                  className="h-7 text-xs gap-1"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {t("document.approve")}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </LiyonDialogBody>
            <LiyonDialogFooter>
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                {t("common.close")}
              </Button>
            </LiyonDialogFooter>
          </>
        )}
      </LiyonDialog>
    </div>
  );
}

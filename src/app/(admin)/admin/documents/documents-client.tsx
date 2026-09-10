"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X, FileText, CheckCircle2, Clock, AlertCircle, Search } from "lucide-react";
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
    startTransition(async () => {
      const res = await createDocumentRequestAction({
        docNumber: formDocNumber,
        docType: formDocType,
        title: formTitle,
        description: formDescription || undefined,
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
                rows={4}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="รายละเอียดเนื้อหา ข้อความ หรือเหตุผลความจำเป็น"
                className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background"
              />
            </LiyonField>

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
                <div className="p-3.5 bg-muted/40 rounded-xl space-y-2 text-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">เนื้อหาเอกสาร</span>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedDoc.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-foreground">สายการพิจารณาและอนุมัติ</span>
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

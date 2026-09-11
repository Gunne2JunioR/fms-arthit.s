import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, DocumentStatus, DocumentType, DocumentUrgency } from "@/generated/prisma";
import type { CreateDocumentRequestInput, ActOnStepInput } from "./validations";

export interface ApprovalStepDto {
  id: string;
  documentRequestId: string;
  stepOrder: number;
  approverTitle: string;
  approverUserId: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comment: string | null;
  actedAt: Date | null;
  approverUser?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export interface DocumentRequestDto {
  id: string;
  tenantId: string;
  docNumber: string;
  requesterId: string;
  docType: DocumentType;
  title: string;
  description: string | null;
  urgency: DocumentUrgency;
  attachmentUrls: string[];
  currentStep: number;
  totalSteps: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  requester: {
    id: string;
    email: string;
    name: string;
  };
  approvalSteps: ApprovalStepDto[];
}

function mapDocumentRequest(doc: {
  id: string;
  tenantId: string;
  docNumber: string;
  requesterId: string;
  docType: DocumentType;
  title: string;
  description: string | null;
  urgency: DocumentUrgency;
  attachmentUrls: unknown;
  currentStep: number;
  totalSteps: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  requester: { id: string; email: string; name: string };
  approvalSteps: ApprovalStepDto[];
}): DocumentRequestDto {
  const urls = Array.isArray(doc.attachmentUrls)
    ? doc.attachmentUrls.filter((u): u is string => typeof u === "string")
    : [];
  return {
    ...doc,
    attachmentUrls: urls,
  };
}

export async function listDocumentRequests(tenantId: string, status?: string): Promise<DocumentRequestDto[]> {
  const list = await prisma.documentRequest.findMany({
    where: {
      tenantId,
      ...(status ? { status: status as DocumentStatus } : {}),
    },
    include: {
      requester: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      approvalSteps: {
        orderBy: { stepOrder: "asc" },
        include: {
          approverUser: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return list.map(mapDocumentRequest);
}

export async function getDocumentRequestById(tenantId: string, id: string): Promise<DocumentRequestDto | null> {
  const doc = await prisma.documentRequest.findFirst({
    where: { id, tenantId },
    include: {
      requester: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      approvalSteps: {
        orderBy: { stepOrder: "asc" },
        include: {
          approverUser: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  });
  return doc ? mapDocumentRequest(doc) : null;
}

export async function createDocumentRequest(
  tenantId: string,
  requesterId: string,
  input: CreateDocumentRequestInput
): Promise<DocumentRequestDto> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const doc = await tx.documentRequest.create({
      data: {
        tenantId,
        requesterId,
        docNumber: input.docNumber,
        docType: input.docType,
        title: input.title,
        description: input.description || null,
        urgency: input.urgency,
        currentStep: 1,
        totalSteps: input.steps.length,
        status: "PENDING_REVIEW",
      },
    });

    for (const step of input.steps) {
      await tx.documentApprovalStep.create({
        data: {
          documentRequestId: doc.id,
          stepOrder: step.stepOrder,
          approverTitle: step.approverTitle,
          approverUserId: step.approverUserId || null,
          status: "PENDING",
        },
      });
    }

    const created = await tx.documentRequest.findUniqueOrThrow({
      where: { id: doc.id },
      include: {
        requester: { select: { id: true, email: true, name: true } },
        approvalSteps: {
          orderBy: { stepOrder: "asc" },
          include: { approverUser: { select: { id: true, email: true, name: true } } },
        },
      },
    });
    return mapDocumentRequest(created);
  });
}

export async function actOnDocumentStep(
  tenantId: string,
  actorUserId: string,
  input: ActOnStepInput
): Promise<DocumentRequestDto> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const step = await tx.documentApprovalStep.findUniqueOrThrow({
      where: { id: input.stepId },
      include: { documentRequest: true },
    });

    if (step.documentRequest.tenantId !== tenantId) {
      throw new Error("UNAUTHORIZED_TENANT");
    }

    const doc = step.documentRequest;
    if (doc.status !== "PENDING_REVIEW") {
      throw new Error("DOCUMENT_NOT_IN_REVIEW");
    }

    const isApprove = input.action === "APPROVE";
    const nextStepStatus = isApprove ? "APPROVED" : "REJECTED";

    await tx.documentApprovalStep.update({
      where: { id: step.id },
      data: {
        status: nextStepStatus,
        approverUserId: actorUserId,
        comment: input.comment || null,
        actedAt: new Date(),
      },
    });

    if (!isApprove) {
      const res = await tx.documentRequest.update({
        where: { id: doc.id },
        data: { status: "REJECTED" },
        include: {
          requester: { select: { id: true, email: true, name: true } },
          approvalSteps: {
            orderBy: { stepOrder: "asc" },
            include: { approverUser: { select: { id: true, email: true, name: true } } },
          },
        },
      });
      return mapDocumentRequest(res);
    }

    if (step.stepOrder >= doc.totalSteps) {
      const res = await tx.documentRequest.update({
        where: { id: doc.id },
        data: { status: "APPROVED" },
        include: {
          requester: { select: { id: true, email: true, name: true } },
          approvalSteps: {
            orderBy: { stepOrder: "asc" },
            include: { approverUser: { select: { id: true, email: true, name: true } } },
          },
        },
      });
      return mapDocumentRequest(res);
    } else {
      const res = await tx.documentRequest.update({
        where: { id: doc.id },
        data: { currentStep: step.stepOrder + 1 },
        include: {
          requester: { select: { id: true, email: true, name: true } },
          approvalSteps: {
            orderBy: { stepOrder: "asc" },
            include: { approverUser: { select: { id: true, email: true, name: true } } },
          },
        },
      });
      return mapDocumentRequest(res);
    }
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { writeAudit } from "@/features/identity/server";
import { DOCUMENT_P } from "../permissions";
import { createDocumentRequestSchema, actOnStepSchema } from "./validations";
import * as services from "./services";
import type { DocumentRequestDto } from "./services";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function getDocumentRequestsAction(status?: string): Promise<ActionResult<DocumentRequestDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentRead);
    return services.listDocumentRequests(ctx.tenantId, status);
  });
}

export async function createDocumentRequestAction(input: unknown): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentCreate);
    const parsed = createDocumentRequestSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const created = await services.createDocumentRequest(ctx.tenantId, ctx.userId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "document.create",
      entity: "document_request",
      entityId: created.id,
      after: created,
      ip,
    });
    revalidatePath("/admin/documents");
    return created;
  });
}

export async function actOnDocumentStepAction(input: unknown): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentApprove);
    const parsed = actOnStepSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const updated = await services.actOnDocumentStep(ctx.tenantId, ctx.userId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: parsed.action === "APPROVE" ? "document.approve_step" : "document.reject_step",
      entity: "document_request",
      entityId: updated.id,
      after: updated,
      ip,
    });
    revalidatePath("/admin/documents");
    return updated;
  });
}

export async function verifyDocumentAction(query: string): Promise<ActionResult<services.VerificationResult | null>> {
  return runAction(async () => {
    return services.verifyDocumentRecord(query);
  });
}


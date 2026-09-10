import { requirePermission, hasPermission } from "@/features/identity/server";
import { DOCUMENT_P } from "@/features/document";
import { listDocumentRequests } from "@/features/document/server";
import { DocumentsClient } from "./documents-client";

export default async function AdminDocumentsPage() {
  const ctx = await requirePermission(DOCUMENT_P.documentRead);
  const documents = await listDocumentRequests(ctx.tenantId);
  const canCreate = hasPermission(ctx, DOCUMENT_P.documentCreate);
  const canApprove = hasPermission(ctx, DOCUMENT_P.documentApprove);

  return (
    <DocumentsClient
      initialDocuments={documents}
      currentUserId={ctx.userId}
      canCreate={canCreate}
      canApprove={canApprove}
    />
  );
}

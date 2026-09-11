import { resolveTenantSettings } from "@/features/identity/server";
import { AdminShellClient } from "./_components/admin-shell-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tenantSettings = await resolveTenantSettings().catch(() => null);

  return (
    <AdminShellClient brandLogoUrl={tenantSettings?.logoUrl}>
      {children}
    </AdminShellClient>
  );
}

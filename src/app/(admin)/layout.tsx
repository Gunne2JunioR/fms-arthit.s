import { resolveTenantSettings } from "@/features/identity/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { AdminShellClient } from "./_components/admin-shell-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [tenantSettings, locale] = await Promise.all([
    resolveTenantSettings().catch(() => null),
    getLocale().catch(() => "th"),
  ]);

  const brandName = tenantSettings ? (locale === "en" ? tenantSettings.nameEn : tenantSettings.nameTh) : null;

  return (
    <AdminShellClient brandName={brandName} brandLogoUrl={tenantSettings?.logoUrl}>
      {children}
    </AdminShellClient>
  );
}

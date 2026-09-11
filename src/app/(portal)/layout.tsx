import { auth, resolveTenantSettings } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { GraduationCap } from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [t, session, tenantSettings] = await Promise.all([
    getT(),
    auth().catch(() => null),
    resolveTenantSettings().catch(() => null),
  ]);

  const locale = (session?.locale as "th" | "en") || "th";
  const orgName = tenantSettings ? (locale === "en" ? tenantSettings.nameEn : tenantSettings.nameTh) : t("portal.facultyTitle");

  const navLinks = [
    { href: "/", label: t("portal.home") },
    { href: "/news", label: t("portal.news") },
    { href: "/programs", label: t("portal.programs") },
    { href: "/personnel", label: t("portal.personnel") },
    { href: "/#contact", label: t("portal.contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar with Responsive Mobile Menu */}
      <PortalHeader
        facultyTitle={orgName}
        facultyTagline={t("portal.facultyTagline")}
        navLinks={navLinks}
        adminConsoleLabel={t("portal.adminConsole")}
        loginLabel={t("portal.login")}
        isLoggedIn={Boolean(session?.user)}
        logoUrl={tenantSettings?.logoUrl}
      />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 text-sm text-muted-foreground">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-foreground text-base">
                {orgName}
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed">
              {t("portal.facultyTagline")}
            </p>
            <p className="text-xs text-muted-foreground pt-4">
              © {new Date().getFullYear()} {orgName}. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">{t("portal.programs")}</h4>
            <ul className="space-y-2 text-xs">
              <li>{t("portal.footerProg1")}</li>
              <li>{t("portal.footerProg2")}</li>
              <li>{t("portal.footerProg3")}</li>
              <li>{t("portal.footerProg4")}</li>
            </ul>
          </div>

          <div id="contact">
            <h4 className="font-semibold text-foreground mb-3 text-sm">{t("portal.contact")}</h4>
            <div className="space-y-2 text-xs">
              <p>{t("portal.footerAddress")}</p>
              <p>{t("portal.footerPhone")}</p>
              <p>{t("portal.footerEmail")}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

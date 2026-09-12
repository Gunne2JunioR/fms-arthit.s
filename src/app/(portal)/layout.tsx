import { auth, resolveTenantSettings, hasPermission, P } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalFooter } from "@/components/portal/portal-footer";

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
    { href: "/calendar", label: t("portal.calendar") },
    { href: "/verify", label: t("portal.verify") },
    { href: "/personnel", label: t("portal.personnel") },
    { href: "/#contact", label: t("portal.contact") },
  ];

  const quickLinks = [
    { href: "/", label: t("portal.home") },
    { href: "/news", label: t("portal.news") },
    { href: "/programs", label: t("portal.programs") },
    { href: "/calendar", label: t("portal.calendar") },
    { href: "/verify", label: t("portal.verify") },
    { href: "/personnel", label: t("portal.personnel") },
  ];

  const programs = [
    { href: "/programs", label: t("portal.footerProg1") },
    { href: "/programs", label: t("portal.footerProg2") },
    { href: "/programs", label: t("portal.footerProg3") },
    { href: "/programs", label: t("portal.footerProg4") },
  ];

  const canManageSettings = Boolean(
    session?.user && hasPermission({ roles: session.roles ?? [], permissions: session.permissions ?? [], isSuperAdmin: session.isSuperAdmin ?? false }, P.settingsManage)
  );

  const portalUser = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar with Responsive Mobile Menu */}
      <PortalHeader
        facultyTitle={orgName}
        facultyTagline={t("portal.facultyTagline")}
        navLinks={navLinks}
        adminConsoleLabel={t("portal.adminConsole")}
        loginLabel={t("portal.login")}
        user={portalUser}
        logoUrl={tenantSettings?.logoUrl}
        themeToggleLabel={t("nav.themeToggle")}
        profileLabel={t("account.profile")}
        settingsLabel={t("nav.settings")}
        logoutLabel={t("account.logout")}
        canManageSettings={canManageSettings}
      />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {(() => {
        const contact = tenantSettings?.contact;
        const address = (locale === "en" ? (contact?.addressEn || contact?.addressTh) : (contact?.addressTh || contact?.addressEn)) || t("portal.footerAddress");
        const phone = contact?.phone || t("portal.footerPhone");
        const email = contact?.email || t("portal.footerEmail");
        const hours = (locale === "en" ? (contact?.officeHoursEn || contact?.officeHoursTh) : (contact?.officeHoursTh || contact?.officeHoursEn)) || t("portal.footerHours");

        return (
          <PortalFooter
            orgName={orgName}
            tagline={t("portal.facultyTagline")}
            logoUrl={tenantSettings?.logoUrl}
            programsLabel={t("portal.programs")}
            contactLabel={t("portal.contact")}
            quickLinksLabel={t("portal.footerQuickLinks")}
            hoursLabel={hours}
            privacyLabel={t("portal.footerPrivacy")}
            termsLabel={t("portal.footerTerms")}
            rightsLabel={t("portal.footerRights")}
            addressText={address}
            phoneText={phone}
            emailText={email}
            mapUrl={contact?.mapUrl}
            facebookUrl={contact?.facebookUrl}
            websiteUrl={contact?.websiteUrl}
            programs={programs}
            quickLinks={quickLinks}
          />
        );
      })()}
    </div>
  );
}


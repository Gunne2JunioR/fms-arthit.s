import Link from "next/link";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { listPublishedArticles } from "@/features/news/server";
import { resolveTenantSettings } from "@/features/identity/server";
import { ArrowRight, Calendar, Eye, Pin, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalHero } from "@/components/portal/portal-hero";

export default async function PortalHomePage() {
  const [t, locale, tenantSettings] = await Promise.all([
    getT(),
    getLocale(),
    resolveTenantSettings().catch(() => null),
  ]);
  const [featuredArticles, latestArticles] = await Promise.all([
    listPublishedArticles(undefined, { onlyPinned: true, limit: 2 }),
    listPublishedArticles(undefined, { limit: 6 }),
  ]);

  const contact = tenantSettings?.contact;
  const heroAddress =
    (locale === "en" ? (contact?.addressEn || contact?.addressTh) : (contact?.addressTh || contact?.addressEn)) ||
    t("portal.heroAddress");
  const heroPhone = contact?.phone || t("portal.heroPhone");

  return (
    <div className="space-y-16 pb-20">
      {/* Clean Modern Creative Hero Section */}
      <PortalHero
        facultyTitle={t("portal.facultyTitle")}
        heroTitle1={t("portal.heroTitle1")}
        heroTitle2={t("portal.heroTitle2")}
        heroDesc={t("portal.heroDesc")}
        scriptTag={t("portal.heroScriptTag")}
        getStartedLabel={t("portal.getStarted")}
        exploreProgramsLabel={t("portal.explorePrograms")}
        allNewsLabel={t("portal.allNews")}
        badgeNewLabel={t("portal.heroBadgeNew")}
        liveStatusLabel={t("portal.heroLiveStatus")}
        gradSuccessLabel={t("portal.heroGradSuccess")}
        chipAiLabel={t("portal.heroChipAi")}
        chipBizLabel={t("portal.heroChipBiz")}
        chipCloudLabel={t("portal.heroChipCloud")}
        heroCallLabel={t("portal.heroCallLabel")}
        heroPhone={heroPhone}
        heroAddress={heroAddress}
        metrics={{
          bachelorCount: "4",
          bachelorLabel: t("portal.metric.bachelor"),
          studentsCount: "1,200+",
          studentsLabel: t("portal.metric.students"),
          facultyCount: "50+",
          facultyLabel: t("portal.metric.faculty"),
          employmentRate: "95%",
          employmentLabel: t("portal.metric.employment"),
        }}
      />

      {/* Featured / Pinned News Section */}
      {featuredArticles.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Pin className="h-4 w-4" />
                <span>{t("portal.featuredNews")}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {t("portal.featuredTitle")}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-lg transition-all"
              >
                {article.coverImageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                      {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
                    </div>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {article.viewCount} {t("news.viewsField")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 flex items-center text-sm font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{t("portal.readMore")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest News Grid */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-primary">{t("portal.latestNews")}</span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("portal.latestNewsTitle")}
            </h2>
          </div>
          <Button asChild variant="ghost" className="gap-2 self-start sm:self-auto">
            <Link href="/news">
              <span>{t("portal.allNews")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {latestArticles.length === 0 ? (
          <div className="text-center py-16 border rounded-xl bg-muted/20">
            <p className="text-sm text-muted-foreground">{t("news.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {article.coverImageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-xs text-foreground text-xs font-medium px-2 py-0.5 rounded shadow-xs">
                      {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {article.viewCount}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-primary inline-flex items-center gap-1 pt-1">
                    {t("portal.readMore")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Services Banner */}
      <section className="container mx-auto px-4">
        <div className="rounded-2xl bg-muted/40 border p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground">{t("portal.ctaTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("portal.ctaDesc")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/personnel">
                <Users className="h-4 w-4 mr-2" />
                <span>{t("portal.personnel")}</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/programs">
                <Award className="h-4 w-4 mr-2" />
                <span>{t("portal.programs")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

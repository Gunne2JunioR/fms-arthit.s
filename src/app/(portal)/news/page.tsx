import Link from "next/link";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { listPublishedArticles, listCategories } from "@/features/news/server";
import { Calendar, Eye, Search, Newspaper, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function PublicNewsPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  const [categories, articles] = await Promise.all([
    listCategories(),
    listPublishedArticles(undefined, {
      categoryId: category,
      search: q,
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("portal.home")}</span>
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t("portal.news")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          {t("portal.newsSubtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/news"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !category
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-background border hover:bg-muted text-foreground"
            }`}
          >
            {t("portal.filterCategory")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/news?category=${c.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === c.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-background border hover:bg-muted text-foreground"
              }`}
            >
              {locale === "en" ? c.nameEn : c.nameTh}
            </Link>
          ))}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/news" className="relative w-full sm:w-72">
          {category && <input type="hidden" name="category" value={category} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("portal.searchNewsPh")}
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-muted/10 space-y-3">
          <Newspaper className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">{t("news.empty")}</h3>
          <p className="text-xs text-muted-foreground">{t("portal.noNewsMatch")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all"
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
                      <Calendar className="h-3 w-3" />
                      {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.viewCount}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium text-primary inline-flex items-center gap-1 pt-2">
                  {t("portal.readMore")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

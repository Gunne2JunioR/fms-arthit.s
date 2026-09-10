import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getArticleBySlug } from "@/features/news/server";
import { Calendar, Eye, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const [t, locale] = await Promise.all([getT(), getLocale()]);

  const article = await getArticleBySlug(slug, undefined, true);
  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      {/* Back Button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4" />
            <span>{t("portal.backToNews")}</span>
          </Link>
        </Button>
      </div>

      {/* Header Info */}
      <div className="space-y-4 border-b pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-primary/10 text-primary font-semibold text-xs px-3 py-1 rounded-full">
            {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : ""}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {article.viewCount} {t("news.viewsField")}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {article.authorName}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed font-light">
            {article.excerpt}
          </p>
        )}
      </div>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Body Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground text-base sm:text-lg leading-relaxed space-y-4 py-4 whitespace-pre-line">
        {article.content}
      </div>

      {/* Footer / Back */}
      <div className="border-t pt-8 flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>{t("portal.backToNews")}</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}

import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listAdminArticles, listCategories } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function NewsAdminPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const [initialArticles, categories] = await Promise.all([
    listAdminArticles(ctx.tenantId),
    listCategories(ctx.tenantId),
  ]);

  return (
    <NewsClient
      initialArticles={initialArticles}
      categories={categories}
      canCreate={hasPermission(ctx, NEWS_P.newsCreate)}
      canEdit={hasPermission(ctx, NEWS_P.newsEdit)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
      canDelete={hasPermission(ctx, NEWS_P.newsDelete)}
    />
  );
}

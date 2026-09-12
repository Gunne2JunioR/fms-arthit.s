"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  Archive,
  Pin,
  Search,
  Newspaper,
  Eye,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ArticleDto, ArticleCategoryDto } from "@/features/news";
import {
  getAdminArticlesAction,
  createArticleAction,
  updateArticleAction,
  changeArticleStatusAction,
  deleteArticleAction,
  translateArticleWithGeminiAction,
} from "@/features/news/actions";

interface Props {
  initialArticles: ArticleDto[];
  categories: ArticleCategoryDto[];
  canCreate: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

export function NewsClient({
  initialArticles,
  categories,
  canCreate,
  canEdit,
  canPublish,
  canDelete,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [articles, setArticles] = useState<ArticleDto[]>(initialArticles);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ArticleDto | null>(null);
  const [editingItem, setEditingItem] = useState<ArticleDto | null>(null);
  const [currentTab, setCurrentTab] = useState<"th" | "en">("th");
  const [isTranslating, setIsTranslating] = useState(false);

  // Form states (Thai)
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id ?? "");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formPublishedAt, setFormPublishedAt] = useState("");

  // Form states (English)
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formExcerptEn, setFormExcerptEn] = useState("");
  const [formContentEn, setFormContentEn] = useState("");

  const refreshArticles = async () => {
    const res = await getAdminArticlesAction({
      categoryId: selectedCategory || undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      search: searchInput.trim() || undefined,
    });
    if (res.ok) {
      setArticles(res.data);
    }
  };

  const handleFilterSearch = () => {
    startTransition(async () => {
      await refreshArticles();
    });
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setCurrentTab("th");
    setFormTitle("");
    setFormTitleEn("");
    setFormSlug("");
    setFormCategoryId(categories[0]?.id ?? "");
    setFormExcerpt("");
    setFormExcerptEn("");
    setFormContent("");
    setFormContentEn("");
    setFormCoverImageUrl("");
    setFormStatus("DRAFT");
    setFormIsPinned(false);
    setFormPublishedAt(new Date().toISOString().slice(0, 16));
    setModalOpen(true);
  };

  const openEditDialog = (item: ArticleDto) => {
    setEditingItem(item);
    setCurrentTab("th");
    setFormTitle(item.title);
    setFormTitleEn(item.titleEn ?? "");
    setFormSlug(item.slug);
    setFormCategoryId(item.categoryId);
    setFormExcerpt(item.excerpt ?? "");
    setFormExcerptEn(item.excerptEn ?? "");
    setFormContent(item.content);
    setFormContentEn(item.contentEn ?? "");
    setFormCoverImageUrl(item.coverImageUrl ?? "");
    setFormStatus(item.status);
    setFormIsPinned(item.isPinned);
    setFormPublishedAt(
      item.publishedAt
        ? new Date(item.publishedAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    );
    setModalOpen(true);
  };

  const handleTranslateWithGemini = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("กรุณากรอกหัวข้อข่าวและเนื้อหาภาษาไทยก่อนดำเนินการแปลด้วย AI");
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateArticleWithGeminiAction({
        titleTh: formTitle.trim(),
        excerptTh: formExcerpt.trim() || undefined,
        contentTh: formContent.trim(),
      });

      if (res.ok) {
        setFormTitleEn(res.data.titleEn);
        setFormExcerptEn(res.data.excerptEn);
        setFormContentEn(res.data.contentEn);
        setCurrentTab("en");
        toast.success(t("news.aiTranslateSuccess"));
      } else {
        const msg = res.error?.message || t("news.aiTranslateMissingKey");
        toast.error(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast.error(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast.error(t("error.validation"));
      return;
    }
    if (!formCategoryId) {
      toast.error(t("error.validation"));
      return;
    }
    if (!formContent.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    startTransition(async () => {
      if (editingItem) {
        const res = await updateArticleAction({
          id: editingItem.id,
          title: formTitle.trim(),
          titleEn: formTitleEn.trim() || undefined,
          slug: formSlug.trim() || undefined,
          categoryId: formCategoryId,
          excerpt: formExcerpt.trim() || undefined,
          excerptEn: formExcerptEn.trim() || undefined,
          content: formContent.trim(),
          contentEn: formContentEn.trim() || undefined,
          coverImageUrl: formCoverImageUrl.trim() || undefined,
          status: formStatus,
          isPinned: formIsPinned,
          publishedAt: formPublishedAt ? new Date(formPublishedAt).toISOString() : undefined,
        });
        if (res.ok) {
          toast.success(t("news.updateSuccess"));
          setModalOpen(false);
          await refreshArticles();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createArticleAction({
          title: formTitle.trim(),
          titleEn: formTitleEn.trim() || undefined,
          slug: formSlug.trim() || undefined,
          categoryId: formCategoryId,
          excerpt: formExcerpt.trim() || undefined,
          excerptEn: formExcerptEn.trim() || undefined,
          content: formContent.trim(),
          contentEn: formContentEn.trim() || undefined,
          coverImageUrl: formCoverImageUrl.trim() || undefined,
          status: formStatus,
          isPinned: formIsPinned,
          publishedAt: formPublishedAt ? new Date(formPublishedAt).toISOString() : undefined,
        });
        if (res.ok) {
          toast.success(t("news.createSuccess"));
          setModalOpen(false);
          await refreshArticles();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleStatusChange = (item: ArticleDto, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    startTransition(async () => {
      const res = await changeArticleStatusAction({ id: item.id, status });
      if (res.ok) {
        toast.success(
          status === "PUBLISHED" ? t("news.publishSuccess") : t("news.unpublishSuccess"),
        );
        await refreshArticles();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  const handleDelete = (item: ArticleDto) => {
    startTransition(async () => {
      const res = await deleteArticleAction(item.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshArticles();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  const columns: DataTableColumn<ArticleDto>[] = [
    {
      key: "title",
      header: t("news.titleField"),
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-md">
          <div className="flex items-center gap-2">
            {row.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <Pin className="h-3 w-3" />
                {t("news.pinnedField")}
              </span>
            )}
            <span className="font-medium text-foreground line-clamp-2">
              {locale === "en" && row.titleEn ? row.titleEn : row.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">/news/{row.slug}</span>
            {row.titleEn && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                EN
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.categoryField"),
      render: (row) => (
        <span className="text-sm">
          {locale === "en" ? row.categoryNameEn : row.categoryNameTh}
        </span>
      ),
    },
    {
      key: "status",
      header: t("news.statusField"),
      render: (row) => {
        const tone = row.status === "PUBLISHED" ? "ok" : row.status === "DRAFT" ? "warn" : "off";
        const labelKey = `news.status.${row.status.toLowerCase()}`;
        return <StatusPill tone={tone}>{t(labelKey)}</StatusPill>;
      },
    },
    {
      key: "views",
      header: t("news.viewsField"),
      className: "nowrap text-xs text-muted-foreground",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{row.viewCount}</span>
        </div>
      ),
    },
    {
      key: "publishedAt",
      header: t("news.publishedAtField"),
      className: "nowrap text-muted-foreground text-xs",
      render: (row) => (
        <span>
          {row.publishedAt ? formatDate(new Date(row.publishedAt), locale) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("news.create")}
          </Button>
        )}
      </div>

      <LiyonCard>
        <DataTable<ArticleDto>
          state={articles.length === 0 ? "empty" : "data"}
          headHeading={t("news.title")}
          rows={articles}
          columns={columns}
          getRowId={(row) => row.id}
          toolbar={
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="tsearch flex-1 min-w-[200px]">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFilterSearch()}
                  placeholder={t("portal.searchNewsPh")}
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  startTransition(async () => {
                    const res = await getAdminArticlesAction({
                      categoryId: e.target.value || undefined,
                      status: selectedStatus === "all" ? undefined : selectedStatus,
                      search: searchInput.trim() || undefined,
                    });
                    if (res.ok) setArticles(res.data);
                  });
                }}
              >
                <option value="">{t("portal.filterCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === "en" ? c.nameEn : c.nameTh}
                  </option>
                ))}
              </LiyonSelect>
              <LiyonSelect
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  startTransition(async () => {
                    const res = await getAdminArticlesAction({
                      categoryId: selectedCategory || undefined,
                      status: e.target.value === "all" ? undefined : e.target.value,
                      search: searchInput.trim() || undefined,
                    });
                    if (res.ok) setArticles(res.data);
                  });
                }}
              >
                <option value="all">{t("common.all")}</option>
                <option value="PUBLISHED">{t("news.status.published")}</option>
                <option value="DRAFT">{t("news.status.draft")}</option>
                <option value="ARCHIVED">{t("news.status.archived")}</option>
              </LiyonSelect>
            </div>
          }
          renderRowMenu={
            canEdit || canPublish || canDelete
              ? (row) => (
                  <>
                    {canPublish && row.status !== "PUBLISHED" && (
                      <RowMenuItem
                        onSelect={() => handleStatusChange(row, "PUBLISHED")}
                        icon={<Globe className="h-4 w-4 text-emerald-600" />}
                      >
                        {t("news.publish")}
                      </RowMenuItem>
                    )}
                    {canPublish && row.status === "PUBLISHED" && (
                      <RowMenuItem
                        onSelect={() => handleStatusChange(row, "DRAFT")}
                        icon={<Archive className="h-4 w-4 text-amber-600" />}
                      >
                        {t("news.unpublish")}
                      </RowMenuItem>
                    )}
                    {canEdit && (
                      <RowMenuItem
                        onSelect={() => openEditDialog(row)}
                        icon={<Pencil className="h-4 w-4" />}
                      >
                        {t("news.edit")}
                      </RowMenuItem>
                    )}
                    {canDelete && (
                      <RowMenuItem
                        onSelect={() => setDeleteConfirmItem(row)}
                        danger
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        {t("news.delete")}
                      </RowMenuItem>
                    )}
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Newspaper className="h-10 w-10 text-muted-foreground/50" />,
            title: t("news.empty"),
            description: t("news.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Dialog สร้าง/แก้ไขข่าว */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen} wide>
        <LiyonDialogHeader
          title={editingItem ? t("news.edit") : t("news.create")}
          description={t("news.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            {/* Action Bar with Language Tabs & Gemini AI Translate Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-background border">
                <button
                  type="button"
                  onClick={() => setCurrentTab("th")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    currentTab === "th"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>🇹🇭</span>
                  <span>{t("news.tabTh")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab("en")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    currentTab === "en"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>{t("news.tabEn")}</span>
                  {formTitleEn && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  )}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isTranslating || !formTitle.trim()}
                onClick={handleTranslateWithGemini}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary shrink-0"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t("news.aiTranslating")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                    <span>{t("news.aiTranslateBtn")}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Common Category and Status Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("news.categoryField")} htmlFor="article-category">
                <LiyonSelect
                  id="article-category"
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === "en" ? c.nameEn : c.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("news.statusField")} htmlFor="article-status">
                <LiyonSelect
                  id="article-status"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                  }
                >
                  <option value="DRAFT">{t("news.status.draft")}</option>
                  <option value="PUBLISHED">{t("news.status.published")}</option>
                  <option value="ARCHIVED">{t("news.status.archived")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            {/* Language Content Tabs */}
            {currentTab === "th" ? (
              <div className="space-y-4 rounded-xl border p-4 bg-muted/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <span>🇹🇭</span>
                  <span>{t("news.tabTh")}</span>
                </div>

                <LiyonField label={t("news.titleFieldTh")} htmlFor="article-title">
                  <input
                    id="article-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="เช่น คณะเปิดตัวโครงการนวัตกรรมเทคโนโลยีเพื่อชุมชน"
                    required
                  />
                </LiyonField>

                <LiyonField label={t("news.excerptFieldTh")} htmlFor="article-excerpt">
                  <textarea
                    id="article-excerpt"
                    rows={2}
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="สรุปย่อสั้น ๆ 1-2 บรรทัด สำหรับแสดงผลบนการ์ดข่าว..."
                    className="w-full rounded-md border p-2 text-sm bg-transparent"
                  />
                </LiyonField>

                <LiyonField label={t("news.contentFieldTh")} htmlFor="article-content">
                  <textarea
                    id="article-content"
                    rows={8}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="เนื้อหาข่าวแบบละเอียด รองรับการจัดย่อหน้าและข้อความ..."
                    required
                    className="w-full rounded-md border p-2 text-sm bg-transparent font-sans"
                  />
                </LiyonField>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border p-4 bg-muted/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <span>🇬🇧</span>
                    <span>{t("news.tabEn")}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    แปลอัตโนมัติด้วย Google Gemini หรือปรับแต่งเองได้
                  </span>
                </div>

                <LiyonField label={t("news.titleFieldEn")} htmlFor="article-title-en">
                  <input
                    id="article-title-en"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. Faculty Launches Community Technology Innovation Project"
                  />
                </LiyonField>

                <LiyonField label={t("news.excerptFieldEn")} htmlFor="article-excerpt-en">
                  <textarea
                    id="article-excerpt-en"
                    rows={2}
                    value={formExcerptEn}
                    onChange={(e) => setFormExcerptEn(e.target.value)}
                    placeholder="Brief 1-2 sentence summary for article card preview..."
                    className="w-full rounded-md border p-2 text-sm bg-transparent"
                  />
                </LiyonField>

                <LiyonField label={t("news.contentFieldEn")} htmlFor="article-content-en">
                  <textarea
                    id="article-content-en"
                    rows={8}
                    value={formContentEn}
                    onChange={(e) => setFormContentEn(e.target.value)}
                    placeholder="Full article content in English..."
                    className="w-full rounded-md border p-2 text-sm bg-transparent font-sans"
                  />
                </LiyonField>
              </div>
            )}

            {/* Common Image and Publishing Details */}
            <LiyonField label={t("news.coverImageField")} htmlFor="article-cover">
              <input
                id="article-cover"
                value={formCoverImageUrl}
                onChange={(e) => setFormCoverImageUrl(e.target.value)}
                placeholder="https://example.com/images/cover.jpg"
              />
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
              <LiyonField label={t("news.publishedAtField")} htmlFor="article-publishedAt">
                <input
                  id="article-publishedAt"
                  type="datetime-local"
                  value={formPublishedAt}
                  onChange={(e) => setFormPublishedAt(e.target.value)}
                />
              </LiyonField>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="article-pinned"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="article-pinned" className="text-sm font-medium cursor-pointer">
                  {t("news.pinnedField")}
                </label>
              </div>
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isPending}>
            {t("news.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {t("news.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog ยืนยันการลบข่าว */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogHeader
          title={t("news.delete")}
          description={t("news.deleteConfirm")}
        />
        <LiyonDialogBody>
          <p className="text-sm font-medium text-foreground">
            {deleteConfirmItem?.title}
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("news.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem)}
            disabled={isPending}
          >
            {t("news.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

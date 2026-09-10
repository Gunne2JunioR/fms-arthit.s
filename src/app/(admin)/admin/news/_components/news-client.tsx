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

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id ?? "");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formPublishedAt, setFormPublishedAt] = useState("");

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
    setFormTitle("");
    setFormSlug("");
    setFormCategoryId(categories[0]?.id ?? "");
    setFormExcerpt("");
    setFormContent("");
    setFormCoverImageUrl("");
    setFormStatus("DRAFT");
    setFormIsPinned(false);
    setFormPublishedAt(new Date().toISOString().slice(0, 16));
    setModalOpen(true);
  };

  const openEditDialog = (item: ArticleDto) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormCategoryId(item.categoryId);
    setFormExcerpt(item.excerpt ?? "");
    setFormContent(item.content);
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
          slug: formSlug.trim() || undefined,
          categoryId: formCategoryId,
          excerpt: formExcerpt.trim() || undefined,
          content: formContent.trim(),
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
          slug: formSlug.trim() || undefined,
          categoryId: formCategoryId,
          excerpt: formExcerpt.trim() || undefined,
          content: formContent.trim(),
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
            <span className="font-medium text-foreground line-clamp-2">{row.title}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">/news/{row.slug}</span>
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
            <LiyonField label={t("news.titleField")} htmlFor="article-title">
              <input
                id="article-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น คณะเปิดตัวโครงการนวัตกรรมเทคโนโลยีเพื่อชุมชน"
                required
              />
            </LiyonField>

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

            <LiyonField label={t("news.coverImageField")} htmlFor="article-cover">
              <input
                id="article-cover"
                value={formCoverImageUrl}
                onChange={(e) => setFormCoverImageUrl(e.target.value)}
                placeholder="https://example.com/images/cover.jpg"
              />
            </LiyonField>

            <LiyonField label={t("news.excerptField")} htmlFor="article-excerpt">
              <textarea
                id="article-excerpt"
                rows={2}
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                placeholder="สรุปย่อสั้น ๆ 1-2 บรรทัด สำหรับแสดงผลบนการ์ดข่าว..."
                className="w-full rounded-md border p-2 text-sm bg-transparent"
              />
            </LiyonField>

            <LiyonField label={t("news.contentField")} htmlFor="article-content">
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

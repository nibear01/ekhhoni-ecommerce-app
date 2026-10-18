import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, ImageUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminPageHeader, Panel, RowsSkeleton } from "@/components/admin/AdminBits";
import { FormField } from "@/components/FormField";
import { ProductCard } from "@/components/ProductCard";
import { QueryError } from "@/components/QueryError";
import { useAdminProducts, useImageUpload, useSaveProduct } from "@/hooks/use-admin";
import { useI18n } from "@/i18n/i18n-context";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
// letters (any script, incl. Bangla vowel signs), digits and single dashes
const SLUG = /^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u;

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** /admin/products/new and /admin/products/:id */
export function AdminProductForm() {
  const { id } = useParams();
  const { t } = useI18n();
  const products = useAdminProducts();

  if (products.isPending) {
    return (
      <Panel>
        <RowsSkeleton rows={3} />
      </Panel>
    );
  }
  if (products.isError) {
    return <QueryError message={t("admin.loadError")} onRetry={() => products.refetch()} />;
  }

  const product = id ? products.data.find((p) => p.id === id) : null;
  if (id && !product) {
    return (
      <>
        <BackLink />
        <QueryError message={t("admin.productMissing")} />
      </>
    );
  }

  const categories = [...new Set(products.data.map((p) => p.category))].sort((a, b) => a.localeCompare(b));
  // keyed so the form state resets when switching between products
  return <ProductForm key={id ?? "new"} product={product} categories={categories} />;
}

function BackLink() {
  const { t } = useI18n();
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4">
      <Link to="/admin/products">
        <ArrowLeft />
        {t("admin.backToProducts")}
      </Link>
    </Button>
  );
}

function ProductForm({ product, categories }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const save = useSaveProduct();
  const upload = useImageUpload();
  const fileInput = useRef(null);
  const isNew = !product;

  const [form, setForm] = useState(() => ({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category: product?.category ?? "",
    description: product?.description ?? "",
    price: product ? String(Math.round(product.priceCents / 100)) : "",
    active: product?.active ?? true,
    imageUrl: product?.imageUrl ?? null,
    imageKitFileId: product?.imageKitFileId ?? null,
  }));
  // the slug follows the name until the admin edits it by hand
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_BYTES) {
      toast.error(t("admin.fileTooBig"));
      return;
    }
    setProgress(0);
    try {
      const { url, fileId } = await upload(file, setProgress);
      set({ imageUrl: url, imageKitFileId: fileId });
    } catch {
      toast.error(t("admin.uploadFailed"));
    } finally {
      setProgress(null);
    }
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "admin.errName";
    if (!SLUG.test(form.slug)) e.slug = "admin.errSlug";
    if (!form.category.trim()) e.category = "admin.errCategory";
    if (!/^\d+$/.test(form.price.trim()) || Number(form.price) <= 0) e.price = "admin.errPrice";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      slug: form.slug,
      category: form.category.trim(),
      description: form.description.trim(),
      priceCents: Number(form.price) * 100,
      currency: "bdt",
      active: form.active,
      imageUrl: form.imageUrl ?? "",
      imageKitFileId: form.imageKitFileId ?? "",
    };

    save.mutate(
      { id: product?.id, data },
      {
        onSuccess: () => {
          toast.success(t(isNew ? "admin.created" : "admin.saved"));
          navigate("/admin/products");
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) setErrors({ slug: "admin.errSlugTaken" });
          else toast.error(t("admin.errSave"));
        },
      },
    );
  }

  const err = (field) => (errors[field] ? t(errors[field]) : undefined);
  const priceTaka = /^\d+$/.test(form.price) ? Number(form.price) : 0;

  return (
    <>
      <BackLink />
      <AdminPageHeader title={t(isNew ? "admin.newProduct" : "admin.editProduct")} />

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={t("admin.sectionDetails")}>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <FormField label={t("admin.fieldName")} error={err("name")} className="sm:col-span-2">
                <input
                  className="text-input"
                  value={form.name}
                  onChange={(e) =>
                    set({ name: e.target.value, ...(!slugTouched && { slug: slugify(e.target.value) }) })
                  }
                />
              </FormField>
              <FormField
                label={t("admin.fieldSlug")}
                hint={t("admin.fieldSlugHint", { slug: form.slug || "…" })}
                error={err("slug")}
              >
                <input
                  className="text-input font-mono text-sm"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set({ slug: slugify(e.target.value) });
                  }}
                />
              </FormField>
              <FormField label={t("admin.fieldCategory")} hint={t("admin.fieldCategoryHint")} error={err("category")}>
                <input
                  className="text-input"
                  list="admin-categories"
                  value={form.category}
                  onChange={(e) => set({ category: e.target.value })}
                />
              </FormField>
              <datalist id="admin-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <FormField
                label={t("admin.fieldDescription")}
                hint={t("admin.fieldDescriptionHint")}
                className="sm:col-span-2"
              >
                <textarea
                  className="text-input min-h-36 resize-y"
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                />
              </FormField>
            </div>
          </Panel>

          <Panel title={t("admin.sectionPhoto")}>
            <div className="p-5">
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {form.imageUrl ? (
                <div className="flex flex-wrap items-end gap-4">
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="aspect-4/5 w-40 rounded-2xl bg-kantha object-cover"
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={progress !== null}>
                      <ImageUp />
                      {t("admin.replacePhoto")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => set({ imageUrl: null, imageKitFileId: null })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                      {t("admin.removePhoto")}
                    </Button>
                  </div>
                  {progress !== null && <UploadProgress pct={progress} />}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  disabled={progress !== null}
                  className={cn(
                    "flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stitch bg-kantha/50 px-6 py-10 text-center transition-colors hover:border-primary hover:bg-accent",
                    dragging && "border-primary bg-accent",
                  )}
                >
                  {progress !== null ? (
                    <UploadProgress pct={progress} />
                  ) : (
                    <>
                      <ImageUp className="size-8 text-primary" aria-hidden />
                      <span className="font-semibold">{t("admin.uploadPhoto")}</span>
                      <span className="text-sm text-muted-foreground">{t("admin.uploadHint")}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </Panel>

          <Panel title={t("admin.sectionPricing")}>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <FormField label={t("admin.fieldPrice")} hint={t("admin.fieldPriceHint")} error={err("price")}>
                <input
                  className="text-input"
                  inputMode="numeric"
                  lang="en"
                  value={form.price}
                  onChange={(e) => set({ price: e.target.value.replace(/[^\d]/g, "") })}
                />
              </FormField>
              <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                <Switch
                  id="product-active"
                  checked={form.active}
                  onCheckedChange={(active) => set({ active })}
                  className="mt-0.5"
                />
                <label htmlFor="product-active" className="cursor-pointer">
                  <span className="block font-semibold">{t("admin.fieldActive")}</span>
                  <span className="block text-[13px] text-muted-foreground">{t("admin.fieldActiveHint")}</span>
                </label>
              </div>
            </div>
          </Panel>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={save.isPending || progress !== null}>
              {save.isPending && <Loader2 className="animate-spin" />}
              {save.isPending ? t("admin.saving") : t(isNew ? "admin.create" : "admin.save")}
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/admin/products">{t("admin.backToProducts")}</Link>
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">{t("admin.preview")}</p>
          {/* inert: the card is only a picture of the storefront tile */}
          <div inert className="max-w-[300px]">
            <ProductCard
              product={{
                id: "preview",
                slug: form.slug || "preview",
                name: form.name || t("admin.fieldName"),
                category: form.category || t("admin.fieldCategory"),
                priceCents: priceTaka * 100,
                imageUrl: form.imageUrl,
                createdAt: product?.createdAt ?? new Date().toISOString(),
              }}
            />
          </div>
          {!form.active && <p className="mt-3 text-sm text-muted-foreground">{t("admin.hidden")}</p>}
        </aside>
      </form>
    </>
  );
}

function UploadProgress({ pct }) {
  const { t } = useI18n();
  return (
    <div className="flex w-full max-w-xs flex-col gap-2" role="status">
      <span className="text-sm font-semibold">{t("admin.uploading", { pct })}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-border">
        <span className="block h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

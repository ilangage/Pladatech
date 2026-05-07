"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryList } from "@/data/categories";
import type { ProductRow } from "@/lib/product-catalog";
import type { ProductWritePayload } from "@/lib/admin-products";

type Pair = { name: string; value: string };
type Chip = { label: string; value: string };

type FormState = {
  title: string;
  slug: string;
  brand: string;
  category: string;
  price: string;
  compare_at_price: string;
  rating: string;
  review_count: string;
  stock: string;
  badge: string;
  image_url: string;
  image_alt: string;
  gallery_images: string[];
  short_description: string;
  overview: string;
  features: string[];
  whats_included: string[];
  why_customers_love_it: string[];
  specs: Pair[];
  tags: string[];
  feature_chips: Chip[];
  related_product_slugs: string[];
  collection_slugs: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  sort_order: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function textArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item : "")).filter(Boolean);
}

function pairArray(value: unknown): Pair[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const name = typeof entry.name === "string" ? entry.name : typeof entry.label === "string" ? entry.label : "";
      const valueText = typeof entry.value === "string" ? entry.value : "";
      if (!name || !valueText) return null;
      return { name, value: valueText };
    })
    .filter(Boolean) as Pair[];
}

function chipsArray(value: unknown): Chip[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const label = typeof entry.label === "string" ? entry.label : "";
      const valueText = typeof entry.value === "string" ? entry.value : "";
      if (!label || !valueText) return null;
      return { label, value: valueText };
    })
    .filter(Boolean) as Chip[];
}

function arrayToInputs(items: string[]) {
  return items.length > 0 ? items : [""];
}

function rowToState(product?: ProductRow | null): FormState {
  return {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    brand: product?.brand ?? "Pladatech",
    category: product?.category ?? "Smart Cleaning",
    price: String(product?.price ?? ""),
    compare_at_price: String(product?.compare_at_price ?? ""),
    rating: String(product?.rating ?? 0),
    review_count: String(product?.review_count ?? 0),
    stock: String(product?.stock ?? 0),
    badge: product?.badge ?? "",
    image_url: product?.image_url ?? "",
    image_alt: product?.image_alt ?? "",
    gallery_images: arrayToInputs(textArray(product?.gallery_images)),
    short_description: product?.short_description ?? "",
    overview: product?.overview ?? "",
    features: arrayToInputs(textArray(product?.features)),
    whats_included: arrayToInputs(textArray(product?.whats_included)),
    why_customers_love_it: arrayToInputs(textArray(product?.why_customers_love_it)),
    specs: pairArray(product?.specs).length > 0 ? pairArray(product?.specs) : [{ name: "", value: "" }],
    tags: arrayToInputs(textArray(product?.tags)),
    feature_chips: chipsArray(product?.feature_chips).length > 0 ? chipsArray(product?.feature_chips) : [{ label: "", value: "" }],
    related_product_slugs: arrayToInputs(textArray(product?.related_product_slugs)),
    collection_slugs: arrayToInputs(textArray(product?.collection_slugs)),
    is_featured: Boolean(product?.is_featured),
    is_best_seller: Boolean(product?.is_best_seller),
    is_active: product?.is_active ?? true,
    sort_order: String(product?.sort_order ?? 0),
  };
}

function toPayload(state: FormState): ProductWritePayload {
  return {
    title: state.title.trim(),
    slug: state.slug.trim(),
    brand: state.brand.trim() || "Pladatech",
    category: state.category,
    price: Number(state.price),
    compare_at_price: state.compare_at_price ? Number(state.compare_at_price) : null,
    rating: Number(state.rating || 0),
    review_count: Number(state.review_count || 0),
    stock: Number(state.stock || 0),
    badge: state.badge.trim() || null,
    image_url: state.image_url.trim() || null,
    image_alt: state.image_alt.trim() || null,
    gallery_images: Array.from(new Set([state.image_url.trim(), ...state.gallery_images.map((item) => item.trim())].filter(Boolean))),
    short_description: state.short_description.trim() || null,
    overview: state.overview.trim() || null,
    features: state.features.map((item) => item.trim()).filter(Boolean),
    whats_included: state.whats_included.map((item) => item.trim()).filter(Boolean),
    why_customers_love_it: state.why_customers_love_it.map((item) => item.trim()).filter(Boolean),
    specs: state.specs.map((item) => ({ name: item.name.trim(), value: item.value.trim() })).filter((item) => item.name && item.value),
    tags: state.tags.map((item) => item.trim()).filter(Boolean),
    feature_chips: state.feature_chips.map((item) => ({ label: item.label.trim(), value: item.value.trim() })).filter((item) => item.label && item.value),
    related_product_slugs: state.related_product_slugs.map((item) => item.trim()).filter(Boolean),
    collection_slugs: state.collection_slugs.map((item) => item.trim()).filter(Boolean),
    is_featured: state.is_featured,
    is_best_seller: state.is_best_seller,
    is_active: state.is_active,
    sort_order: Number(state.sort_order || 0),
  };
}

function ListEditor({
  label,
  items,
  setItems,
  placeholder,
}: {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="admin-field-group">
      <div className="admin-group-header">
        <label>{label}</label>
        <button type="button" className="admin-link" onClick={() => setItems([...items, ""])}>
          Add
        </button>
      </div>
      <div className="admin-repeat-list">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="admin-repeat-row">
            <input
              className="admin-input"
              value={item}
              placeholder={placeholder}
              onChange={(event) => setItems(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))}
            />
            <button type="button" className="admin-button admin-button-secondary" onClick={() => setItems(items.filter((_, currentIndex) => currentIndex !== index))}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PairEditor({
  label,
  items,
  setItems,
  leftPlaceholder,
  rightPlaceholder,
}: {
  label: string;
  items: Pair[];
  setItems: (items: Pair[]) => void;
  leftPlaceholder: string;
  rightPlaceholder: string;
}) {
  return (
    <div className="admin-field-group">
      <div className="admin-group-header">
        <label>{label}</label>
        <button type="button" className="admin-link" onClick={() => setItems([...items, { name: "", value: "" }])}>
          Add
        </button>
      </div>
      <div className="admin-repeat-list">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="admin-repeat-row admin-repeat-row-two">
            <input
              className="admin-input"
              value={item.name}
              placeholder={leftPlaceholder}
              onChange={(event) => setItems(items.map((current, currentIndex) => (currentIndex === index ? { ...current, name: event.target.value } : current)))}
            />
            <input
              className="admin-input"
              value={item.value}
              placeholder={rightPlaceholder}
              onChange={(event) => setItems(items.map((current, currentIndex) => (currentIndex === index ? { ...current, value: event.target.value } : current)))}
            />
            <button type="button" className="admin-button admin-button-secondary" onClick={() => setItems(items.filter((_, currentIndex) => currentIndex !== index))}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChipEditor({
  label,
  items,
  setItems,
}: {
  label: string;
  items: Chip[];
  setItems: (items: Chip[]) => void;
}) {
  return (
    <div className="admin-field-group">
      <div className="admin-group-header">
        <label>{label}</label>
        <button type="button" className="admin-link" onClick={() => setItems([...items, { label: "", value: "" }])}>
          Add
        </button>
      </div>
      <div className="admin-repeat-list">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="admin-repeat-row admin-repeat-row-two">
            <input
              className="admin-input"
              value={item.label}
              placeholder="Label"
              onChange={(event) => setItems(items.map((current, currentIndex) => (currentIndex === index ? { ...current, label: event.target.value } : current)))}
            />
            <input
              className="admin-input"
              value={item.value}
              placeholder="Value"
              onChange={(event) => setItems(items.map((current, currentIndex) => (currentIndex === index ? { ...current, value: event.target.value } : current)))}
            />
            <button type="button" className="admin-button admin-button-secondary" onClick={() => setItems(items.filter((_, currentIndex) => currentIndex !== index))}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminProductForm({
  mode,
  initialProduct,
  saveLabel,
}: {
  mode: "create" | "edit";
  initialProduct?: ProductRow | null;
  saveLabel: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => rowToState(initialProduct ?? null));
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProduct?.slug));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const productId = initialProduct?.id ?? "";
  const title = mode === "create" ? "New product" : "Edit product";
  const autoSlug = useMemo(() => slugify(state.title), [state.title]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = toPayload(state);
    if (!payload.title || !payload.slug || !payload.category || Number.isNaN(payload.price)) {
      setError("Title, slug, category and price are required.");
      setSaving(false);
      return;
    }

    const response = await fetch(mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Save failed");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>{title}</h1>
          <p>Use the same content model as the public storefront.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-grid-two">
          <label className="admin-field">
            <span>Title</span>
            <input
              className="admin-input"
              required
              value={state.title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                updateField("title", nextTitle);
                if (!slugTouched) updateField("slug", slugify(nextTitle));
              }}
            />
          </label>
          <label className="admin-field">
            <span>Slug</span>
            <input
              className="admin-input"
              required
              value={state.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
            />
          </label>
        </div>

        <div className="admin-grid-two">
          <label className="admin-field">
            <span>Brand</span>
            <input className="admin-input" value={state.brand} onChange={(event) => updateField("brand", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Category</span>
            <select className="admin-input" value={state.category} onChange={(event) => updateField("category", event.target.value)}>
              {categoryList.map((item) => (
                <option key={item.slug} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-grid-four">
          <label className="admin-field">
            <span>Price</span>
            <input className="admin-input" type="number" required value={state.price} onChange={(event) => updateField("price", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Compare at price</span>
            <input className="admin-input" type="number" value={state.compare_at_price} onChange={(event) => updateField("compare_at_price", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Rating</span>
            <input className="admin-input" type="number" step="0.1" value={state.rating} onChange={(event) => updateField("rating", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Review count</span>
            <input className="admin-input" type="number" value={state.review_count} onChange={(event) => updateField("review_count", event.target.value)} />
          </label>
        </div>

        <div className="admin-grid-four">
          <label className="admin-field">
            <span>Stock</span>
            <input className="admin-input" type="number" value={state.stock} onChange={(event) => updateField("stock", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Badge</span>
            <input className="admin-input" value={state.badge} onChange={(event) => updateField("badge", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Sort order</span>
            <input className="admin-input" type="number" value={state.sort_order} onChange={(event) => updateField("sort_order", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Image alt</span>
            <input className="admin-input" value={state.image_alt} onChange={(event) => updateField("image_alt", event.target.value)} />
          </label>
        </div>

        <label className="admin-field">
          <span>Image URL</span>
          <input className="admin-input" value={state.image_url} onChange={(event) => updateField("image_url", event.target.value)} />
        </label>

        <ListEditor label="Gallery image URLs" items={state.gallery_images} setItems={(items) => updateField("gallery_images", items)} placeholder="https://example.com/product-angle.jpg" />

        <label className="admin-field">
          <span>Short description</span>
          <textarea className="admin-input admin-textarea" rows={3} value={state.short_description} onChange={(event) => updateField("short_description", event.target.value)} />
        </label>

        <label className="admin-field">
          <span>Overview</span>
          <textarea className="admin-input admin-textarea" rows={5} value={state.overview} onChange={(event) => updateField("overview", event.target.value)} />
        </label>

        <ListEditor label="Features" items={state.features} setItems={(items) => updateField("features", items)} placeholder="Feature text" />
        <ListEditor label="What's included" items={state.whats_included} setItems={(items) => updateField("whats_included", items)} placeholder="Included item" />
        <ListEditor label="Why customers love it" items={state.why_customers_love_it} setItems={(items) => updateField("why_customers_love_it", items)} placeholder="Benefit text" />
        <PairEditor label="Specs" items={state.specs} setItems={(items) => updateField("specs", items)} leftPlaceholder="Name" rightPlaceholder="Value" />
        <ChipEditor label="Feature chips" items={state.feature_chips} setItems={(items) => updateField("feature_chips", items)} />
        <ListEditor label="Tags" items={state.tags} setItems={(items) => updateField("tags", items)} placeholder="Tag" />
        <ListEditor label="Related product slugs" items={state.related_product_slugs} setItems={(items) => updateField("related_product_slugs", items)} placeholder="related-slug" />
        <ListEditor label="Collection slugs" items={state.collection_slugs} setItems={(items) => updateField("collection_slugs", items)} placeholder="collection-slug" />

        <div className="admin-checks">
          <label><input type="checkbox" checked={state.is_featured} onChange={(event) => updateField("is_featured", event.target.checked)} /> Featured</label>
          <label><input type="checkbox" checked={state.is_best_seller} onChange={(event) => updateField("is_best_seller", event.target.checked)} /> Best seller</label>
          <label><input type="checkbox" checked={state.is_active} onChange={(event) => updateField("is_active", event.target.checked)} /> Active</label>
        </div>

        {error ? <div className="admin-alert">{error}</div> : null}

        <div className="admin-form-actions">
          <button type="button" className="admin-button admin-button-secondary" onClick={() => router.push("/admin/products")}>Cancel</button>
          <button type="submit" className="admin-button" disabled={saving}>
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
        <p className="admin-muted">Auto slug preview: {state.slug || autoSlug}</p>
      </form>
    </section>
  );
}

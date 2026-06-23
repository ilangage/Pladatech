"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getWholesaleCategory,
  normalizeWholesaleCategory,
  wholesaleCategoryOptions,
} from "@/data/wholesale-categories";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import type { WholesaleFaq, WholesalePriceTier, WholesaleSpecification } from "@/data/wholesale-types";
import type { WholesaleProductRow } from "@/lib/admin-wholesale-products";

type FormState = {
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  imagePublicId: string;
  galleryPublicIds: string[];
  colors: string[];
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  moq: string;
  retailPrice: string;
  suggestedSellPrice: string;
  priceTiers: Array<{ label: string; minQty: string; maxQty: string; unitPrice: string }>;
  profitNote: string;
  specifications: WholesaleSpecification[];
  dealTag: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  tags: string[];
  packageContents: string[];
  deliveryEstimate: string;
  deliveryNote: string;
  codAvailable: boolean;
  singleItemAvailable: boolean;
  returnNote: string;
  warrantyNote: string;
  marketingAssetsAvailable: boolean;
  videoPublicIds: string[];
  faqs: WholesaleFaq[];
  dimensions: string;
  weight: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
  sortOrder: string;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function strings(value: unknown) {
  return Array.isArray(value) && value.length ? value.map((item) => String(item)) : [""];
}

function tiers(value: WholesalePriceTier[] | null | undefined): FormState["priceTiers"] {
  if (!value?.length) {
    return [
      { label: "1–5 pcs", minQty: "1", maxQty: "4", unitPrice: "" },
      { label: "5–15 pcs", minQty: "5", maxQty: "14", unitPrice: "" },
      { label: "15–99 pcs", minQty: "15", maxQty: "99", unitPrice: "" },
      { label: "100+ pcs", minQty: "100", maxQty: "", unitPrice: "" },
    ];
  }
  return value.map((tier) => ({ label: tier.label, minQty: String(tier.minQty), maxQty: tier.maxQty == null ? "" : String(tier.maxQty), unitPrice: String(tier.unitPrice) }));
}

function initialState(product?: WholesaleProductRow): FormState {
  const category = normalizeWholesaleCategory(product?.category ?? "kitchen-dining");
  const categoryConfig = getWholesaleCategory(category);
  const subcategory = product?.subcategory && categoryConfig.subcategories?.some((item) => item.value === product.subcategory)
    ? product.subcategory
    : categoryConfig.subcategories?.[0]?.value ?? "";

  return {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    category,
    subcategory,
    shortDescription: product?.short_description ?? "",
    imagePublicId: product?.image_public_id ?? "",
    galleryPublicIds: strings(product?.gallery_public_ids),
    colors: strings(product?.colors),
    stockStatus: product?.stock_status ?? "in_stock",
    moq: String(product?.moq ?? 1),
    retailPrice: product?.retail_price == null ? "" : String(product.retail_price),
    suggestedSellPrice: product?.suggested_sell_price == null ? "" : String(product.suggested_sell_price),
    priceTiers: tiers(product?.price_tiers),
    profitNote: product?.profit_note ?? "",
    specifications: product?.specifications?.length ? product.specifications : [{ label: "", value: "" }],
    dealTag: product?.deal_tag ?? "",
    isFeatured: product?.is_featured ?? false,
    isNewArrival: product?.is_new_arrival ?? false,
    tags: strings(product?.tags),
    packageContents: strings(product?.package_contents),
    deliveryEstimate: product?.delivery_estimate ?? "",
    deliveryNote: product?.delivery_note ?? "",
    codAvailable: product?.cod_available ?? true,
    singleItemAvailable: product?.single_item_available ?? true,
    returnNote: product?.return_note ?? "",
    warrantyNote: product?.warranty_note ?? "",
    marketingAssetsAvailable: product?.marketing_assets_available ?? false,
    videoPublicIds: strings(product?.video_public_ids),
    faqs: product?.faqs?.length ? product.faqs : [{ question: "", answer: "" }],
    dimensions: product?.dimensions ?? "",
    weight: product?.weight ?? "",
    seoTitle: product?.seo_title ?? "",
    seoDescription: product?.seo_description ?? "",
    isActive: product?.is_active ?? true,
    sortOrder: String(product?.sort_order ?? 0),
  };
}

function PublicIdList({ label, items, setItems, placeholder }: { label: string; items: string[]; setItems: (items: string[]) => void; placeholder: string }) {
  return (
    <div className="admin-field-group">
      <div className="admin-group-header"><label>{label}</label><button className="admin-button admin-button-secondary" type="button" onClick={() => setItems([...items, ""])}>Add row</button></div>
      <div className="admin-repeat-list">
        {items.map((item, index) => (
          <div className="admin-repeat-row" key={index}>
            <input className="admin-input" value={item} placeholder={placeholder} onChange={(event) => setItems(items.map((entry, itemIndex) => itemIndex === index ? event.target.value : entry))} />
            <button className="admin-button admin-button-secondary" type="button" onClick={() => setItems(items.length === 1 ? [""] : items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryPreview({ publicIds, cloudinaryCloudName }: { publicIds: string[]; cloudinaryCloudName: string }) {
  const ids = publicIds.map((item) => item.trim()).filter(Boolean);
  if (!ids.length) return null;

  return (
    <div className="admin-gallery-preview" aria-label="Gallery image previews">
      {ids.map((publicId) => (
        <img
          key={publicId}
          src={getCloudinaryImageUrl(publicId, { cloudName: cloudinaryCloudName, width: 220 })}
          alt={`Preview for ${publicId}`}
        />
      ))}
    </div>
  );
}

export default function AdminWholesaleProductForm({ mode, product, cloudinaryCloudName }: { mode: "create" | "edit"; product?: WholesaleProductRow; cloudinaryCloudName: string }) {
  const router = useRouter();
  const [state, setState] = useState(() => initialState(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedCategory = getWholesaleCategory(state.category);
  const selectedSubcategories = selectedCategory.subcategories ?? [];
  const previewUrl = state.imagePublicId.trim() ? getCloudinaryImageUrl(state.imagePublicId, { cloudName: cloudinaryCloudName, width: 600 }) : "";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function updateTier(index: number, field: keyof FormState["priceTiers"][number], value: string) {
    update("priceTiers", state.priceTiers.map((tier, tierIndex) => tierIndex === index ? { ...tier, [field]: value } : tier));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: state.title,
      slug: state.slug,
      category: state.category,
      subcategory: state.subcategory || null,
      short_description: state.shortDescription,
      image_public_id: state.imagePublicId,
      gallery_public_ids: state.galleryPublicIds,
      colors: state.colors,
      stock_status: state.stockStatus,
      moq: state.moq,
      retail_price: state.retailPrice,
      suggested_sell_price: state.suggestedSellPrice,
      price_tiers: state.priceTiers,
      profit_note: state.profitNote,
      specifications: state.specifications,
      deal_tag: state.dealTag,
      is_featured: state.isFeatured,
      is_new_arrival: state.isNewArrival,
      tags: state.tags,
      package_contents: state.packageContents,
      delivery_estimate: state.deliveryEstimate,
      delivery_note: state.deliveryNote,
      cod_available: state.codAvailable,
      single_item_available: state.singleItemAvailable,
      return_note: state.returnNote,
      warranty_note: state.warrantyNote,
      marketing_assets_available: state.marketingAssetsAvailable,
      video_public_ids: state.videoPublicIds,
      faqs: state.faqs,
      dimensions: state.dimensions,
      weight: state.weight,
      seo_title: state.seoTitle,
      seo_description: state.seoDescription,
      is_active: state.isActive,
      sort_order: state.sortOrder,
    };

    try {
      const endpoint = mode === "create" ? "/api/admin/wholesale-products" : `/api/admin/wholesale-products/${product?.id}`;
      const response = await fetch(endpoint, { method: mode === "create" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Wholesale product could not be saved.");
      router.push("/admin/wholesale-products");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Wholesale product could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div><h1>{mode === "create" ? "Add Wholesale Product" : "Edit Wholesale Product"}</h1><p>Cloudinary fields accept public IDs only, never complete URLs.</p></div>
        <Link href="/admin/wholesale-products" className="admin-button admin-button-secondary">Back to list</Link>
      </div>

      {!cloudinaryCloudName ? <div className="admin-alert admin-alert-warning">CLOUDINARY_CLOUD_NAME is not configured. Preview uses the Cloudinary demo fallback.</div> : null}
      {error ? <div className="admin-alert">{error}</div> : null}

      <form className="admin-form" onSubmit={submit}>
        <div className="admin-section-label">Basic details</div>
        <div className="admin-grid-two">
          <label className="admin-field"><span>Title *</span><input className="admin-input" required value={state.title} onChange={(event) => { update("title", event.target.value); if (!slugTouched) update("slug", slugify(event.target.value)); }} /></label>
          <label className="admin-field"><span>Slug *</span><input className="admin-input" required value={state.slug} onChange={(event) => { setSlugTouched(true); update("slug", slugify(event.target.value)); }} /></label>
        </div>

        <div className="admin-grid-four">
          <label className="admin-field">
            <span>Category *</span>
            <select
              className="admin-input"
              value={state.category}
              onChange={(event) => {
                const nextCategory = event.target.value;
                const nextSubcategory = getWholesaleCategory(nextCategory).subcategories?.[0]?.value ?? "";
                setState((current) => ({ ...current, category: nextCategory, subcategory: nextSubcategory }));
              }}
            >
              {wholesaleCategoryOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span>Subcategory</span>
            <select
              className="admin-input"
              value={state.subcategory}
              onChange={(event) => update("subcategory", event.target.value)}
              disabled={!selectedSubcategories.length}
            >
              {selectedSubcategories.length ? selectedSubcategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>) : <option value="">No subcategory</option>}
            </select>
          </label>
          <label className="admin-field"><span>Stock status *</span><select className="admin-input" value={state.stockStatus} onChange={(event) => update("stockStatus", event.target.value as FormState["stockStatus"])}><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label>
          <label className="admin-field"><span>MOQ *</span><input className="admin-input" type="number" min="1" step="1" required value={state.moq} onChange={(event) => update("moq", event.target.value)} /></label>
          <label className="admin-field"><span>Sort order</span><input className="admin-input" type="number" step="1" value={state.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} /></label>
        </div>

        <label className="admin-field"><span>Short description</span><textarea className="admin-textarea" rows={3} value={state.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} /></label>

        <div className="admin-section-label">Images & gallery</div>
        <div className="admin-grid-two">
          <label className="admin-field"><span>Main image public ID</span><input className="admin-input" placeholder="wholesale/coffee-frother/main" value={state.imagePublicId} onChange={(event) => update("imagePublicId", event.target.value)} /><small className="admin-muted">Do not paste a Cloudinary URL.</small></label>
          <div className="admin-wholesale-preview">{previewUrl ? <img src={previewUrl} alt="Cloudinary preview" /> : <span>Enter a public ID to preview the image.</span>}</div>
        </div>

        <PublicIdList label="Gallery public IDs" items={state.galleryPublicIds} setItems={(items) => update("galleryPublicIds", items)} placeholder="wholesale/product/1" />
        <GalleryPreview publicIds={state.galleryPublicIds} cloudinaryCloudName={cloudinaryCloudName} />
        <PublicIdList label="Colors" items={state.colors} setItems={(items) => update("colors", items)} placeholder="#111111 or color name" />
        <PublicIdList label="Video public IDs" items={state.videoPublicIds} setItems={(items) => update("videoPublicIds", items)} placeholder="wholesale/product/video-1" />

        <div className="admin-section-label">Pricing tiers</div>
        <div className="admin-grid-two">
          <label className="admin-field"><span>Retail price (LKR)</span><input className="admin-input" type="number" min="0" step="0.01" value={state.retailPrice} onChange={(event) => update("retailPrice", event.target.value)} /></label>
          <label className="admin-field"><span>Suggested sell price (LKR)</span><input className="admin-input" type="number" min="0" step="0.01" value={state.suggestedSellPrice} onChange={(event) => update("suggestedSellPrice", event.target.value)} /></label>
        </div>

        <div className="admin-field-group">
          <div className="admin-group-header"><label>Price tiers *</label><button type="button" className="admin-button admin-button-secondary" onClick={() => update("priceTiers", [...state.priceTiers, { label: "", minQty: "", maxQty: "", unitPrice: "" }])}>Add tier</button></div>
          <div className="admin-repeat-list">
            {state.priceTiers.map((tier, index) => (
              <div className="admin-repeat-row admin-repeat-row-tier" key={index}>
                <input className="admin-input" aria-label="Tier label" placeholder="5–15 pcs" value={tier.label} onChange={(event) => updateTier(index, "label", event.target.value)} />
                <input className="admin-input" aria-label="Minimum quantity" type="number" min="1" step="1" placeholder="Min" required value={tier.minQty} onChange={(event) => updateTier(index, "minQty", event.target.value)} />
                <input className="admin-input" aria-label="Maximum quantity" type="number" min="1" step="1" placeholder="Max optional" value={tier.maxQty} onChange={(event) => updateTier(index, "maxQty", event.target.value)} />
                <input className="admin-input" aria-label="Unit price" type="number" min="0" step="0.01" placeholder="Unit price" required value={tier.unitPrice} onChange={(event) => updateTier(index, "unitPrice", event.target.value)} />
                <button className="admin-button admin-button-secondary" type="button" onClick={() => update("priceTiers", state.priceTiers.length === 1 ? state.priceTiers : state.priceTiers.filter((_, tierIndex) => tierIndex !== index))}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <label className="admin-field"><span>Profit note</span><textarea className="admin-textarea" rows={3} value={state.profitNote} onChange={(event) => update("profitNote", event.target.value)} /></label>

        <div className="admin-section-label">Merchandising</div>
        <div className="admin-grid-three">
          <label className="admin-field"><span>Deal tag</span><input className="admin-input" value={state.dealTag} onChange={(event) => update("dealTag", event.target.value)} placeholder="Hot deal" /></label>
          <label className="admin-field"><span>Dimensions</span><input className="admin-input" value={state.dimensions} onChange={(event) => update("dimensions", event.target.value)} placeholder="Compact handheld size" /></label>
          <label className="admin-field"><span>Weight</span><input className="admin-input" value={state.weight} onChange={(event) => update("weight", event.target.value)} placeholder="Lightweight" /></label>
        </div>
        <PublicIdList label="Tags" items={state.tags} setItems={(items) => update("tags", items)} placeholder="hot-deal" />
        <div className="admin-checks">
          <label><input type="checkbox" checked={state.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} /> Featured product</label>
          <label><input type="checkbox" checked={state.isNewArrival} onChange={(event) => update("isNewArrival", event.target.checked)} /> New arrival</label>
          <label><input type="checkbox" checked={state.marketingAssetsAvailable} onChange={(event) => update("marketingAssetsAvailable", event.target.checked)} /> Marketing assets available</label>
        </div>

        <div className="admin-section-label">Delivery & COD</div>
        <div className="admin-grid-two">
          <label className="admin-field"><span>Delivery estimate</span><input className="admin-input" value={state.deliveryEstimate} onChange={(event) => update("deliveryEstimate", event.target.value)} placeholder="Estimated delivery: 2–5 business days" /></label>
          <div className="admin-checks">
            <label><input type="checkbox" checked={state.codAvailable} onChange={(event) => update("codAvailable", event.target.checked)} /> COD available where possible</label>
            <label><input type="checkbox" checked={state.singleItemAvailable} onChange={(event) => update("singleItemAvailable", event.target.checked)} /> Single item available</label>
          </div>
        </div>
        <label className="admin-field"><span>Delivery note</span><textarea className="admin-textarea" rows={3} value={state.deliveryNote} onChange={(event) => update("deliveryNote", event.target.value)} /></label>
        <label className="admin-field"><span>Return note</span><textarea className="admin-textarea" rows={3} value={state.returnNote} onChange={(event) => update("returnNote", event.target.value)} /></label>
        <label className="admin-field"><span>Warranty note</span><textarea className="admin-textarea" rows={3} value={state.warrantyNote} onChange={(event) => update("warrantyNote", event.target.value)} /></label>

        <div className="admin-section-label">Product details</div>
        <PublicIdList label="Package contents" items={state.packageContents} setItems={(items) => update("packageContents", items)} placeholder="1 x product" />
        <div className="admin-field-group">
          <div className="admin-group-header"><label>Specifications</label><button type="button" className="admin-button admin-button-secondary" onClick={() => update("specifications", [...state.specifications, { label: "", value: "" }])}>Add specification</button></div>
          <div className="admin-repeat-list">
            {state.specifications.map((specification, index) => (
              <div className="admin-repeat-row admin-repeat-row-two" key={index}>
                <input className="admin-input" placeholder="Label" value={specification.label} onChange={(event) => update("specifications", state.specifications.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
                <input className="admin-input" placeholder="Value" value={specification.value} onChange={(event) => update("specifications", state.specifications.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} />
                <button className="admin-button admin-button-secondary" type="button" onClick={() => update("specifications", state.specifications.length === 1 ? [{ label: "", value: "" }] : state.specifications.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-field-group">
          <div className="admin-group-header"><label>FAQs</label><button type="button" className="admin-button admin-button-secondary" onClick={() => update("faqs", [...state.faqs, { question: "", answer: "" }])}>Add FAQ</button></div>
          <div className="admin-repeat-list">
            {state.faqs.map((faq, index) => (
              <div className="admin-repeat-row admin-repeat-row-two" key={index}>
                <input className="admin-input" placeholder="Question" value={faq.question} onChange={(event) => update("faqs", state.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item))} />
                <input className="admin-input" placeholder="Answer" value={faq.answer} onChange={(event) => update("faqs", state.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} />
                <button className="admin-button admin-button-secondary" type="button" onClick={() => update("faqs", state.faqs.length === 1 ? [{ question: "", answer: "" }] : state.faqs.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section-label">SEO</div>
        <label className="admin-field"><span>SEO title</span><input className="admin-input" value={state.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} /></label>
        <label className="admin-field"><span>SEO description</span><textarea className="admin-textarea" rows={3} value={state.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} /></label>

        <div className="admin-checks"><label><input type="checkbox" checked={state.isActive} onChange={(event) => update("isActive", event.target.checked)} /> Active and publicly eligible</label></div>
        <div className="admin-form-actions"><Link href="/admin/wholesale-products" className="admin-button admin-button-secondary">Cancel</Link><button className="admin-button" type="submit" disabled={saving}>{saving ? "Saving..." : mode === "create" ? "Create Wholesale Product" : "Save Changes"}</button></div>
      </form>
    </section>
  );
}

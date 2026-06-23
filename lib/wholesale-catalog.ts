import "server-only";

import { wholesaleProducts as fallbackProducts } from "@/data/wholesale-products";
import { normalizeWholesaleCategory } from "@/data/wholesale-categories";
import type {
  WholesalePriceTier,
  WholesaleFaq,
  WholesaleProduct,
  WholesaleSpecification,
  WholesaleStockStatus,
} from "@/data/wholesale-types";
import { getSupabaseConfig } from "@/lib/supabase-config";

export type WholesaleProductRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string | null;
  short_description: string | null;
  image_public_id: string | null;
  gallery_public_ids: unknown;
  colors: unknown;
  stock_status: string | null;
  moq: number | string | null;
  retail_price: number | string | null;
  suggested_sell_price: number | string | null;
  price_tiers: unknown;
  profit_note: string | null;
  specifications: unknown;
  deal_tag?: string | null;
  is_featured?: boolean | null;
  is_new_arrival?: boolean | null;
  tags?: unknown;
  package_contents?: unknown;
  delivery_estimate?: string | null;
  delivery_note?: string | null;
  cod_available?: boolean | null;
  single_item_available?: boolean | null;
  return_note?: string | null;
  warranty_note?: string | null;
  marketing_assets_available?: boolean | null;
  video_public_ids?: unknown;
  faqs?: unknown;
  dimensions?: string | null;
  weight?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toString(item)).filter(Boolean);
}

function toStockStatus(value: unknown): WholesaleStockStatus {
  if (value === "low_stock" || value === "out_of_stock") return value;
  return "in_stock";
}

function toPriceTiers(value: unknown): WholesalePriceTier[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const minQty = Math.max(1, Math.round(toNumber(entry.minQty ?? entry.min_qty, 1)));
    const unitPrice = toNumber(entry.unitPrice ?? entry.unit_price, -1);
    if (unitPrice < 0) return [];

    const maxQtyValue = entry.maxQty ?? entry.max_qty;
    const maxQty = maxQtyValue == null ? undefined : Math.max(minQty, Math.round(toNumber(maxQtyValue, minQty)));

    return [{
      label: toString(entry.label, maxQty ? `${minQty}-${maxQty} pcs` : `${minQty}+ pcs`),
      minQty,
      ...(maxQty ? { maxQty } : {}),
      unitPrice,
    }];
  });
}

function toSpecifications(value: unknown): WholesaleSpecification[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const label = toString(entry.label ?? entry.name);
    const specificationValue = toString(entry.value);
    return label && specificationValue ? [{ label, value: specificationValue }] : [];
  });
}

function toFaqs(value: unknown): WholesaleFaq[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const question = toString(entry.question);
    const answer = toString(entry.answer);
    return question && answer ? [{ question, answer }] : [];
  });
}

export function mapWholesaleProductRow(row: WholesaleProductRow): WholesaleProduct {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: normalizeWholesaleCategory(row.category),
    subcategory: toString(row.subcategory) || undefined,
    shortDescription: toString(row.short_description) || undefined,
    imagePublicId: toString(row.image_public_id, "sample"),
    galleryPublicIds: toStringArray(row.gallery_public_ids),
    colors: toStringArray(row.colors),
    stockStatus: toStockStatus(row.stock_status),
    moq: Math.max(1, Math.round(toNumber(row.moq, 1))),
    retailPrice: toNumber(row.retail_price),
    suggestedSellPrice: row.suggested_sell_price == null ? undefined : toNumber(row.suggested_sell_price),
    priceTiers: toPriceTiers(row.price_tiers),
    profitNote: toString(row.profit_note) || undefined,
    specifications: toSpecifications(row.specifications),
    dealTag: toString(row.deal_tag) || undefined,
    isFeatured: Boolean(row.is_featured),
    isNewArrival: Boolean(row.is_new_arrival),
    tags: toStringArray(row.tags),
    packageContents: toStringArray(row.package_contents),
    deliveryEstimate: toString(row.delivery_estimate) || undefined,
    deliveryNote: toString(row.delivery_note) || undefined,
    codAvailable: row.cod_available ?? true,
    singleItemAvailable: row.single_item_available ?? true,
    returnNote: toString(row.return_note) || undefined,
    warrantyNote: toString(row.warranty_note) || undefined,
    marketingAssetsAvailable: Boolean(row.marketing_assets_available),
    videoPublicIds: toStringArray(row.video_public_ids),
    faqs: toFaqs(row.faqs),
    dimensions: toString(row.dimensions) || undefined,
    weight: toString(row.weight) || undefined,
    seoTitle: toString(row.seo_title) || undefined,
    seoDescription: toString(row.seo_description) || undefined,
    isActive: row.is_active ?? true,
    sortOrder: Math.round(toNumber(row.sort_order)),
  };
}

async function fetchWholesaleRows(searchParams: Record<string, string>) {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const params = new URLSearchParams(searchParams);
  const response = await fetch(`${url}/rest/v1/wholesale_products?${params.toString()}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return (await response.json()) as WholesaleProductRow[];
}

export async function loadWholesaleProducts() {
  const rows = await fetchWholesaleRows({
    select: "*",
    is_active: "eq.true",
    order: "sort_order.asc,created_at.asc",
  });

  if (rows?.length) {
    return rows.map(mapWholesaleProductRow).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  if (rows) {
    const anyRows = await fetchWholesaleRows({ select: "id", limit: "1" });
    if (anyRows?.length) return [];
  }

  return fallbackProducts
    .filter((product) => product.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

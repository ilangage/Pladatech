import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getWholesaleCategory,
  normalizeWholesaleCategory,
  wholesaleCategoryOptions,
} from "@/data/wholesale-categories";
import type { WholesaleFaq, WholesalePriceTier, WholesaleSpecification, WholesaleStockStatus } from "@/data/wholesale-types";

export type WholesaleProductRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory: string | null;
  short_description: string | null;
  image_public_id: string | null;
  gallery_public_ids: string[] | null;
  colors: string[] | null;
  stock_status: WholesaleStockStatus;
  moq: number;
  retail_price: number | string | null;
  suggested_sell_price: number | string | null;
  price_tiers: WholesalePriceTier[] | null;
  profit_note: string | null;
  specifications: WholesaleSpecification[] | null;
  deal_tag: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  tags: string[] | null;
  package_contents: string[] | null;
  delivery_estimate: string | null;
  delivery_note: string | null;
  cod_available: boolean;
  single_item_available: boolean;
  return_note: string | null;
  warranty_note: string | null;
  marketing_assets_available: boolean;
  video_public_ids: string[] | null;
  faqs: WholesaleFaq[] | null;
  dimensions: string | null;
  weight: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

export type WholesaleProductWritePayload = {
  slug: string;
  title: string;
  category: string;
  subcategory: string | null;
  short_description: string | null;
  image_public_id: string | null;
  gallery_public_ids: string[];
  colors: string[];
  stock_status: WholesaleStockStatus;
  moq: number;
  retail_price: number | null;
  suggested_sell_price: number | null;
  price_tiers: WholesalePriceTier[];
  profit_note: string | null;
  specifications: WholesaleSpecification[];
  deal_tag: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  tags: string[];
  package_contents: string[];
  delivery_estimate: string | null;
  delivery_note: string | null;
  cod_available: boolean;
  single_item_available: boolean;
  return_note: string | null;
  warranty_note: string | null;
  marketing_assets_available: boolean;
  video_public_ids: string[];
  faqs: WholesaleFaq[];
  dimensions: string | null;
  weight: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  sort_order: number;
};

export const wholesaleStockStatuses = new Set<WholesaleStockStatus>(["in_stock", "low_stock", "out_of_stock"]);

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalNumber(value: unknown) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(clean).filter(Boolean);
}

function hasFullUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function parsePriceTiers(value: unknown): WholesalePriceTier[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const tiers: WholesalePriceTier[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const minQty = Number(row.minQty);
    const maxQty = row.maxQty === "" || row.maxQty == null ? undefined : Number(row.maxQty);
    const unitPrice = Number(row.unitPrice);
    const label = clean(row.label);

    if (!Number.isInteger(minQty) || minQty <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return null;
    if (maxQty !== undefined && (!Number.isInteger(maxQty) || maxQty < minQty)) return null;

    tiers.push({ label: label || (maxQty ? `${minQty}-${maxQty} pcs` : `${minQty}+ pcs`), minQty, maxQty, unitPrice });
  }
  return tiers;
}

function parseSpecifications(value: unknown): WholesaleSpecification[] | null {
  if (!Array.isArray(value)) return [];
  const specifications: WholesaleSpecification[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const label = clean(row.label);
    const specificationValue = clean(row.value);
    if (!label && !specificationValue) continue;
    if (!label || !specificationValue) return null;
    specifications.push({ label, value: specificationValue });
  }
  return specifications;
}

function parseFaqs(value: unknown): WholesaleFaq[] | null {
  if (!Array.isArray(value)) return [];
  const faqs: WholesaleFaq[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const question = clean(row.question);
    const answer = clean(row.answer);
    if (!question && !answer) continue;
    if (!question || !answer) return null;
    faqs.push({ question, answer });
  }
  return faqs;
}

export function parseWholesaleProductPayload(body: Record<string, unknown>):
  | { ok: true; payload: WholesaleProductWritePayload }
  | { ok: false; error: string } {
  const title = clean(body.title);
  const slug = clean(body.slug).toLowerCase();
  const category = normalizeWholesaleCategory(clean(body.category));
  const subcategory = clean(body.subcategory) || null;
  const imagePublicId = clean(body.image_public_id);
  const galleryPublicIds = stringArray(body.gallery_public_ids);
  const colors = stringArray(body.colors);
  const stockStatus = clean(body.stock_status) as WholesaleStockStatus;
  const moq = Number(body.moq);
  const retailPrice = optionalNumber(body.retail_price);
  const suggestedSellPrice = optionalNumber(body.suggested_sell_price);
  const priceTiers = parsePriceTiers(body.price_tiers);
  const specifications = parseSpecifications(body.specifications);
  const faqs = parseFaqs(body.faqs);
  const sortOrder = Number(body.sort_order ?? 0);

  if (!title) return { ok: false, error: "Title is required." };
  if (!slug) return { ok: false, error: "Slug is required." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "Slug must contain lowercase letters, numbers, and hyphens only." };
  if (!category) return { ok: false, error: "Category is required." };
  if (!wholesaleCategoryOptions.some((item) => item.value === category)) return { ok: false, error: "Choose a valid wholesale category." };
  const subcategoryOptions = getWholesaleCategory(category).subcategories ?? [];
  if (subcategory && !subcategoryOptions.some((item) => item.value === subcategory)) return { ok: false, error: "Choose a valid wholesale subcategory for this category." };
  if (!wholesaleStockStatuses.has(stockStatus)) return { ok: false, error: "Invalid stock status." };
  if (!Number.isInteger(moq) || moq <= 0) return { ok: false, error: "MOQ must be a positive whole number." };
  if (body.retail_price !== "" && body.retail_price != null && (retailPrice == null || retailPrice < 0)) return { ok: false, error: "Retail price must be a valid positive number." };
  if (body.suggested_sell_price !== "" && body.suggested_sell_price != null && (suggestedSellPrice == null || suggestedSellPrice < 0)) return { ok: false, error: "Suggested sell price must be a valid positive number." };
  if (!priceTiers) return { ok: false, error: "Each price tier requires a positive minimum quantity and valid unit price." };
  if (!specifications) return { ok: false, error: "Each specification requires both a label and value." };
  if (!faqs) return { ok: false, error: "Each FAQ requires both a question and answer." };
  if (!Number.isInteger(sortOrder)) return { ok: false, error: "Sort order must be a whole number." };
  if (imagePublicId && hasFullUrl(imagePublicId)) return { ok: false, error: "Main image must be a Cloudinary public ID, not a full URL." };
  if (galleryPublicIds.some(hasFullUrl)) return { ok: false, error: "Gallery images must be Cloudinary public IDs, not full URLs." };

  return {
    ok: true,
    payload: {
      title,
      slug,
      category,
      subcategory,
      short_description: clean(body.short_description) || null,
      image_public_id: imagePublicId || null,
      gallery_public_ids: galleryPublicIds,
      colors,
      stock_status: stockStatus,
      moq,
      retail_price: retailPrice,
      suggested_sell_price: suggestedSellPrice,
      price_tiers: priceTiers,
      profit_note: clean(body.profit_note) || null,
      specifications,
      deal_tag: clean(body.deal_tag) || null,
      is_featured: body.is_featured === true,
      is_new_arrival: body.is_new_arrival === true,
      tags: stringArray(body.tags),
      package_contents: stringArray(body.package_contents),
      delivery_estimate: clean(body.delivery_estimate) || null,
      delivery_note: clean(body.delivery_note) || null,
      cod_available: body.cod_available !== false,
      single_item_available: body.single_item_available !== false,
      return_note: clean(body.return_note) || null,
      warranty_note: clean(body.warranty_note) || null,
      marketing_assets_available: body.marketing_assets_available === true,
      video_public_ids: stringArray(body.video_public_ids),
      faqs,
      dimensions: clean(body.dimensions) || null,
      weight: clean(body.weight) || null,
      seo_title: clean(body.seo_title) || null,
      seo_description: clean(body.seo_description) || null,
      is_active: body.is_active !== false,
      sort_order: sortOrder,
    },
  };
}

function normalizeRow(row: WholesaleProductRow): WholesaleProductRow {
  return {
    ...row,
    moq: Number(row.moq ?? 1),
    retail_price: row.retail_price == null ? null : Number(row.retail_price),
    suggested_sell_price: row.suggested_sell_price == null ? null : Number(row.suggested_sell_price),
    category: normalizeWholesaleCategory(row.category),
    subcategory: row.subcategory ?? null,
    gallery_public_ids: Array.isArray(row.gallery_public_ids) ? row.gallery_public_ids : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    price_tiers: Array.isArray(row.price_tiers) ? row.price_tiers : [],
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    deal_tag: row.deal_tag ?? null,
    is_featured: row.is_featured === true,
    is_new_arrival: row.is_new_arrival === true,
    tags: Array.isArray(row.tags) ? row.tags : [],
    package_contents: Array.isArray(row.package_contents) ? row.package_contents : [],
    delivery_estimate: row.delivery_estimate ?? null,
    delivery_note: row.delivery_note ?? null,
    cod_available: row.cod_available !== false,
    single_item_available: row.single_item_available !== false,
    return_note: row.return_note ?? null,
    warranty_note: row.warranty_note ?? null,
    marketing_assets_available: row.marketing_assets_available === true,
    video_public_ids: Array.isArray(row.video_public_ids) ? row.video_public_ids : [],
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    dimensions: row.dimensions ?? null,
    weight: row.weight ?? null,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    is_active: row.is_active !== false,
    sort_order: Number(row.sort_order ?? 0),
  };
}

export async function getAdminWholesaleProducts() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) {
    console.error("Wholesale product load failed:", error);
    return [];
  }
  return (data ?? []).map((row) => normalizeRow(row as WholesaleProductRow));
}

export async function getAdminWholesaleProductById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_products").select("*").eq("id", id).single();
  if (error) return null;
  return normalizeRow(data as WholesaleProductRow);
}

export async function createAdminWholesaleProduct(payload: WholesaleProductWritePayload) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_products").insert(payload).select("*").single();
  if (error) throw error;
  return normalizeRow(data as WholesaleProductRow);
}

export async function updateAdminWholesaleProduct(id: string, payload: Partial<WholesaleProductWritePayload>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("wholesale_products")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return normalizeRow(data as WholesaleProductRow);
}

export async function deleteAdminWholesaleProduct(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_products").delete().eq("id", id).select("*").single();
  if (error) throw error;
  return normalizeRow(data as WholesaleProductRow);
}

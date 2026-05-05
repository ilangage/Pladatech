import type { Product } from "@/data/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProductRow } from "./product-catalog";

export type ProductWritePayload = {
  title: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  compare_at_price?: number | null;
  rating: number;
  review_count: number;
  stock: number;
  badge?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  gallery_images?: string[];
  short_description?: string | null;
  overview?: string | null;
  features?: string[];
  whats_included?: string[];
  why_customers_love_it?: string[];
  specs?: { name: string; value: string }[];
  tags?: string[];
  feature_chips?: { label: string; value: string }[];
  related_product_slugs?: string[];
  collection_slugs?: string[];
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_active?: boolean;
  sort_order?: number;
};

export function mapProductToWritePayload(product: Product): ProductWritePayload {
  return {
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    category: product.category,
    price: product.price,
    compare_at_price: product.oldPrice ?? null,
    rating: product.rating,
    review_count: product.reviewCount,
    stock: product.stock,
    badge: product.badge ?? null,
    image_url: product.image,
    image_alt: product.title,
    gallery_images: product.gallery,
    short_description: product.shortDescription,
    overview: product.description,
    features: product.features,
    whats_included: product.whatIncluded,
    why_customers_love_it: product.whyCustomersLoveIt,
    specs: product.fullSpecs.map((item) => ({ name: item.label, value: item.value })),
    tags: product.tags,
    feature_chips: product.specs,
    related_product_slugs: product.relatedSlugs,
    collection_slugs: [],
    is_featured: false,
    is_best_seller: product.badge?.toLowerCase().includes("best seller") ?? false,
    is_active: true,
    sort_order: product.sortOrder ?? 0,
  };
}

function normalizeProductRow(row: ProductRow): ProductRow {
  return {
    ...row,
    price: Number(row.price),
    compare_at_price: row.compare_at_price == null ? null : Number(row.compare_at_price),
    rating: row.rating == null ? 0 : Number(row.rating),
    review_count: row.review_count == null ? 0 : Number(row.review_count),
    stock: row.stock == null ? 0 : Number(row.stock),
    sort_order: row.sort_order == null ? 0 : Number(row.sort_order),
    is_featured: Boolean(row.is_featured),
    is_best_seller: Boolean(row.is_best_seller),
    is_active: row.is_active !== false,
  };
}

export async function getAdminProducts() {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.from("products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });

  if (error) {
    console.error("Admin product load failed:", error);
    return [];
  }

  return (data ?? []).map((row) => normalizeProductRow(row as ProductRow));
}

export async function bulkUpsertAdminProducts(payloads: ProductWritePayload[]) {
  if (payloads.length === 0) return [];

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.from("products").upsert(payloads, { onConflict: "slug" }).select("*");

  if (error) {
    console.error("Bulk product upsert failed:", error);
    throw error;
  }

  return (data ?? []).map((row) => normalizeProductRow(row as ProductRow));
}

export async function createAdminProduct(payload: ProductWritePayload) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.from("products").insert(payload).select("*").single();

  if (error) {
    console.error("Product create failed:", error);
    throw error;
  }

  return normalizeProductRow(data as ProductRow);
}

export async function updateAdminProduct(id: string, payload: Partial<ProductWritePayload>) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Product update failed:", error);
    throw error;
  }

  return normalizeProductRow(data as ProductRow);
}

export async function deleteAdminProduct(id: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.from("products").delete().eq("id", id).select("*").single();

  if (error) {
    console.error("Product delete failed:", error);
    throw error;
  }

  return normalizeProductRow(data as ProductRow);
}

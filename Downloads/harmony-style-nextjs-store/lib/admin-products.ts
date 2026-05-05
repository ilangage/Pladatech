import type { Product } from "@/data/types";
import { getSupabaseConfig } from "./supabase-config";
import type { ProductRow, JsonValue } from "./product-catalog";

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

function toJsonArray(value: unknown): JsonValue[] {
  if (!Array.isArray(value)) return [];
  return value as JsonValue[];
}

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

async function adminFetch(path: string, init: RequestInit = {}) {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase service role is not configured.");
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", anonKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function getAdminProducts() {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  if (!url || !anonKey || !serviceRoleKey) return [];

  const response = await fetch(`${url}/rest/v1/products?select=*&order=sort_order.asc,created_at.asc`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return [];
  return (await response.json()) as ProductRow[];
}

export async function createAdminProduct(payload: ProductWritePayload) {
  const response = await adminFetch("products", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create product.");
  }
  return (await response.json()) as ProductRow[];
}

export async function updateAdminProduct(id: string, payload: Partial<ProductWritePayload>) {
  const response = await adminFetch(`products?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to update product.");
  }
  return (await response.json()) as ProductRow[];
}

export async function deleteAdminProduct(id: string) {
  const response = await adminFetch(`products?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to delete product.");
  }
  return (await response.json()) as ProductRow[];
}

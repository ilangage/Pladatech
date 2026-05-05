import { categoryList } from "@/data/categories";
import { products as fallbackProducts } from "@/data/products";
import type { Category, Product } from "@/data/types";
import { getSupabaseConfig } from "./supabase-config";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type ProductRow = {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  category: string;
  price: number | string;
  compare_at_price: number | string | null;
  rating: number | string | null;
  review_count: number | null;
  stock: number | null;
  badge: string | null;
  image_url: string | null;
  image_alt: string | null;
  gallery_images: JsonValue[] | null;
  short_description: string | null;
  overview: string | null;
  features: JsonValue[] | null;
  whats_included: JsonValue[] | null;
  why_customers_love_it: JsonValue[] | null;
  specs: JsonValue[] | null;
  tags: JsonValue[] | null;
  feature_chips: JsonValue[] | null;
  related_product_slugs: JsonValue[] | null;
  collection_slugs: JsonValue[] | null;
  is_featured: boolean | null;
  is_best_seller: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

const fallbackBySlug = new Map(fallbackProducts.map((product) => [product.slug, product]));
const categorySlugByName = new Map(categoryList.map((category) => [category.name, category.slug]));

function toNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function asSpecArray(value: unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const label = asString(entry.label ?? entry.name);
      const valueText = asString(entry.value);
      if (!label || !valueText) return null;
      return { label, value: valueText };
    })
    .filter(Boolean) as { label: string; value: string }[];
}

function defaultColors(categorySlug: string): string[] {
  if (categorySlug === "kitchen-wellness") return ["#171717", "#f8fafc", "#78716c"];
  if (categorySlug === "pet-home-security") return ["#0f172a", "#f8fafc", "#64748b"];
  if (categorySlug === "car-mobile-essentials") return ["#27272a", "#fafafa", "#71717a"];
  return ["#111827", "#e5e7eb", "#78716c"];
}

function buildSeoTitle(title: string) {
  return `${title} | Pladatech`;
}

function buildSeoDescription(title: string, shortDescription: string) {
  return shortDescription || `Shop ${title.toLowerCase()} from Pladatech.`;
}

function deriveBadgeKey(row: ProductRow, fallback?: Product): Product["badgeKey"] {
  const badge = row.badge ?? fallback?.badge ?? "";
  if (row.is_best_seller || badge.toLowerCase().includes("best seller")) return "new";
  if (badge.toLowerCase().includes("sale") || badge.toLowerCase().includes("space saver")) return "sale";
  if (badge.toLowerCase().includes("favorite") || badge.toLowerCase().includes("popular") || badge.toLowerCase().includes("daily")) {
    return "promo";
  }
  if (typeof row.compare_at_price === "number" || typeof row.compare_at_price === "string") return "sale";
  return fallback?.badgeKey ?? "promo";
}

function rowToProduct(row: ProductRow): Product {
  const fallback = fallbackBySlug.get(row.slug);
  const category = row.category as Category;
  const categorySlug = categorySlugByName.get(category) ?? fallback?.categorySlug ?? "smart-cleaning";
  const image = asString(row.image_url, fallback?.image ?? "/products/robot-vacuum-mop-combo.png");
  const gallery = asStringArray(row.gallery_images).filter(Boolean);
  const mainGallery = gallery.length > 0 ? gallery : [image];
  const shortDescription = asString(row.short_description, fallback?.shortDescription ?? "");
  const description = asString(row.overview, fallback?.description ?? shortDescription);
  const features = asStringArray(row.features);
  const whatIncluded = asStringArray(row.whats_included);
  const whyCustomersLoveIt = asStringArray(row.why_customers_love_it);
  const tags = asStringArray(row.tags);
  const relatedSlugs = asStringArray(row.related_product_slugs);
  const colors = fallback?.colors?.length ? fallback.colors : defaultColors(categorySlug);
  const chipSpecs = asSpecArray(row.feature_chips);
  const fullSpecs = asSpecArray(row.specs);

  return {
    id: row.id,
    databaseId: row.id,
    title: row.title,
    slug: row.slug,
    brand: asString(row.brand, fallback?.brand ?? "Pladatech"),
    category,
    categorySlug,
    price: toNumber(row.price, fallback?.price ?? 0),
    oldPrice: row.compare_at_price == null ? fallback?.oldPrice : toNumber(row.compare_at_price, fallback?.oldPrice ?? 0),
    rating: toNumber(row.rating, fallback?.rating ?? 0),
    reviewCount: Math.round(toNumber(row.review_count, fallback?.reviewCount ?? 0)),
    badge: asString(row.badge, fallback?.badge ?? ""),
    badgeKey: deriveBadgeKey(row, fallback),
    stock: Math.round(toNumber(row.stock, fallback?.stock ?? 0)),
    preorder: fallback?.preorder ?? false,
    colors,
    specs: chipSpecs.length > 0 ? chipSpecs : fallback?.specs ?? [],
    image,
    hoverImage: mainGallery[1] ?? image,
    gallery: mainGallery,
    description,
    shortDescription,
    features: features.length > 0 ? features : fallback?.features ?? [],
    whatIncluded: whatIncluded.length > 0 ? whatIncluded : fallback?.whatIncluded ?? [],
    whyCustomersLoveIt: whyCustomersLoveIt.length > 0 ? whyCustomersLoveIt : fallback?.whyCustomersLoveIt ?? [],
    fullSpecs: fullSpecs.length > 0 ? fullSpecs : fallback?.fullSpecs ?? [],
    shippingReturns: fallback?.shippingReturns ?? "Fast shipping options available. Secure checkout. 30-day returns on eligible items.",
    tags: tags.length > 0 ? tags : fallback?.tags ?? [],
    seoTitle: fallback?.seoTitle ?? buildSeoTitle(row.title),
    seoDescription: fallback?.seoDescription ?? buildSeoDescription(row.title, shortDescription || description),
    relatedSlugs: relatedSlugs.length > 0 ? relatedSlugs : fallback?.relatedSlugs ?? [],
    sortOrder: Math.round(toNumber(row.sort_order, fallback?.sortOrder ?? 0)),
    isActive: row.is_active ?? true,
  };
}

async function fetchRows(path: string, searchParams: Record<string, string> = {}) {
  const { url, anonKey, serviceRoleKey, isConfigured, isServerConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const params = new URLSearchParams(searchParams);
  const endpoint = `${url}/rest/v1/${path}${params.toString() ? `?${params.toString()}` : ""}`;
  const token = serviceRoleKey && isServerConfigured ? serviceRoleKey : anonKey;
  const response = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = (await response.json()) as ProductRow[];
  return data;
}

async function tableHasProducts() {
  const rows = await fetchRows("products", {
    select: "id",
    limit: "1",
  });
  return Boolean(rows && rows.length > 0);
}

export async function loadProducts() {
  const rows = await fetchRows("products", {
    select: "*",
    order: "sort_order.asc,created_at.asc",
    "is_active": "eq.true",
  });

  if (!rows) return fallbackProducts;
  if (rows.length === 0) {
    return (await tableHasProducts()) ? [] : fallbackProducts;
  }
  return rows.map(rowToProduct).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function loadAllProducts() {
  const rows = await fetchRows("products", {
    select: "*",
    order: "sort_order.asc,created_at.asc",
  });

  if (!rows || rows.length === 0) return fallbackProducts;
  return rows.map(rowToProduct).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function loadProductBySlug(slug: string) {
  const rows = await fetchRows("products", {
    select: "*",
    slug: `eq.${slug}`,
    limit: "1",
  });

  if (rows && rows[0]) {
    if (rows[0].is_active === false) return undefined;
    return rowToProduct(rows[0]);
  }
  if ((await tableHasProducts()) || !fallbackBySlug.has(slug)) return undefined;
  return fallbackBySlug.get(slug);
}

export async function loadProductsByCategory(category: Category) {
  const rows = await loadProducts();
  return rows.filter((product) => product.category === category);
}

export async function loadRelatedProducts(product: Product) {
  const rows = await loadProducts();
  return product.relatedSlugs.map((slug) => rows.find((entry) => entry.slug === slug)).filter(Boolean) as Product[];
}

export function getProductsBySlugsFromList(list: Product[], slugs: string[]) {
  const bySlug = new Map(list.map((item) => [item.slug, item]));
  return slugs.map((slug) => bySlug.get(slug)).filter(Boolean) as Product[];
}

export function getProductsByCategoryFromList(list: Product[], category: Category) {
  return list.filter((product) => product.category === category);
}

export function getProductBySlugFromList(list: Product[], slug: string) {
  return list.find((product) => product.slug === slug);
}

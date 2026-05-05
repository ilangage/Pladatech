import { NextResponse } from "next/server";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { bulkUpsertAdminProducts, type ProductWritePayload } from "@/lib/admin-products";

function requireAdmin() {
  return getAuthenticatedAdminUser().then((user) => {
    if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    if (!isAdminEmailAllowed(user.email)) return { ok: false as const, response: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
    return { ok: true as const, user };
  });
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function asPairArray(value: unknown, leftKey: "name" | "label" = "name") {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const left = asString(entry[leftKey] ?? entry.name ?? entry.label);
      const right = asString(entry.value);
      if (!left || !right) return null;
      return leftKey === "label" ? { label: left, value: right } : { name: left, value: right };
    })
    .filter(Boolean) as Array<{ name?: string; label?: string; value: string }>;
}

function normalizeProduct(item: unknown): ProductWritePayload | null {
  if (!item || typeof item !== "object") return null;
  const entry = item as Record<string, unknown>;
  const title = asString(entry.title);
  const slug = asString(entry.slug);
  const category = asString(entry.category);
  const price = asNumber(entry.price, NaN);

  if (!title || !slug || !category || !Number.isFinite(price)) return null;

  return {
    title,
    slug,
    brand: asString(entry.brand, "Pladatech"),
    category,
    price,
    compare_at_price: entry.compare_at_price == null || entry.compare_at_price === "" ? null : asNumber(entry.compare_at_price, 0),
    rating: asNumber(entry.rating, 0),
    review_count: Math.round(asNumber(entry.review_count, 0)),
    stock: Math.round(asNumber(entry.stock, 0)),
    badge: asString(entry.badge) || null,
    image_url: asString(entry.image_url) || null,
    image_alt: asString(entry.image_alt) || null,
    gallery_images: asStringArray(entry.gallery_images),
    short_description: asString(entry.short_description) || null,
    overview: asString(entry.overview) || null,
    features: asStringArray(entry.features),
    whats_included: asStringArray(entry.whats_included),
    why_customers_love_it: asStringArray(entry.why_customers_love_it),
    specs: asPairArray(entry.specs).map((item) => ({ name: item.name ?? item.label ?? "", value: item.value })).filter((item) => item.name && item.value) as { name: string; value: string }[],
    tags: asStringArray(entry.tags),
    feature_chips: asPairArray(entry.feature_chips, "label").map((item) => ({ label: item.label ?? item.name ?? "", value: item.value })).filter((item) => item.label && item.value) as { label: string; value: string }[],
    related_product_slugs: asStringArray(entry.related_product_slugs),
    collection_slugs: asStringArray(entry.collection_slugs),
    is_featured: Boolean(entry.is_featured),
    is_best_seller: Boolean(entry.is_best_seller),
    is_active: entry.is_active !== false,
    sort_order: Math.round(asNumber(entry.sort_order, 0)),
  };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => ({}));
  const rawProducts = Array.isArray(body) ? body : Array.isArray((body as { products?: unknown }).products) ? (body as { products: unknown[] }).products : null;
  if (!rawProducts || rawProducts.length === 0) {
    return NextResponse.json({ error: "Provide a JSON array of products to import." }, { status: 400 });
  }
  if (rawProducts.length > 1000) {
    return NextResponse.json({ error: "Import limit is 1000 products per request." }, { status: 400 });
  }

  const products = rawProducts.map(normalizeProduct).filter(Boolean) as ProductWritePayload[];
  if (products.length === 0) {
    return NextResponse.json({ error: "No valid products found in the import payload." }, { status: 400 });
  }

  try {
    const rows = await bulkUpsertAdminProducts(products);
    return NextResponse.json({ products: rows, imported: rows.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to import products." }, { status: 400 });
  }
}

import { getProductReviews as getStarterProductReviews } from "@/data/product-reviews";
import type { Product, ProductReview } from "@/data/types";
import { getSupabaseConfig } from "./supabase-config";

type ProductReviewRow = {
  id: string;
  product_slug: string;
  customer_name: string;
  customer_location: string | null;
  rating: number | string;
  title: string | null;
  body: string;
  photo_url: string | null;
  photo_note: string | null;
  source: string | null;
  verified_purchase: boolean | null;
  review_date: string | null;
};

function toNumber(value: unknown, fallback = 5) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function rowToReview(row: ProductReviewRow, product: Product): ProductReview {
  const verified = row.verified_purchase === true;
  return {
    id: row.id,
    name: row.customer_name,
    location: row.customer_location ?? "Customer",
    rating: Math.max(1, Math.min(5, Math.round(toNumber(row.rating)))),
    title: row.title ?? "Verified customer review",
    text: row.body,
    photo: row.photo_url ?? product.gallery[0] ?? product.image,
    note: row.photo_note ?? "Customer delivery photo",
    badge: verified ? "Verified purchase" : "Approved review",
    date: row.review_date ?? undefined,
    source: row.source ?? "Customer submitted review",
    verifiedPurchase: verified,
  };
}

export async function loadProductReviews(product: Product): Promise<ProductReview[]> {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return getStarterProductReviews(product);

  const params = new URLSearchParams({
    select: "*",
    product_slug: `eq.${product.slug}`,
    status: "eq.approved",
    order: "review_date.desc,created_at.desc",
    limit: "6",
  });

  const response = await fetch(`${url}/rest/v1/product_reviews?${params.toString()}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return getStarterProductReviews(product);

  const rows = (await response.json()) as ProductReviewRow[];
  if (rows.length === 0) return getStarterProductReviews(product);

  return rows.map((row) => rowToReview(row, product));
}

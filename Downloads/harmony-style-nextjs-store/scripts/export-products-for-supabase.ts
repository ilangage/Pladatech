import { writeFileSync } from "fs";
import path from "path";
import { products } from "../data/products";

const rows = products.map((product) => ({
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
  sort_order: product.id,
}));

const outPath = path.join(process.cwd(), "supabase", "seed-products.json");
writeFileSync(outPath, JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} product rows to ${outPath}`);

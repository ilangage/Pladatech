"use client";

import { useCart } from "@/components/cart-context";
import type { Bundle, Product } from "@/data/store";

export default function BundleAdd({ products, bundle }: { products: Product[]; bundle: Bundle }) {
  const { addToCart } = useCart();
  const disabled = products.length === 0 || products.some((product) => product.stock <= 0);
  const bundleProduct: Product = {
    id: `bundle-${bundle.slug}`,
    title: bundle.name,
    slug: bundle.slug,
    brand: "Pladatech",
    category: products[0]?.category ?? "Smart Cleaning",
    categorySlug: "bundles",
    price: bundle.price,
    oldPrice: bundle.comparePrice,
    rating: 5,
    reviewCount: 0,
    badge: "Bundle deal",
    badgeKey: "sale",
    stock: products.length ? Math.min(...products.map((product) => product.stock)) : 0,
    colors: ["#111827"],
    specs: [{ label: "Bundle", value: `${products.length} items` }],
    image: bundle.image,
    hoverImage: bundle.image,
    gallery: [bundle.image],
    description: bundle.description,
    shortDescription: bundle.description,
    features: products.map((product) => product.title),
    whatIncluded: products.map((product) => product.title),
    whyCustomersLoveIt: ["Bundle price is applied at checkout.", "Included item stock is reserved together."],
    fullSpecs: [{ label: "Included products", value: products.map((product) => product.title).join(", ") }],
    shippingReturns: "Bundle ships together where possible. Eligible unused items follow the 30-day return policy.",
    tags: ["bundle", ...products.flatMap((product) => product.tags).slice(0, 6)],
    seoTitle: `${bundle.name} | Pladatech`,
    seoDescription: bundle.description,
    relatedSlugs: products.map((product) => product.slug),
    sortOrder: 0,
    isActive: !disabled,
  };

  return (
    <button type="button" className="dark-button" disabled={disabled} onClick={() => addToCart(bundleProduct, 1)}>
      {disabled ? "Bundle unavailable" : "Add bundle to cart"}
    </button>
  );
}

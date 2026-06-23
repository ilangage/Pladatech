"use client";

import { useMemo, useState } from "react";
import {
  getWholesaleCategory,
  getWholesaleSubcategoryLabel,
  normalizeWholesaleCategory,
  wholesaleCategories,
} from "@/data/wholesale-categories";
import { normalizeWholesalePriceTiers } from "@/data/wholesale-pricing";
import type { WholesaleBanner, WholesaleProduct } from "@/data/wholesale-types";
import WholesaleHeroSlider from "./WholesaleHeroSlider";
import WholesaleProductCard from "./WholesaleProductCard";

const wholesaleBenefits = [
  { title: "Single Item Available", copy: "Start with one unit before scaling into bulk orders." },
  { title: "Bulk Discounts", copy: "Clear 1–5, 5–15, 15–99, and 100+ price tiers." },
  { title: "Cash on Delivery", copy: "COD can be confirmed where possible before dispatch." },
  { title: "Islandwide Delivery", copy: "Delivery options can be confirmed before ordering." },
  { title: "Marketing Photos Available", copy: "Product media may be available for reseller campaigns." },
];

type SortMode = "featured" | "newest" | "price-asc" | "price-desc";

type WholesaleProductsPageProps = {
  products: WholesaleProduct[];
  banners: WholesaleBanner[];
  cloudinaryCloudName: string;
};

function getEntryPrice(product: WholesaleProduct) {
  return normalizeWholesalePriceTiers(product.priceTiers)[0]?.unitPrice ?? product.retailPrice ?? 0;
}

function sectionFallback(products: WholesaleProduct[], count = 4) {
  return products.slice(0, count);
}

function getProductSections(products: WholesaleProduct[]) {
  const sorted = [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const hotDeals = sorted.filter((product) => product.dealTag || product.isFeatured);
  const underThousand = sorted.filter((product) => getEntryPrice(product) <= 1000);
  const newArrivals = sorted.filter((product) => product.isNewArrival);
  const resellerPicks = sorted.filter((product) => product.isFeatured);
  const used = new Set<string>();

  function takeUnique(items: WholesaleProduct[], fallback: WholesaleProduct[] = sorted, count = 4) {
    const picked: WholesaleProduct[] = [];
    for (const product of [...items, ...fallback]) {
      if (picked.length >= count) break;
      if (used.has(product.id)) continue;
      used.add(product.id);
      picked.push(product);
    }
    return picked;
  }

  return [
    {
      id: "hot-wholesale-deals",
      eyebrow: "Fast movers",
      title: "Hot Wholesale Deals",
      copy: "Easy-to-present products with strong reseller potential.",
      products: takeUnique(hotDeals.length ? hotDeals : sectionFallback(sorted)),
    },
    {
      id: "under-rs-1000",
      eyebrow: "Low-ticket stock",
      title: "Under Rs. 1,000",
      copy: "Impulse-friendly products for live sellers and small promotions.",
      products: takeUnique(underThousand),
    },
    {
      id: "new-arrivals",
      eyebrow: "Fresh picks",
      title: "New Arrivals",
      copy: "Newer products for fresh content and offer testing.",
      products: takeUnique(newArrivals.length ? newArrivals : sorted.slice(-4)),
    },
    {
      id: "best-for-resellers",
      eyebrow: "Seller focus",
      title: "Best for Resellers",
      copy: "Products that are simple to explain, demo, and bundle.",
      products: takeUnique(resellerPicks.length ? resellerPicks : sectionFallback(sorted)),
    },
  ].filter((section) => section.products.length);
}

export default function WholesaleProductsPage({ products, banners, cloudinaryCloudName }: WholesaleProductsPageProps) {
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("featured");
  const [filters, setFilters] = useState({
    inStock: false,
    cod: false,
    single: false,
    underThousand: false,
    featured: false,
    newArrival: false,
  });

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>([["all", products.filter((product) => product.isActive).length]]);
    for (const product of products) {
      if (!product.isActive) continue;
      const normalizedCategory = normalizeWholesaleCategory(product.category);
      counts.set(normalizedCategory, (counts.get(normalizedCategory) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((product) => {
        if (!product.isActive) return false;
        const normalizedCategory = normalizeWholesaleCategory(product.category);
        if (category !== "all" && normalizedCategory !== category) return false;
        if (subcategory !== "all" && product.subcategory !== subcategory) return false;
        if (filters.inStock && product.stockStatus === "out_of_stock") return false;
        if (filters.cod && product.codAvailable === false) return false;
        if (filters.single && product.singleItemAvailable === false) return false;
        if (filters.underThousand && getEntryPrice(product) > 1000) return false;
        if (filters.featured && !product.isFeatured) return false;
        if (filters.newArrival && !product.isNewArrival) return false;
        if (!term) return true;
        const haystack = [
          product.title,
          product.slug,
          product.shortDescription,
          product.dealTag,
          getWholesaleCategory(product.category).label,
          getWholesaleSubcategoryLabel(product.category, product.subcategory),
          ...(product.tags ?? []),
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => {
        if (sort === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (sort === "price-asc") return getEntryPrice(a) - getEntryPrice(b);
        if (sort === "price-desc") return getEntryPrice(b) - getEntryPrice(a);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      });
  }, [category, filters, products, search, sort, subcategory]);

  const selectedCategory = getWholesaleCategory(category);
  const productSections = useMemo(() => getProductSections(filteredProducts), [filteredProducts]);
  const selectedSubcategories = category === "all" ? [] : selectedCategory.subcategories ?? [];

  function updateCategory(nextCategory: string) {
    setCategory(nextCategory);
    setSubcategory("all");
  }

  function toggleFilter(key: keyof typeof filters) {
    setFilters((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="wholesale-page">
      <WholesaleHeroSlider banners={banners} cloudinaryCloudName={cloudinaryCloudName} />

      <div className="wholesale-trust-strip" aria-label="Wholesale support highlights">
        <span>Single item available</span>
        <span>Bulk discounts</span>
        <span>Cash on Delivery</span>
        <span>Islandwide delivery</span>
        <span>Marketing photos available</span>
      </div>

      <nav className="wholesale-category-filter" aria-label="Wholesale product categories">
        {wholesaleCategories.map((item) => (
          <button
            key={item.value}
            type="button"
            className={category === item.value ? "active" : ""}
            onClick={() => updateCategory(item.value)}
            aria-pressed={category === item.value}
          >
            <strong>{item.label}</strong>
            <small>{categoryCounts.get(item.value) ?? 0}</small>
          </button>
        ))}
      </nav>

      <section className="wholesale-controls" aria-label="Wholesale search and filters">
        <label className="wholesale-search-field">
          <span>Search wholesale products</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, tag, category..." />
        </label>
        <label className="wholesale-sort-field">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </label>
        <div className="wholesale-filter-chips" aria-label="Wholesale filters">
          <button type="button" className={filters.inStock ? "active" : ""} onClick={() => toggleFilter("inStock")}>In stock</button>
          <button type="button" className={filters.cod ? "active" : ""} onClick={() => toggleFilter("cod")}>COD available</button>
          <button type="button" className={filters.single ? "active" : ""} onClick={() => toggleFilter("single")}>Single item</button>
          <button type="button" className={filters.underThousand ? "active" : ""} onClick={() => toggleFilter("underThousand")}>Under Rs. 1,000</button>
          <button type="button" className={filters.featured ? "active" : ""} onClick={() => toggleFilter("featured")}>Featured</button>
          <button type="button" className={filters.newArrival ? "active" : ""} onClick={() => toggleFilter("newArrival")}>New arrivals</button>
        </div>
      </section>

      {selectedSubcategories.length ? (
        <nav className="wholesale-subcategory-filter" aria-label="Wholesale subcategories">
          <button type="button" className={subcategory === "all" ? "active" : ""} onClick={() => setSubcategory("all")}>All {selectedCategory.label}</button>
          {selectedSubcategories.map((item) => (
            <button key={item.value} type="button" className={subcategory === item.value ? "active" : ""} onClick={() => setSubcategory(item.value)}>
              {item.label}
            </button>
          ))}
        </nav>
      ) : null}

      <section className="wholesale-products-section" aria-live="polite">
        <div className="wholesale-results-head">
          <div>
            <span>Wholesale catalog</span>
            <h2>{selectedCategory.label}</h2>
            {selectedCategory.description ? <p className="wholesale-category-description">{selectedCategory.description}</p> : null}
          </div>
          <p className="wholesale-count">{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}</p>
        </div>

        {productSections.length ? (
          <div className="wholesale-section-stack">
            {productSections.map((section) => (
              <section className="wholesale-discovery-section" id={section.id} key={section.id}>
                <div className="wholesale-section-header">
                  <div>
                    <span>{section.eyebrow}</span>
                    <h3>{section.title}</h3>
                    <p>{section.copy}</p>
                  </div>
                  <small>{section.products.length} item{section.products.length === 1 ? "" : "s"}</small>
                </div>
                <div className="wholesale-product-grid">
                  {section.products.map((product) => (
                    <WholesaleProductCard
                      key={`${section.id}-${product.id}`}
                      product={product}
                      cloudinaryCloudName={cloudinaryCloudName}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="wholesale-empty">
            <strong>No active products in this category yet.</strong>
            <p>Choose another category to continue browsing the wholesale catalog.</p>
          </div>
        )}

        {filteredProducts.length ? (
          <section className="wholesale-discovery-section" id="all-wholesale-products">
            <div className="wholesale-section-header">
              <div>
                <span>Complete catalog</span>
                <h3>All Wholesale Products</h3>
                <p>Browse every product matching your search, category, and filter selections.</p>
              </div>
              <small>{filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"}</small>
            </div>
            <div className="wholesale-product-grid">
              {filteredProducts.map((product) => (
                <WholesaleProductCard key={`all-${product.id}`} product={product} cloudinaryCloudName={cloudinaryCloudName} />
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <section className="wholesale-benefits" aria-label="Wholesale benefits">
        {wholesaleBenefits.map((benefit) => (
          <article key={benefit.title}>
            <i aria-hidden="true">✓</i>
            <div>
              <strong>{benefit.title}</strong>
              <span>{benefit.copy}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

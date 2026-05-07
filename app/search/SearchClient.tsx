"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { categoryList } from "@/data/categories";

type SortMode = "relevance" | "price-low" | "price-high" | "rating";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function typoMatch(haystack: string, needle: string) {
  if (!needle) return true;
  const cleanHaystack = normalize(haystack);
  const cleanNeedle = normalize(needle);
  if (cleanHaystack.includes(cleanNeedle)) return true;
  const terms = cleanNeedle.split(" ").filter(Boolean);
  return terms.every((term) => cleanHaystack.split(" ").some((word) => word.includes(term) || term.includes(word) || Math.abs(word.length - term.length) <= 2 && word[0] === term[0]));
}

export default function SearchClient({ products, initialQuery }: { products: Product[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");

  const results = useMemo(() => {
    let list = products.filter((product) =>
      typoMatch(`${product.title} ${product.category} ${product.brand} ${product.tags.join(" ")} ${product.shortDescription}`, query),
    );

    if (category !== "All") list = list.filter((product) => product.category === category);
    if (maxPrice !== "all") list = list.filter((product) => product.price <= Number(maxPrice));
    if (minRating !== "all") list = list.filter((product) => product.rating >= Number(minRating));

    if (sortMode === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sortMode === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sortMode === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [category, maxPrice, minRating, products, query, sortMode]);

  return (
    <div className="search-page">
      <div className="search-page-head">
        <span>Product search</span>
        <h1>Find the right smart essential</h1>
        <p>Search by product type, category, use case, price, or rating.</p>
      </div>
      <div className="search-page-controls">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try vacuum, air fryer, pet camera, charger..." />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="All">All categories</option>
          {categoryList.map((item) => (
            <option key={item.name} value={item.name}>{item.name}</option>
          ))}
        </select>
        <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
          <option value="all">Any price</option>
          <option value="100">Under $100</option>
          <option value="200">Under $200</option>
          <option value="350">Under $350</option>
        </select>
        <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
          <option value="all">Any rating</option>
          <option value="4.5">4.5+ rating</option>
          <option value="4.8">4.8+ rating</option>
        </select>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
          <option value="relevance">Relevance</option>
          <option value="price-low">Price low to high</option>
          <option value="price-high">Price high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
      <div className="search-page-meta">Showing {results.length} of {products.length} products</div>
      <div className="search-page-grid">
        {results.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="search-page-card">
            <img src={product.image} alt={product.title} />
            <div>
              <span>{product.category}</span>
              <strong>{product.title}</strong>
              <p>{product.shortDescription}</p>
              <small>{product.rating.toFixed(1)} rating · {product.reviewCount} reviews</small>
            </div>
            <b>{formatPrice(product.price)}</b>
          </Link>
        ))}
      </div>
      {results.length === 0 ? (
        <div className="search-page-empty">
          <strong>No matching products found.</strong>
          <p>Try a broader term or clear one of the filters.</p>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getWholesaleCategoryLabel,
  getWholesaleSubcategoryLabel,
  normalizeWholesaleCategory,
  wholesaleCategoryOptions,
} from "@/data/wholesale-categories";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import type { WholesaleProductRow } from "@/lib/admin-wholesale-products";

type StatusFilter = "all" | "active" | "inactive";
type MerchFilter = "all" | "featured" | "new" | "cod" | "single";

function formatLkr(value: number | string | null) {
  const number = Number(value ?? 0);
  return `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(Number.isFinite(number) ? number : 0)}`;
}

function stockLabel(status: WholesaleProductRow["stock_status"]) {
  if (status === "out_of_stock") return "Out of stock";
  if (status === "low_stock") return "Low stock";
  return "In stock";
}

export default function AdminWholesaleProductsClient({
  initialProducts,
  cloudinaryCloudName,
}: {
  initialProducts: WholesaleProductRow[];
  cloudinaryCloudName: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [merch, setMerch] = useState<MerchFilter>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const activeCount = useMemo(() => products.filter((product) => product.is_active).length, [products]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...products]
      .filter((product) => {
        const normalizedCategory = normalizeWholesaleCategory(product.category);
        const normalizedFilter = category && category.toLowerCase() !== "all" ? normalizeWholesaleCategory(category) : "all";
        if (normalizedFilter !== "all" && normalizedCategory !== normalizedFilter) return false;
        if (status === "active" && !product.is_active) return false;
        if (status === "inactive" && product.is_active) return false;
        if (merch === "featured" && !product.is_featured) return false;
        if (merch === "new" && !product.is_new_arrival) return false;
        if (merch === "cod" && !product.cod_available) return false;
        if (merch === "single" && !product.single_item_available) return false;
        if (!term) return true;
        return `${product.title} ${product.slug} ${product.deal_tag ?? ""} ${(product.tags ?? []).join(" ")} ${getWholesaleCategoryLabel(product.category)} ${getWholesaleSubcategoryLabel(product.category, product.subcategory)}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [category, merch, products, search, status]);

  async function mutateProduct(id: string, action: "toggle" | "delete") {
    setLoadingId(id);
    setError("");
    try {
      const current = products.find((product) => product.id === id);
      const response = await fetch(`/api/admin/wholesale-products/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: action === "toggle" ? { "Content-Type": "application/json" } : undefined,
        body: action === "toggle" ? JSON.stringify({ is_active: !current?.is_active }) : undefined,
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; product?: WholesaleProductRow };
      if (!response.ok) throw new Error(result.error || "Wholesale product update failed.");

      if (action === "delete") {
        setProducts((items) => items.filter((product) => product.id !== id));
      } else if (result.product) {
        setProducts((items) => items.map((product) => (product.id === id ? result.product! : product)));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Wholesale product update failed.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>Wholesale Products</h1>
          <p>Manage the separate reseller and bulk catalog without changing retail products.</p>
        </div>
        <Link href="/admin/wholesale-products/new" className="admin-button">Add Wholesale Product</Link>
      </div>

      <div className="admin-stats admin-stats-compact">
        <article><strong>{products.length}</strong><span>Total products</span></article>
        <article><strong>{activeCount}</strong><span>Active</span></article>
        <article><strong>{products.length - activeCount}</strong><span>Archived / inactive</span></article>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <input className="admin-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, slug, category" />
          <button type="button" className="admin-link" onClick={() => setSearch("")}>Clear</button>
        </div>
        <select className="admin-input" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {wholesaleCategoryOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="admin-input" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Archived / inactive</option>
        </select>
        <select className="admin-input" value={merch} onChange={(event) => setMerch(event.target.value as MerchFilter)}>
          <option value="all">All merchandising</option>
          <option value="featured">Featured</option>
          <option value="new">New arrivals</option>
          <option value="cod">COD available</option>
          <option value="single">Single item</option>
        </select>
      </div>

      {!cloudinaryCloudName ? <div className="admin-alert admin-alert-warning">CLOUDINARY_CLOUD_NAME is not configured. Image previews use the Cloudinary demo fallback until it is added.</div> : null}
      {products.length === 0 ? <div className="admin-alert admin-alert-warning">No wholesale products found. Run <strong>supabase/wholesale-products-table.sql</strong>, then add the first product.</div> : null}
      {error ? <div className="admin-alert">{error}</div> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Product</th><th>Category</th><th>Offer</th><th>Retail price</th><th>Stock</th><th>Status</th><th>Sort</th><th /></tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const imageUrl = product.image_public_id ? getCloudinaryImageUrl(product.image_public_id, { cloudName: cloudinaryCloudName, width: 140 }) : "";
              return (
                <tr key={product.id}>
                  <td>{imageUrl ? <img className="admin-thumb" src={imageUrl} alt={product.title} /> : <div className="admin-thumb admin-thumb-empty">No image</div>}</td>
                  <td><strong>{product.title}</strong><div className="admin-muted">{product.slug}</div></td>
                  <td>
                    {getWholesaleCategoryLabel(product.category)}
                    {product.subcategory ? <div className="admin-muted">{getWholesaleSubcategoryLabel(product.category, product.subcategory)}</div> : null}
                  </td>
                  <td>
                    {product.single_item_available ? "Single item" : `${product.moq} min`}
                    {product.cod_available ? <div className="admin-muted">COD where possible</div> : null}
                    {product.deal_tag ? <div className="admin-muted">{product.deal_tag}</div> : null}
                  </td>
                  <td>{formatLkr(product.retail_price)}</td>
                  <td>{stockLabel(product.stock_status)}</td>
                  <td>
                    <button type="button" className={`admin-pill ${product.is_active ? "admin-pill-active" : ""}`} onClick={() => mutateProduct(product.id, "toggle")} disabled={loadingId === product.id}>
                      {product.is_active ? "Active" : "Archived"}
                    </button>
                  </td>
                  <td>{product.sort_order}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link href={`/admin/wholesale-products/${product.id}/edit`} className="admin-link">Edit</Link>
                      <button type="button" className="admin-button admin-button-secondary" disabled={loadingId === product.id} onClick={() => window.confirm(`Permanently delete ${product.title}?`) && mutateProduct(product.id, "delete")}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="admin-empty"><div className="admin-empty-card"><strong>No wholesale products match these filters.</strong><p>Clear the filters or add a new wholesale product.</p></div></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categoryList } from "@/data/categories";
import type { ProductRow } from "@/lib/product-catalog";

type SortMode = "sort-order" | "created-desc";
type StatusFilter = "all" | "active" | "inactive";

function formatPrice(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default function AdminProductsClient({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("sort-order");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [error, setError] = useState("");

  const categoryCounts = useMemo(() => {
    return categoryList.map((item) => ({
      ...item,
      count: products.filter((product) => product.category === item.name).length,
    }));
  }, [products]);

  const activeCount = useMemo(() => products.filter((product) => product.is_active !== false).length, [products]);
  const inactiveCount = products.length - activeCount;

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return [...products]
      .filter((product) => {
        if (category !== "All" && product.category !== category) return false;
        if (status === "active" && product.is_active === false) return false;
        if (status === "inactive" && product.is_active !== false) return false;
        if (!term) return true;
        return `${product.title} ${product.slug} ${product.category}`.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        if (sortMode === "created-desc") {
          const right = Number.isFinite(new Date(b.created_at ?? "").getTime()) ? new Date(b.created_at ?? "").getTime() : 0;
          const left = Number.isFinite(new Date(a.created_at ?? "").getTime()) ? new Date(a.created_at ?? "").getTime() : 0;
          return right - left;
        }
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });
  }, [category, products, search, sortMode, status]);

  const selectedCategoryCount = useMemo(() => {
    if (category === "All") return products.length;
    return categoryCounts.find((item) => item.name === category)?.count ?? 0;
  }, [category, categoryCounts, products.length]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setStatus("all");
    setSortMode("sort-order");
  }

  async function seedDefaults() {
    setSeedLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/products/seed-defaults", { method: "POST" });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Seed failed");
      const data = (await response.json()) as { products?: ProductRow[] };
      if (data.products) {
        setProducts(data.products);
        resetFilters();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSeedLoading(false);
    }
  }

  async function mutateProduct(id: string, action: "delete" | "toggle", patch?: Partial<ProductRow>) {
    setLoadingId(id);
    setError("");
    try {
      if (action === "delete") {
        const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Delete failed");
        setProducts((current) => current.filter((product) => product.id !== id));
      } else {
        const current = products.find((product) => product.id === id);
        const response = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !current?.is_active, ...patch }),
        });
        if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Update failed");
        const data = (await response.json()) as { product?: ProductRow };
        if (data.product) {
          setProducts((currentList) => currentList.map((product) => (product.id === id ? data.product! : product)));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>Products</h1>
          <p>Manage the Pladatech catalog without touching the public storefront UI.</p>
        </div>
        <div className="admin-row-actions">
          <Link href="/admin/products/import" className="admin-button admin-button-secondary">
            Import Products
          </Link>
          <button type="button" className="admin-button admin-button-secondary" onClick={seedDefaults} disabled={seedLoading}>
            {seedLoading ? "Seeding..." : "Seed 16 Defaults"}
          </button>
          <Link href="/admin/products/new" className="admin-button">
            Add Product
          </Link>
        </div>
      </div>

      <div className="admin-stats">
        <article>
          <strong>{products.length}</strong>
          <span>Total products</span>
        </article>
        <article>
          <strong>{activeCount}</strong>
          <span>Active</span>
        </article>
        <article>
          <strong>{inactiveCount}</strong>
          <span>Inactive</span>
        </article>
        {categoryList.map((item) => {
          const count = categoryCounts.find((entry) => entry.slug === item.slug)?.count ?? 0;
          return (
            <article key={item.slug}>
              <strong>{count}</strong>
              <span>{item.name}</span>
            </article>
          );
        })}
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <input className="admin-input" placeholder="Search title, slug, category" value={search} onChange={(event) => setSearch(event.target.value)} />
          <button type="button" className="admin-link" onClick={() => setSearch("")}>
            Clear
          </button>
        </div>
        <select className="admin-input" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="All">All categories</option>
          {categoryCounts.map((item) => (
            <option key={item.slug} value={item.name}>
              {item.name} ({item.count})
            </option>
          ))}
        </select>
        <select className="admin-input" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
          <option value="sort-order">Sort order</option>
          <option value="created-desc">Newest first</option>
        </select>
      </div>

      <div className="admin-toolbar secondary">
        <div className="admin-pill-group">
          <button type="button" className={`admin-pill ${status === "all" ? "admin-pill-active" : ""}`} onClick={() => setStatus("all")}>
            All
          </button>
          <button type="button" className={`admin-pill ${status === "active" ? "admin-pill-active" : ""}`} onClick={() => setStatus("active")}>
            Active
          </button>
          <button type="button" className={`admin-pill ${status === "inactive" ? "admin-pill-active" : ""}`} onClick={() => setStatus("inactive")}>
            Inactive
          </button>
        </div>
        <div className="admin-toolbar-meta">
          <span>
            Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong>
          </span>
          <span>
            Category: <strong>{category === "All" ? "All" : `${category} (${selectedCategoryCount})`}</strong>
          </span>
          <button type="button" className="admin-link" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="admin-alert admin-alert-warning">
          No Supabase products yet. Seed the 16 starter products or import a JSON catalog to make the list editable.
        </div>
      ) : null}

      {error ? <div className="admin-alert">{error}</div> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Badge</th>
              <th>Status</th>
              <th>Sort</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.image_url ? <img src={product.image_url} alt={asText(product.image_alt) || product.title} className="admin-thumb" /> : <div className="admin-thumb admin-thumb-empty">No image</div>}
                </td>
                <td>
                  <strong>{product.title}</strong>
                  <div className="admin-muted">{product.slug}</div>
                </td>
                <td>{product.category}</td>
                <td>{formatPrice(product.price)}</td>
                <td>{product.stock ?? 0}</td>
                <td>{product.badge ?? "—"}</td>
                <td>
                  <button
                    type="button"
                    className={`admin-pill ${product.is_active ? "admin-pill-active" : ""}`}
                    onClick={() => mutateProduct(product.id, "toggle")}
                    disabled={loadingId === product.id}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>{product.sort_order ?? 0}</td>
                <td>
                  <div className="admin-row-actions">
                    <Link href={`/admin/products/${product.id}/edit`} className="admin-link">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={() => {
                        if (window.confirm(`Delete ${product.title}?`)) mutateProduct(product.id, "delete");
                      }}
                      disabled={loadingId === product.id}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="admin-empty">
                  <div className="admin-empty-card">
                    <strong>{products.length === 0 ? "No Supabase products found yet" : "No products match these filters"}</strong>
                    <p>
                      {products.length === 0
                        ? "Seed the starter catalog or import a JSON file with up to 500 products."
                        : "Try a different category, status, or clear the search to bring products back."}
                    </p>
                    <div className="admin-row-actions admin-empty-actions">
                      <button type="button" className="admin-button admin-button-secondary" onClick={resetFilters}>
                        Clear filters
                      </button>
                      <Link href="/admin/products/import" className="admin-button admin-button-secondary">
                        Import Products
                      </Link>
                      <button type="button" className="admin-button" onClick={seedDefaults} disabled={seedLoading}>
                        {seedLoading ? "Seeding..." : "Seed 16 Defaults"}
                      </button>
                      <Link href="/admin/products/new" className="admin-button">
                        Add Product
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

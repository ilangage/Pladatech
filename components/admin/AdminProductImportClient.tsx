"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductImportClient() {
  const router = useRouter();
  const [payload, setPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function importProducts() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const parsed = JSON.parse(payload) as unknown;
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; imported?: number };
      if (!response.ok) {
        throw new Error(data.error ?? "Import failed");
      }

      setMessage(`Imported ${data.imported ?? 0} products.`);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON or import failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setPayload(text);
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>Import Products</h1>
          <p>Paste a JSON array or load a JSON file with up to 1000 products. The import will upsert by slug.</p>
        </div>
        <div className="admin-row-actions">
          <Link href="/admin/products" className="admin-button admin-button-secondary">
            Back to Products
          </Link>
          <button type="button" className="admin-button admin-button-secondary" onClick={() => setPayload("[]")}>
            Clear
          </button>
        </div>
      </div>

      <div className="admin-toolbar secondary">
        <div className="admin-toolbar-meta">
          <span>Accepted fields: title, slug, category, price, stock, badge, image_url, features, specs, related_product_slugs.</span>
        </div>
      </div>

      <div className="admin-form">
        <label className="admin-field">
          <span>JSON file</span>
          <input
            className="admin-input"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              void handleFile(event.target.files?.[0] ?? null);
            }}
          />
        </label>

        <label className="admin-field">
          <span>Paste JSON array</span>
          <textarea
            className="admin-textarea"
            rows={18}
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            placeholder='[{ "title": "Product name", "slug": "product-name", "category": "Smart Cleaning", "price": 99 }]'
          />
        </label>

        {error ? <div className="admin-alert">{error}</div> : null}
        {message ? <div className="admin-alert admin-alert-warning">{message}</div> : null}

        <div className="admin-form-actions">
          <button type="button" className="admin-button admin-button-secondary" onClick={() => router.push("/admin/products")}>
            Cancel
          </button>
          <button type="button" className="admin-button" onClick={importProducts} disabled={loading || !payload.trim()}>
            {loading ? "Importing..." : "Import Products"}
          </button>
        </div>
      </div>
    </section>
  );
}

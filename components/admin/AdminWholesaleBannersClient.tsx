"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import type { WholesaleBannerRow } from "@/lib/admin-wholesale-banners";

export default function AdminWholesaleBannersClient({
  initialBanners,
  cloudinaryCloudName,
}: {
  initialBanners: WholesaleBannerRow[];
  cloudinaryCloudName: string;
}) {
  const [banners, setBanners] = useState(initialBanners);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const activeCount = useMemo(() => banners.filter((banner) => banner.is_active).length, [banners]);
  const filtered = useMemo(
    () =>
      banners
        .filter((banner) => {
          if (status === "active") return banner.is_active;
          if (status === "inactive") return !banner.is_active;
          return true;
        })
        .sort((a, b) => a.sort_order - b.sort_order),
    [banners, status],
  );

  async function mutateBanner(id: string, action: "toggle" | "delete") {
    setLoadingId(id);
    setError("");
    try {
      const current = banners.find((banner) => banner.id === id);
      const response = await fetch(`/api/admin/wholesale-banners/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: action === "toggle" ? { "Content-Type": "application/json" } : undefined,
        body: action === "toggle" ? JSON.stringify({ is_active: !current?.is_active }) : undefined,
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; banner?: WholesaleBannerRow };
      if (!response.ok) throw new Error(result.error || "Wholesale banner update failed.");

      if (action === "delete") {
        setBanners((items) => items.filter((banner) => banner.id !== id));
      } else if (result.banner) {
        setBanners((items) => items.map((banner) => (banner.id === id ? result.banner! : banner)));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Wholesale banner update failed.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>Wholesale Banners</h1>
          <p>Manage the hero slider banners for the public wholesale landing page.</p>
        </div>
        <Link href="/admin/wholesale-banners/new" className="admin-button">Add Banner</Link>
      </div>

      <div className="admin-stats admin-stats-compact">
        <article><strong>{banners.length}</strong><span>Total banners</span></article>
        <article><strong>{activeCount}</strong><span>Active</span></article>
        <article><strong>{banners.length - activeCount}</strong><span>Archived / inactive</span></article>
      </div>

      <div className="admin-toolbar">
        <select className="admin-input" value={status} onChange={(event) => setStatus(event.target.value as "all" | "active" | "inactive")}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Archived / inactive</option>
        </select>
      </div>

      {!cloudinaryCloudName ? <div className="admin-alert admin-alert-warning">CLOUDINARY_CLOUD_NAME is not configured. Image previews use the Cloudinary demo fallback until it is added.</div> : null}
      {banners.length === 0 ? <div className="admin-alert admin-alert-warning">No wholesale banners found. Run <strong>supabase/wholesale-banners-table.sql</strong>, then add your first banner.</div> : null}
      {error ? <div className="admin-alert">{error}</div> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Banner</th><th>CTA</th><th>Badge</th><th>Status</th><th>Sort</th><th /></tr>
          </thead>
          <tbody>
            {filtered.map((banner) => {
              const imageUrl = banner.image_public_id ? getCloudinaryImageUrl(banner.image_public_id, { cloudName: cloudinaryCloudName, width: 180 }) : "";
              return (
                <tr key={banner.id}>
                  <td>{imageUrl ? <img className="admin-thumb" src={imageUrl} alt={banner.title} /> : <div className="admin-thumb admin-thumb-empty">No image</div>}</td>
                  <td>
                    <strong>{banner.title}</strong>
                    {banner.subtitle ? <div className="admin-muted">{banner.subtitle}</div> : null}
                    <div className="admin-muted">{banner.image_public_id}</div>
                  </td>
                  <td>
                    {banner.cta_label ?? "No CTA"}
                    {banner.cta_href ? <div className="admin-muted">{banner.cta_href}</div> : null}
                  </td>
                  <td>{banner.badge ?? "-"}</td>
                  <td>
                    <button type="button" className={`admin-pill ${banner.is_active ? "admin-pill-active" : ""}`} onClick={() => mutateBanner(banner.id, "toggle")} disabled={loadingId === banner.id}>
                      {banner.is_active ? "Active" : "Archived"}
                    </button>
                  </td>
                  <td>{banner.sort_order}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link href={`/admin/wholesale-banners/${banner.id}/edit`} className="admin-link">Edit</Link>
                      <button type="button" className="admin-button admin-button-secondary" disabled={loadingId === banner.id} onClick={() => window.confirm(`Permanently delete ${banner.title}?`) && mutateBanner(banner.id, "delete")}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="admin-empty"><div className="admin-empty-card"><strong>No wholesale banners match this filter.</strong><p>Clear the filter or add a new banner.</p></div></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

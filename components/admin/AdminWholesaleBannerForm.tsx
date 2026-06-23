"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import type { WholesaleBannerRow } from "@/lib/admin-wholesale-banners";

type FormState = {
  title: string;
  subtitle: string;
  imagePublicId: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
  isActive: boolean;
  sortOrder: string;
};

function initialState(banner?: WholesaleBannerRow): FormState {
  return {
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    imagePublicId: banner?.image_public_id ?? "",
    ctaLabel: banner?.cta_label ?? "",
    ctaHref: banner?.cta_href ?? "",
    badge: banner?.badge ?? "",
    isActive: banner?.is_active ?? true,
    sortOrder: String(banner?.sort_order ?? 0),
  };
}

export default function AdminWholesaleBannerForm({ mode, banner, cloudinaryCloudName }: { mode: "create" | "edit"; banner?: WholesaleBannerRow; cloudinaryCloudName: string }) {
  const router = useRouter();
  const [state, setState] = useState(() => initialState(banner));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = state.imagePublicId.trim() ? getCloudinaryImageUrl(state.imagePublicId, { cloudName: cloudinaryCloudName, width: 900 }) : "";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: state.title,
      subtitle: state.subtitle,
      image_public_id: state.imagePublicId,
      cta_label: state.ctaLabel,
      cta_href: state.ctaHref,
      badge: state.badge,
      is_active: state.isActive,
      sort_order: state.sortOrder,
    };

    try {
      const endpoint = mode === "create" ? "/api/admin/wholesale-banners" : `/api/admin/wholesale-banners/${banner?.id}`;
      const response = await fetch(endpoint, { method: mode === "create" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Wholesale banner could not be saved.");
      router.push("/admin/wholesale-banners");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Wholesale banner could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div><h1>{mode === "create" ? "Add Wholesale Banner" : "Edit Wholesale Banner"}</h1><p>Store Cloudinary public IDs only. Do not paste full image URLs.</p></div>
        <Link href="/admin/wholesale-banners" className="admin-button admin-button-secondary">Back to banners</Link>
      </div>

      {!cloudinaryCloudName ? <div className="admin-alert admin-alert-warning">CLOUDINARY_CLOUD_NAME is not configured. Preview uses the Cloudinary demo fallback.</div> : null}
      {error ? <div className="admin-alert">{error}</div> : null}

      <form className="admin-form" onSubmit={submit}>
        <div className="admin-grid-two">
          <label className="admin-field"><span>Title *</span><input className="admin-input" required value={state.title} onChange={(event) => update("title", event.target.value)} /></label>
          <label className="admin-field"><span>Badge</span><input className="admin-input" value={state.badge} onChange={(event) => update("badge", event.target.value)} placeholder="Hot wholesale picks" /></label>
        </div>

        <label className="admin-field"><span>Subtitle</span><textarea className="admin-textarea" rows={3} value={state.subtitle} onChange={(event) => update("subtitle", event.target.value)} /></label>

        <div className="admin-grid-two">
          <label className="admin-field">
            <span>Image public ID *</span>
            <input className="admin-input" required placeholder="wholesale/banners/fast-moving-products" value={state.imagePublicId} onChange={(event) => update("imagePublicId", event.target.value)} />
            <small className="admin-muted">Example: wholesale/banners/fast-moving-products</small>
          </label>
          <div className="admin-wholesale-preview">{previewUrl ? <img src={previewUrl} alt="Cloudinary preview" /> : <span>Enter a public ID to preview the banner image.</span>}</div>
        </div>

        <div className="admin-grid-three">
          <label className="admin-field"><span>CTA label</span><input className="admin-input" value={state.ctaLabel} onChange={(event) => update("ctaLabel", event.target.value)} placeholder="Browse hot deals" /></label>
          <label className="admin-field"><span>CTA href</span><input className="admin-input" value={state.ctaHref} onChange={(event) => update("ctaHref", event.target.value)} placeholder="/wholesale#hot-wholesale-deals" /></label>
          <label className="admin-field"><span>Sort order</span><input className="admin-input" type="number" step="1" value={state.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} /></label>
        </div>

        <div className="admin-checks"><label><input type="checkbox" checked={state.isActive} onChange={(event) => update("isActive", event.target.checked)} /> Active on public wholesale hero</label></div>
        <div className="admin-form-actions"><Link href="/admin/wholesale-banners" className="admin-button admin-button-secondary">Cancel</Link><button className="admin-button" type="submit" disabled={saving}>{saving ? "Saving..." : mode === "create" ? "Create Banner" : "Save Changes"}</button></div>
      </form>
    </section>
  );
}

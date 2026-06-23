import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type WholesaleBannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_public_id: string;
  cta_label: string | null;
  cta_href: string | null;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

export type WholesaleBannerWritePayload = {
  title: string;
  subtitle: string | null;
  image_public_id: string;
  cta_label: string | null;
  cta_href: string | null;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasFullUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function normalizeRow(row: WholesaleBannerRow): WholesaleBannerRow {
  return {
    ...row,
    subtitle: row.subtitle ?? null,
    cta_label: row.cta_label ?? null,
    cta_href: row.cta_href ?? null,
    badge: row.badge ?? null,
    is_active: row.is_active !== false,
    sort_order: Number(row.sort_order ?? 0),
  };
}

export function parseWholesaleBannerPayload(body: Record<string, unknown>):
  | { ok: true; payload: WholesaleBannerWritePayload }
  | { ok: false; error: string } {
  const title = clean(body.title);
  const imagePublicId = clean(body.image_public_id);
  const sortOrder = Number(body.sort_order ?? 0);
  const ctaHref = clean(body.cta_href);

  if (!title) return { ok: false, error: "Title is required." };
  if (!imagePublicId) return { ok: false, error: "Image public ID is required." };
  if (hasFullUrl(imagePublicId)) return { ok: false, error: "Image must be a Cloudinary public ID, not a full URL." };
  if (!Number.isInteger(sortOrder)) return { ok: false, error: "Sort order must be a whole number." };

  return {
    ok: true,
    payload: {
      title,
      subtitle: clean(body.subtitle) || null,
      image_public_id: imagePublicId,
      cta_label: clean(body.cta_label) || null,
      cta_href: ctaHref || null,
      badge: clean(body.badge) || null,
      is_active: body.is_active !== false,
      sort_order: sortOrder,
    },
  };
}

export async function getAdminWholesaleBanners() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_banners").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) {
    console.error("Wholesale banner load failed:", error);
    return [];
  }
  return (data ?? []).map((row) => normalizeRow(row as WholesaleBannerRow));
}

export async function getAdminWholesaleBannerById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_banners").select("*").eq("id", id).single();
  if (error) return null;
  return normalizeRow(data as WholesaleBannerRow);
}

export async function createAdminWholesaleBanner(payload: WholesaleBannerWritePayload) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_banners").insert(payload).select("*").single();
  if (error) throw error;
  return normalizeRow(data as WholesaleBannerRow);
}

export async function updateAdminWholesaleBanner(id: string, payload: Partial<WholesaleBannerWritePayload>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("wholesale_banners")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return normalizeRow(data as WholesaleBannerRow);
}

export async function deleteAdminWholesaleBanner(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("wholesale_banners").delete().eq("id", id).select("*").single();
  if (error) throw error;
  return normalizeRow(data as WholesaleBannerRow);
}

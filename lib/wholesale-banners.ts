import "server-only";

import { wholesaleBanners as fallbackBanners } from "@/data/wholesale-banners";
import type { WholesaleBanner } from "@/data/wholesale-types";
import { getSupabaseConfig } from "@/lib/supabase-config";

type WholesaleBannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_public_id: string | null;
  cta_label: string | null;
  cta_href: string | null;
  badge: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function mapWholesaleBannerRow(row: WholesaleBannerRow): WholesaleBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: text(row.subtitle) || undefined,
    imagePublicId: text(row.image_public_id),
    ctaLabel: text(row.cta_label) || undefined,
    ctaHref: text(row.cta_href) || undefined,
    badge: text(row.badge) || undefined,
    isActive: row.is_active ?? true,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export async function loadWholesaleBanners() {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return fallbackBanners;

  const params = new URLSearchParams({
    select: "*",
    is_active: "eq.true",
    order: "sort_order.asc,created_at.asc",
  });

  try {
    const response = await fetch(`${url}/rest/v1/wholesale_banners?${params.toString()}`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return fallbackBanners;

    const rows = (await response.json()) as WholesaleBannerRow[];
    if (!rows.length) return fallbackBanners;

    return rows.map(mapWholesaleBannerRow).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return fallbackBanners;
  }
}

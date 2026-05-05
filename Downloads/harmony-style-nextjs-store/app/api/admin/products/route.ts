import { NextResponse } from "next/server";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { createAdminProduct, getAdminProducts } from "@/lib/admin-products";
import type { ProductWritePayload } from "@/lib/admin-products";
import { getSupabaseConfig } from "@/lib/supabase-config";

function requireAdmin() {
  return getAuthenticatedAdminUser().then((user) => {
    if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    if (!isAdminEmailAllowed(user.email)) return { ok: false as const, response: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
    return { ok: true as const, user };
  });
}

async function slugExists(slug: string) {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  if (!url || !anonKey || !serviceRoleKey) return false;
  const response = await fetch(`${url}/rest/v1/products?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length > 0;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const products = await getAdminProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const payload = (await request.json().catch(() => ({}))) as Partial<ProductWritePayload>;
  if (!payload.title || !payload.slug || !payload.category || typeof payload.price !== "number" || Number.isNaN(payload.price)) {
    return NextResponse.json({ error: "Title, slug, category and price are required." }, { status: 400 });
  }
  if (await slugExists(payload.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  try {
    const rows = await createAdminProduct(payload as ProductWritePayload);
    return NextResponse.json({ product: rows[0] ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create product." }, { status: 400 });
  }
}

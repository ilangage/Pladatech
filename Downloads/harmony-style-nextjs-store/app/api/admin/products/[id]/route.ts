import { NextResponse } from "next/server";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/admin-products";
import type { ProductWritePayload } from "@/lib/admin-products";
import { getSupabaseConfig } from "@/lib/supabase-config";

async function requireAdmin() {
  const user = await getAuthenticatedAdminUser();
  if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdminEmailAllowed(user.email)) return { ok: false as const, response: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  return { ok: true as const, user };
}

async function slugExists(slug: string, id: string) {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  if (!url || !anonKey || !serviceRoleKey) return false;
  const response = await fetch(`${url}/rest/v1/products?select=id&slug=eq.${encodeURIComponent(slug)}&limit=5`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.some((row) => row.id !== id);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Partial<ProductWritePayload>;
  if (payload.slug && (await slugExists(payload.slug, id))) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  try {
    const rows = await updateAdminProduct(id, payload);
    return NextResponse.json({ product: rows[0] ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update product." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await deleteAdminProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete product." }, { status: 400 });
  }
}

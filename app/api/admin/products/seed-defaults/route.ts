import { NextResponse } from "next/server";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { bulkUpsertAdminProducts, mapProductToWritePayload } from "@/lib/admin-products";
import { products as fallbackProducts } from "@/data/products";

async function requireAdmin() {
  const user = await getAuthenticatedAdminUser();
  if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdminEmailAllowed(user.email)) return { ok: false as const, response: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  return { ok: true as const, user };
}

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const payloads = fallbackProducts.map(mapProductToWritePayload);
    const products = await bulkUpsertAdminProducts(payloads);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to seed default products." }, { status: 400 });
  }
}

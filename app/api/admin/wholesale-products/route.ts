import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { createAdminWholesaleProduct, parseWholesaleProductPayload } from "@/lib/admin-wholesale-products";

async function requireAdmin() {
  const user = await getAuthenticatedAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminEmailAllowed(user.email)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  return null;
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid product payload." }, { status: 400 });

  const parsed = parseWholesaleProductPayload(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const product = await createAdminWholesaleProduct(parsed.payload);
    revalidatePath("/admin/wholesale-products");
    revalidatePath("/wholesale");
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create wholesale product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

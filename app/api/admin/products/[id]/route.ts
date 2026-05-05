import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/admin-products";
import type { ProductWritePayload } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await getAuthenticatedAdminUser();
  if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdminEmailAllowed(user.email)) return { ok: false as const, response: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  return { ok: true as const, user };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  console.log("Admin update route hit", id);
  const payload = (await request.json().catch(() => ({}))) as Partial<ProductWritePayload>;
  console.log("Payload keys", Object.keys(payload));
  console.log("Using service role", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));

  try {
    const product = await updateAdminProduct(id, payload);
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update product.",
        details: error instanceof Error ? { name: error.name, message: error.message } : null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const product = await deleteAdminProduct(id);
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete product." }, { status: 500 });
  }
}

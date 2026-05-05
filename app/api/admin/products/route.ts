import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { createAdminProduct, getAdminProducts } from "@/lib/admin-products";
import type { ProductWritePayload } from "@/lib/admin-products";

function requireAdmin() {
  return getAuthenticatedAdminUser().then((user) => {
    if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    if (!isAdminEmailAllowed(user.email)) return { ok: false as const, response: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
    return { ok: true as const, user };
  });
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

  try {
    const product = await createAdminProduct(payload as ProductWritePayload);
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create product.",
        details: error instanceof Error ? { name: error.name, message: error.message } : null,
      },
      { status: 500 }
    );
  }
}

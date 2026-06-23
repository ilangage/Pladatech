import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import {
  deleteAdminWholesaleProduct,
  parseWholesaleProductPayload,
  updateAdminWholesaleProduct,
  type WholesaleProductWritePayload,
} from "@/lib/admin-wholesale-products";

type Props = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const user = await getAuthenticatedAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminEmailAllowed(user.email)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  return null;
}

export async function PATCH(request: Request, { params }: Props) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid product payload." }, { status: 400 });

  let payload: Partial<WholesaleProductWritePayload>;
  if (Object.keys(body).length === 1 && typeof body.is_active === "boolean") {
    payload = { is_active: body.is_active };
  } else {
    const parsed = parseWholesaleProductPayload(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    payload = parsed.payload;
  }

  try {
    const product = await updateAdminWholesaleProduct(id, payload);
    revalidatePath("/admin/wholesale-products");
    revalidatePath(`/admin/wholesale-products/${id}/edit`);
    revalidatePath("/wholesale");
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update wholesale product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  try {
    const product = await deleteAdminWholesaleProduct(id);
    revalidatePath("/admin/wholesale-products");
    revalidatePath("/wholesale");
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete wholesale product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

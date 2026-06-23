import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import {
  deleteAdminWholesaleBanner,
  parseWholesaleBannerPayload,
  updateAdminWholesaleBanner,
  type WholesaleBannerWritePayload,
} from "@/lib/admin-wholesale-banners";

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
  if (!body) return NextResponse.json({ error: "Invalid banner payload." }, { status: 400 });

  let payload: Partial<WholesaleBannerWritePayload>;
  if (Object.keys(body).length === 1 && typeof body.is_active === "boolean") {
    payload = { is_active: body.is_active };
  } else {
    const parsed = parseWholesaleBannerPayload(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    payload = parsed.payload;
  }

  try {
    const banner = await updateAdminWholesaleBanner(id, payload);
    revalidatePath("/admin/wholesale-banners");
    revalidatePath(`/admin/wholesale-banners/${id}/edit`);
    revalidatePath("/wholesale");
    return NextResponse.json({ banner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update wholesale banner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  try {
    const banner = await deleteAdminWholesaleBanner(id);
    revalidatePath("/admin/wholesale-banners");
    revalidatePath("/wholesale");
    return NextResponse.json({ banner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete wholesale banner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

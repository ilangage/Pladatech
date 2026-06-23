import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { createAdminWholesaleBanner, parseWholesaleBannerPayload } from "@/lib/admin-wholesale-banners";

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
  if (!body) return NextResponse.json({ error: "Invalid banner payload." }, { status: 400 });

  const parsed = parseWholesaleBannerPayload(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const banner = await createAdminWholesaleBanner(parsed.payload);
    revalidatePath("/admin/wholesale-banners");
    revalidatePath("/wholesale");
    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create wholesale banner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

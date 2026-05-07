import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { updateAdminOrder, type AdminOrderUpdatePayload } from "@/lib/orders";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

const paymentStatuses = new Set(["pending", "processing", "paid", "failed", "refunded"]);
const orderStatuses = new Set(["new", "confirmed", "processing", "fulfilled", "cancelled", "refunded"]);

async function requireAdmin() {
  const user = await getAuthenticatedAdminUser();
  if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdminEmailAllowed(user.email)) return { ok: false as const, response: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  return { ok: true as const, user };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { orderNumber } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const paymentStatus = clean(body.paymentStatus);
  const orderStatus = clean(body.orderStatus);

  if (paymentStatus && !paymentStatuses.has(paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
  }

  if (orderStatus && !orderStatuses.has(orderStatus)) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  const payload: AdminOrderUpdatePayload = {
    paymentStatus: paymentStatus || undefined,
    orderStatus: orderStatus || undefined,
    fulfillmentNote: clean(body.fulfillmentNote) || null,
    trackingNumber: clean(body.trackingNumber) || null,
    trackingUrl: clean(body.trackingUrl) || null,
    shippingProvider: clean(body.shippingProvider) || null,
    refundReason: clean(body.refundReason) || null,
  };

  try {
    const order = await updateAdminOrder(orderNumber, payload);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderNumber}`);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update order." }, { status: 500 });
  }
}

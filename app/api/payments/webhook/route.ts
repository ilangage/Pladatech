import { NextResponse } from "next/server";
import { mapNowPaymentsPaymentStatus, verifyNowPaymentsWebhookSignature } from "@/lib/payments/nowpayments";
import { updateOrderByGatewayPaymentId, updateOrderByOrderNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyNowPaymentsWebhookSignature(rawBody, request.headers)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const orderNumber = asString(payload.order_id ?? payload.orderId ?? payload.order_number);
  const paymentId = asString(payload.payment_id ?? payload.paymentId ?? payload.invoice_id ?? payload.iid);
  const status = asString(payload.payment_status ?? payload.status);
  const mapped = mapNowPaymentsPaymentStatus(status);
  const rawGatewayResponse = {
    ...payload,
    received_at: new Date().toISOString(),
  };

  try {
    const patch = {
      paymentStatus: mapped.paymentStatus,
      orderStatus: mapped.orderStatus,
      gatewayName: "nowpayments",
      gatewayPaymentId: paymentId || undefined,
      rawGatewayResponse,
    };

    const updatedOrder =
      (orderNumber ? await updateOrderByOrderNumber(orderNumber, patch) : null) ??
      (paymentId ? await updateOrderByGatewayPaymentId(paymentId, patch) : null);

    if (!updatedOrder) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      orderNumber: updatedOrder.order_number,
      paymentStatus: updatedOrder.payment_status,
      orderStatus: updatedOrder.order_status,
    });
  } catch (error) {
    console.error("NOWPayments webhook processing failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Webhook processing failed.",
      },
      { status: 500 },
    );
  }
}

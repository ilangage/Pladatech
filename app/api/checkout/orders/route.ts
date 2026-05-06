import { NextResponse } from "next/server";
import { createCheckoutOrder, updateOrderByOrderNumber } from "@/lib/orders";
import { validateCheckoutRequest } from "@/lib/checkout-validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateCheckoutRequest(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.errors[0] ?? "Invalid checkout request.", errors: validation.errors }, { status: 400 });
  }

  try {
    const order = await createCheckoutOrder(validation.data);
    let redirectUrl = order.redirectUrl;
    let gatewayInvoiceUrl = order.gatewayInvoiceUrl;
    let gatewayPaymentId = order.gatewayPaymentId;
    let gatewayName = order.gatewayName;
    let rawGatewayResponse: unknown = null;

    if (validation.data.paymentMethod === "crypto_nowpayments") {
      gatewayName = "nowpayments";
      rawGatewayResponse = {
        provider: "nowpayments",
        mode: "payment-selection",
        orderNumber: order.orderNumber,
      };

      await updateOrderByOrderNumber(order.orderNumber, {
        gatewayName,
        gatewayPaymentId: null,
        gatewayInvoiceUrl: null,
        paymentStatus: "pending",
        orderStatus: "new",
        rawGatewayResponse,
      });

      redirectUrl = `/checkout/pay/${encodeURIComponent(order.orderNumber)}`;
    }

    return NextResponse.json({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      currency: order.currency,
      total: order.total,
      gatewayName,
      gatewayPaymentId,
      gatewayInvoiceUrl,
      redirectUrl,
    });
  } catch (error) {
    console.error("Checkout order creation failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string"
          ? String((error as { message: string }).message)
          : "Failed to create order.";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}

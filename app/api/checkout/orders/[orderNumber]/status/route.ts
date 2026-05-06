import { NextResponse } from "next/server";
import { getOrderPaymentPageData } from "@/lib/orders";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const orderNumber = params.orderNumber?.trim() ?? "";

  if (!orderNumber) {
    return NextResponse.json({ error: "orderNumber is required." }, { status: 400 });
  }

  const order = await getOrderPaymentPageData(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    gatewayPaymentId: order.gateway_payment_id,
    payAmount: order.payAmount,
    payCurrency: order.payCurrency,
    payAddress: order.payAddress,
    qrCode: order.qrCode,
    paymentLink: order.paymentLink,
    selectedPayCurrency: order.selectedPayCurrency,
  });
}

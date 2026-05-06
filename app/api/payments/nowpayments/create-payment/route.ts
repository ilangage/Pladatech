import { NextResponse } from "next/server";
import { createNowPaymentsPayment } from "@/lib/payments/nowpayments";
import { isAllowedNowPaymentsPayCurrency } from "@/lib/payments/nowpayments-options";
import { getOrderPaymentPageData, updateOrderByOrderNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

type Body = {
  orderNumber?: unknown;
  payCurrency?: unknown;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildSafePayload(orderNumber: string, payment: Awaited<ReturnType<typeof createNowPaymentsPayment>>) {
  return {
    orderNumber,
    paymentId: payment.paymentId,
    paymentStatus: payment.paymentStatus,
    payAddress: payment.payAddress,
    payAmount: payment.payAmount,
    payCurrency: payment.payCurrency,
    priceAmount: payment.priceAmount,
    priceCurrency: payment.priceCurrency,
    qrCode: payment.qrCode,
    paymentLink: payment.paymentLink,
    redirectUrl: `/checkout/pay/${encodeURIComponent(orderNumber)}`,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const orderNumber = asString(body?.orderNumber);
  const payCurrency = asString(body?.payCurrency).toLowerCase();

  if (!orderNumber) {
    return NextResponse.json({ ok: false, error: "orderNumber is required." }, { status: 400 });
  }

  if (!isAllowedNowPaymentsPayCurrency(payCurrency)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid payCurrency. Use usdttrc20, usdterc20, btc, eth, or ltc.",
      },
      { status: 400 },
    );
  }

  const order = await getOrderPaymentPageData(orderNumber);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }

  if (order.payment_status === "paid") {
    return NextResponse.json(
      {
        ok: false,
        error: "This order has already been paid.",
      },
      { status: 409 },
    );
  }

  if (order.gateway_payment_id && (order.payAddress || order.paymentLink || order.qrCode)) {
    return NextResponse.json({
      ok: true,
      reused: true,
      ...buildSafePayload(orderNumber, {
        paymentId: order.gateway_payment_id,
        payAddress: order.payAddress,
        payAmount: order.payAmount,
        payCurrency: order.payCurrency,
        priceAmount: Number(order.priceAmount ?? order.total),
        priceCurrency: order.priceCurrency ?? order.currency,
        paymentStatus: order.payment_status,
        paymentLink: order.paymentLink,
        qrCode: order.qrCode,
        rawResponse: null,
      }),
    });
  }

  try {
    const payment = await createNowPaymentsPayment({
      orderNumber,
      amount: Number(order.total),
      currency: order.currency,
      description: `Pladatech order ${orderNumber}`,
      payCurrency,
      successPath: `/checkout/pay/${encodeURIComponent(orderNumber)}`,
      cancelPath: `/checkout/failed?order=${encodeURIComponent(orderNumber)}`,
      ipnPath: "/api/payments/webhook",
    });

    const rawPaymentResponse = payment.rawResponse && typeof payment.rawResponse === "object" ? (payment.rawResponse as Record<string, unknown>) : {};
    const rawGatewayResponse = {
      provider: "nowpayments",
      mode: "generated-payment",
      selected_pay_currency: payCurrency,
      orderNumber,
      ...rawPaymentResponse,
    };

    await updateOrderByOrderNumber(orderNumber, {
      gatewayName: "nowpayments",
      gatewayPaymentId: payment.paymentId,
      gatewayInvoiceUrl: payment.paymentLink,
      paymentStatus: payment.paymentStatus || "processing",
      orderStatus: "processing",
      rawGatewayResponse,
    });

    return NextResponse.json({
      ok: true,
      ...buildSafePayload(orderNumber, payment),
    });
  } catch (error) {
    console.error("NOWPayments payment creation failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "NOWPayments payment creation failed.",
      },
      { status: 502 },
    );
  }
}

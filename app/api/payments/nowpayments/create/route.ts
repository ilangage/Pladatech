import { NextResponse } from "next/server";
import { createNowPaymentsPayment } from "@/lib/payments/nowpayments";
import { updateOrderByOrderNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const orderNumber = typeof input.orderNumber === "string" ? input.orderNumber.trim() : "";
  const amount = Number(input.amount);
  const description = typeof input.description === "string" && input.description.trim() ? input.description.trim() : "";
  const currency = typeof input.currency === "string" && input.currency.trim() ? input.currency.trim() : "USD";
  const payCurrency =
    typeof input.payCurrency === "string" && input.payCurrency.trim()
      ? input.payCurrency.trim()
      : process.env.NOWPAYMENTS_DEFAULT_PAY_CURRENCY?.trim() || "btc";
  const successPath = typeof input.successPath === "string" && input.successPath.trim() ? input.successPath.trim() : undefined;
  const cancelPath = typeof input.cancelPath === "string" && input.cancelPath.trim() ? input.cancelPath.trim() : undefined;
  const ipnPath = typeof input.ipnPath === "string" && input.ipnPath.trim() ? input.ipnPath.trim() : undefined;

  if (!orderNumber) {
    return NextResponse.json({ ok: false, error: "orderNumber is required." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "amount must be greater than zero." }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ ok: false, error: "description is required." }, { status: 400 });
  }

  try {
    const payment = await createNowPaymentsPayment({
      orderNumber,
      amount,
      currency,
      description,
      payCurrency,
      successPath,
      cancelPath,
      ipnPath,
    });

    if (input.persistOrder !== false) {
      try {
        await updateOrderByOrderNumber(orderNumber, {
          gatewayName: "nowpayments",
          gatewayPaymentId: payment.paymentId,
          gatewayInvoiceUrl: payment.paymentLink,
          paymentStatus: "processing",
          orderStatus: "processing",
          rawGatewayResponse: payment.rawResponse,
        });
      } catch (error) {
        console.error("Failed to update order with NOWPayments invoice data:", error);
      }
    }

    return NextResponse.json({
      ok: true,
      orderNumber,
      paymentId: payment.paymentId,
      payAddress: payment.payAddress,
      payAmount: payment.payAmount,
      payCurrency: payment.payCurrency,
      priceAmount: payment.priceAmount,
      priceCurrency: payment.priceCurrency,
      paymentStatus: payment.paymentStatus,
      paymentLink: payment.paymentLink,
      redirectUrl: `/checkout/pay/${encodeURIComponent(orderNumber)}`,
    });
  } catch (error) {
    console.error("NOWPayments invoice creation failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "NOWPayments invoice creation failed.",
      },
      { status: 502 },
    );
  }
}

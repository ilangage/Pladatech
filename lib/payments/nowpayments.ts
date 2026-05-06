import "server-only";

import crypto from "crypto";
import { NOWPAYMENTS_PAYMENT_OPTIONS } from "./nowpayments-options";

const NOWPAYMENTS_API_BASE = "https://api.nowpayments.io/v1";

export type { NowPaymentsPayCurrency } from "./nowpayments-options";
export { isAllowedNowPaymentsPayCurrency } from "./nowpayments-options";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getNowPaymentsConfig() {
  const apiKey = process.env.NOWPAYMENTS_API_KEY?.trim();
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!apiKey) throw new Error("Missing NOWPAYMENTS_API_KEY.");
  if (!ipnSecret) throw new Error("Missing NOWPAYMENTS_IPN_SECRET.");
  if (!siteUrl) throw new Error("Missing NEXT_PUBLIC_SITE_URL.");

  return { apiKey, ipnSecret, siteUrl };
}

function buildUrl(siteUrl: string, path: string) {
  return new URL(path, siteUrl).toString();
}

function normalizeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left.toLowerCase(), "utf8");
  const rightBuffer = Buffer.from(right.toLowerCase(), "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickFirstNumber(...values: unknown[]) {
  for (const value of values) {
    const n = asNumber(value, NaN);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export type CreateNowPaymentsPaymentInput = {
  orderNumber: string;
  amount: number;
  description: string;
  currency?: string;
  payCurrency?: string;
  successPath?: string;
  cancelPath?: string;
  ipnPath?: string;
};

export type CreateNowPaymentsPaymentResult = {
  paymentId: string | null;
  payAddress: string | null;
  payAmount: number | null;
  payCurrency: string | null;
  priceAmount: number;
  priceCurrency: string;
  paymentStatus: string | null;
  paymentLink: string | null;
  qrCode: string | null;
  rawResponse: unknown;
};

export async function createNowPaymentsPayment(input: CreateNowPaymentsPaymentInput): Promise<CreateNowPaymentsPaymentResult> {
  const { apiKey, siteUrl } = getNowPaymentsConfig();
  const priceAmount = asNumber(input.amount, 0);
  const priceCurrency = asString(input.currency).toUpperCase() || "USD";
  const payCurrency = asString(input.payCurrency).toLowerCase();

  if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
    throw new Error("NOWPayments payment amount must be greater than zero.");
  }

  const response = await fetch(`${NOWPAYMENTS_API_BASE}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      price_amount: Number(priceAmount.toFixed(2)),
      price_currency: priceCurrency,
      ...(payCurrency ? { pay_currency: payCurrency } : {}),
      order_id: input.orderNumber,
      order_description: input.description,
      ipn_callback_url: buildUrl(siteUrl, input.ipnPath ?? "/api/payments/webhook"),
      success_url: buildUrl(siteUrl, input.successPath ?? `/checkout/success?order=${encodeURIComponent(input.orderNumber)}`),
      cancel_url: buildUrl(siteUrl, input.cancelPath ?? `/checkout/failed?order=${encodeURIComponent(input.orderNumber)}`),
    }),
    cache: "no-store",
  });

  const responseText = await response.text();
  const rawResponse = responseText ? normalizeJson(responseText) : null;

  if (!response.ok) {
    const message =
      typeof rawResponse === "object" && rawResponse && "message" in rawResponse
        ? String((rawResponse as Record<string, unknown>).message)
        : responseText || response.statusText || "NOWPayments request failed.";
    throw new Error(message);
  }

  const responseObject = (rawResponse && typeof rawResponse === "object" ? rawResponse : {}) as Record<string, unknown>;
  const paymentId = pickFirstString(responseObject.payment_id, responseObject.id, responseObject.paymentId) || null;
  const payAddress = pickFirstString(responseObject.pay_address, responseObject.address, responseObject.payAddress, responseObject.wallet_address) || null;
  const payAmount = pickFirstNumber(responseObject.pay_amount, responseObject.amount, responseObject.payAmount) || null;
  const responsePayCurrency = pickFirstString(responseObject.pay_currency, responseObject.currency, responseObject.payCurrency) || null;
  const paymentStatus = pickFirstString(responseObject.payment_status, responseObject.status, responseObject.paymentStatus) || null;
  const paymentLink = pickFirstString(responseObject.invoice_url, responseObject.invoiceUrl, responseObject.payment_url, responseObject.paymentUrl, responseObject.url) || null;
  const qrCode = pickFirstString(
    responseObject.qr_code,
    responseObject.qrCode,
    responseObject.qr_code_base64,
    responseObject.qrCodeBase64,
    responseObject.payment_qr_code,
  ) || null;

  return {
    paymentId,
    payAddress,
    payAmount,
    payCurrency: responsePayCurrency || (payCurrency ? payCurrency.toUpperCase() : null),
    priceAmount,
    priceCurrency,
    paymentStatus,
    paymentLink,
    qrCode,
    rawResponse,
  };
}

export async function createNowPaymentsInvoice(input: CreateNowPaymentsPaymentInput) {
  return createNowPaymentsPayment(input);
}

export function verifyNowPaymentsWebhookSignature(rawBody: string, headers: Headers) {
  const { ipnSecret } = getNowPaymentsConfig();
  const signature = asString(headers.get("x-nowpayments-sig") ?? headers.get("x-nowpayments-signature") ?? headers.get("x-ipn-signature"));

  if (!signature) {
    return process.env.NODE_ENV !== "production";
  }

  const sha512 = crypto.createHmac("sha512", ipnSecret).update(rawBody).digest("hex");
  if (safeEqual(signature, sha512)) return true;

  const sha256 = crypto.createHmac("sha256", ipnSecret).update(rawBody).digest("hex");
  return safeEqual(signature, sha256);
}

export function mapNowPaymentsPaymentStatus(status: string | null | undefined) {
  const normalized = asString(status).toLowerCase();

  if (normalized === "finished" || normalized === "confirmed") {
    return { paymentStatus: "paid", orderStatus: "confirmed" };
  }

  if (normalized === "partially_paid") {
    return { paymentStatus: "processing", orderStatus: "processing" };
  }

  if (normalized === "failed" || normalized === "expired" || normalized === "refunded") {
    return { paymentStatus: "failed", orderStatus: "cancelled" };
  }

  if (normalized === "waiting" || normalized === "confirming" || normalized === "sending" || normalized === "pending") {
    return { paymentStatus: "processing", orderStatus: "processing" };
  }

  return { paymentStatus: "processing", orderStatus: "processing" };
}

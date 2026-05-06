"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { PaymentPageOrder } from "@/lib/orders";
import { NOWPAYMENTS_PAYMENT_OPTIONS } from "@/lib/payments/nowpayments-options";

type Props = {
  initialOrder: PaymentPageOrder | null;
};

type StatusResponse = {
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  gatewayPaymentId: string | null;
  payAmount: number | null;
  payCurrency: string | null;
  payAddress: string | null;
  qrCode: string | null;
  paymentLink: string | null;
  selectedPayCurrency: string | null;
};

type GenerateResponse = {
  ok: boolean;
  error?: string;
  orderNumber?: string;
  paymentId?: string | null;
  paymentStatus?: string | null;
  payAddress?: string | null;
  payAmount?: number | null;
  payCurrency?: string | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  qrCode?: string | null;
  paymentLink?: string | null;
  redirectUrl?: string;
};

function formatCurrency(value: number | string | null, currency: string | null) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (numericValue === null || Number.isNaN(numericValue)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currency || "USD"} ${numericValue.toFixed(2)}`;
  }
}

function statusLabel(paymentStatus: string | null | undefined) {
  switch (paymentStatus) {
    case "paid":
      return "Payment confirmed";
    case "failed":
    case "expired":
    case "cancelled":
      return "Payment issue";
    case "pending":
    case "processing":
    default:
      return "Waiting for payment";
  }
}

function statusTone(paymentStatus: string | null | undefined) {
  switch (paymentStatus) {
    case "paid":
      return "paid";
    case "failed":
    case "expired":
    case "cancelled":
      return "failed";
    case "pending":
    case "processing":
    default:
      return "processing";
  }
}

function statusCopy(paymentStatus: string | null | undefined) {
  switch (paymentStatus) {
    case "paid":
      return "Your payment has been received. We’re preparing your order.";
    case "failed":
    case "expired":
    case "cancelled":
      return "Please retry payment or contact support with your order number.";
    case "pending":
    case "processing":
    default:
      return "Your payment will update automatically after blockchain confirmation.";
  }
}

function currencyNote(payCurrency: string | null) {
  const option = NOWPAYMENTS_PAYMENT_OPTIONS.find((entry) => entry.payCurrency === (payCurrency ?? "").toLowerCase());
  return option?.note ?? "Select the coin/network you want to pay with.";
}

function currencyLabel(payCurrency: string | null) {
  const normalized = (payCurrency ?? "").toLowerCase();
  const option = NOWPAYMENTS_PAYMENT_OPTIONS.find((entry) => entry.payCurrency === normalized);
  if (option) return option.label.replace(/\s-\s/g, " ");
  if (normalized) return normalized.toUpperCase();
  return "USD";
}

function buildQrSrc(qrCode: string | null) {
  if (!qrCode) return null;
  if (qrCode.startsWith("data:") || qrCode.startsWith("http://") || qrCode.startsWith("https://")) {
    return qrCode;
  }
  return `data:image/png;base64,${qrCode}`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className="soft-button checkout-pay-copy" onClick={onCopy}>
      {copied ? "Copied" : label}
    </button>
  );
}

export default function CheckoutPayClient({ initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [selectedPayCurrency, setSelectedPayCurrency] = useState(
    initialOrder?.selectedPayCurrency?.toLowerCase() ||
      initialOrder?.payCurrency?.toLowerCase() ||
      NOWPAYMENTS_PAYMENT_OPTIONS[0]?.payCurrency ||
      "usdttrc20",
  );
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const status = order?.payment_status ?? "pending";
  const tone = statusTone(status);
  const paidResolved = status === "paid" || status === "failed" || status === "expired" || status === "cancelled";
  const retryableFailure = status === "failed" || status === "expired" || status === "cancelled";
  const hasGeneratedDetails = Boolean(order?.gateway_payment_id || order?.payAddress || order?.paymentLink || order?.qrCode);
  const selectorLocked = hasGeneratedDetails && !retryableFailure && !paidResolved;
  const paymentQrValue = order?.payAddress?.trim() || null;

  useEffect(() => {
    if (!order?.order_number || paidResolved) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/checkout/orders/${encodeURIComponent(order.order_number)}/status`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const nextOrder = (await response.json()) as StatusResponse;
        if (cancelled) return;

        setOrder((current) =>
          current
            ? {
                ...current,
                order_number: nextOrder.orderNumber,
                payment_status: nextOrder.paymentStatus,
                order_status: nextOrder.orderStatus,
                gateway_payment_id: nextOrder.gatewayPaymentId,
                payAmount: nextOrder.payAmount,
                payCurrency: nextOrder.payCurrency,
                payAddress: nextOrder.payAddress,
                qrCode: nextOrder.qrCode,
                paymentLink: nextOrder.paymentLink,
                selectedPayCurrency: nextOrder.selectedPayCurrency,
              }
            : current,
        );
        if (nextOrder.selectedPayCurrency) {
          setSelectedPayCurrency(nextOrder.selectedPayCurrency.toLowerCase());
        }
        setLastChecked(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        /* keep stable */
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [order?.order_number, paidResolved]);

  useEffect(() => {
    let cancelled = false;

    const makeQr = async () => {
      const resolvedQr = buildQrSrc(order?.qrCode ?? null);

      if (resolvedQr) {
        if (!cancelled) {
          setQrSrc(resolvedQr);
        }
        return;
      }

      if (!paymentQrValue) {
        setQrSrc(null);
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(paymentQrValue, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 420,
        });

        if (!cancelled) setQrSrc(dataUrl);
      } catch {
        if (!cancelled) setQrSrc(null);
      }
    };

    void makeQr();

    return () => {
      cancelled = true;
    };
  }, [paymentQrValue, order?.qrCode]);

  const refreshNow = async () => {
    if (!order?.order_number) return;
    setRefreshing(true);
    try {
      const response = await fetch(`/api/checkout/orders/${encodeURIComponent(order.order_number)}/status`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const nextOrder = (await response.json()) as StatusResponse;
      setOrder((current) =>
        current
          ? {
              ...current,
              order_number: nextOrder.orderNumber,
              payment_status: nextOrder.paymentStatus,
              order_status: nextOrder.orderStatus,
              gateway_payment_id: nextOrder.gatewayPaymentId,
              payAmount: nextOrder.payAmount,
              payCurrency: nextOrder.payCurrency,
              payAddress: nextOrder.payAddress,
              qrCode: nextOrder.qrCode,
              paymentLink: nextOrder.paymentLink,
              selectedPayCurrency: nextOrder.selectedPayCurrency,
            }
          : current,
      );
      if (nextOrder.selectedPayCurrency) {
        setSelectedPayCurrency(nextOrder.selectedPayCurrency.toLowerCase());
      }
      setLastChecked(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      /* no-op */
    } finally {
      setRefreshing(false);
    }
  };

  const generatePaymentAddress = async () => {
    if (!order?.order_number || status === "paid" || selectorLocked) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/nowpayments/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.order_number,
          payCurrency: selectedPayCurrency,
        }),
      });

      const payload = (await response.json()) as GenerateResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Failed to generate payment address.");
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              payment_status: payload.paymentStatus ?? "processing",
              order_status: "processing",
              gateway_payment_id: payload.paymentId ?? current.gateway_payment_id,
              payAddress: payload.payAddress ?? current.payAddress,
              payAmount: payload.payAmount ?? current.payAmount,
              payCurrency: payload.payCurrency ?? current.payCurrency,
              qrCode: payload.qrCode ?? current.qrCode,
              paymentLink: payload.paymentLink ?? current.paymentLink,
              selectedPayCurrency,
            }
          : current,
      );

      if (payload.payCurrency) {
        setSelectedPayCurrency(payload.payCurrency.toLowerCase());
      }
      setLastChecked(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate payment address.");
    } finally {
      setGenerating(false);
    }
  };

  if (!order) {
    return (
      <section className="checkout-pay-empty">
        <div className="checkout-pay-card">
          <span className="checkout-pay-eyebrow">Crypto payment</span>
          <h1>Order not found</h1>
          <p>We could not load this payment page. Please return to the store and try again.</p>
          <div className="checkout-pay-actions">
            <Link href="/#products" className="pill-button">
              Back to store
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const payAmount = order.payAmount ?? order.total;
  const payCurrency = order.payCurrency ?? order.currency ?? "USD";
  const qrImageSrc = qrSrc ?? buildQrSrc(order.qrCode ?? null);
  const amountLabel = `${typeof payAmount === "number" ? payAmount.toFixed(2) : Number(payAmount ?? 0).toFixed(2)} ${currencyLabel(payCurrency)}`;
  const paymentActionLabel = hasGeneratedDetails && retryableFailure ? "Generate new payment address" : "Generate payment address";

  return (
    <section className="checkout-pay-card">
      <div className="checkout-pay-header">
        <div>
          <span className="checkout-pay-eyebrow">Crypto payment</span>
          <h1>Complete your crypto payment</h1>
          <p>Choose your preferred crypto network and complete the payment securely.</p>
        </div>
        <div className={`checkout-pay-status ${tone}`}>
          <span>{statusLabel(status)}</span>
          <strong>{order.order_number}</strong>
          <small>{statusCopy(status)}</small>
        </div>
      </div>

      <div className="checkout-pay-grid">
        <div className="checkout-pay-panel">
          <span>Order details</span>
          <dl className="checkout-pay-dl">
            <div>
              <dt>Order number</dt>
              <dd>{order.order_number}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatCurrency(order.total, order.currency)}</dd>
            </div>
            <div>
              <dt>Payment method</dt>
              <dd>NOWPayments crypto checkout</dd>
            </div>
            <div>
              <dt>Payment status</dt>
              <dd>{statusLabel(status)}</dd>
            </div>
          </dl>

          {!selectorLocked ? (
            <>
              <div className="checkout-pay-section-title">
                <span>Choose coin / network</span>
                <small>{currencyNote(selectedPayCurrency)}</small>
              </div>
              <div className="checkout-pay-options">
                {NOWPAYMENTS_PAYMENT_OPTIONS.map((option) => {
                  const active = selectedPayCurrency === option.payCurrency;
                  return (
                    <button
                      key={option.payCurrency}
                      type="button"
                      className={`checkout-pay-option ${active ? "active" : ""}`}
                      onClick={() => setSelectedPayCurrency(option.payCurrency)}
                      disabled={generating}
                    >
                      <input type="radio" checked={active} readOnly />
                      <div>
                        <strong>{option.label}</strong>
                        <span>{option.note}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="dark-button checkout-pay-submit" onClick={generatePaymentAddress} disabled={generating || status === "paid"}>
                {generating ? "Generating payment address..." : paymentActionLabel}
              </button>
              {error ? <div className="checkout-error">{error}</div> : null}
            </>
          ) : (
            <div className="checkout-pay-ready-note">
              <strong>Payment address generated</strong>
              <p>Review the payment details on the right. Your selected network is locked for this order.</p>
            </div>
          )}

          <p className="checkout-pay-footnote">Payment is confirmed automatically after blockchain confirmation.</p>
          <p className="checkout-pay-footnote">Need help? Contact support with your order number {order.order_number}.</p>
        </div>

        <div className="checkout-pay-panel checkout-pay-payment-panel">
          <span>Send payment</span>
          {!hasGeneratedDetails ? (
            <div className="checkout-pay-placeholder">
              <strong>Generate your payment address</strong>
              <p>Select a coin/network first, then generate the payment address to reveal the wallet details and QR code.</p>
            </div>
          ) : (
            <>
              {retryableFailure ? (
                <div className="checkout-pay-ready-note">
                  <strong>Previous payment expired or failed</strong>
                  <p>You can choose another network and generate a fresh payment address for the same order.</p>
                </div>
              ) : null}
              {qrImageSrc ? (
                <div className="checkout-pay-qr">
                  <img src={qrImageSrc} alt="NOWPayments QR code" />
                  <small>Scan to pay</small>
                </div>
              ) : null}
              <dl className="checkout-pay-dl">
                <div>
                  <dt>Pay exactly</dt>
                  <dd>
                    {amountLabel}
                  </dd>
                </div>
                <div>
                  <dt>Payment ID</dt>
                  <dd>{order.gateway_payment_id || "—"}</dd>
                </div>
                <div>
                  <dt>Wallet address</dt>
                  <dd className="checkout-pay-address">{order.payAddress || "Waiting for address..."}</dd>
                </div>
              </dl>

              <div className="checkout-pay-actions checkout-pay-copy-actions">
                {order.payAddress ? <CopyButton value={order.payAddress} label="Copy address" /> : null}
                <CopyButton value={amountLabel} label="Copy amount" />
              </div>

              {order.paymentLink ? (
                <a
                  href={order.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="checkout-pay-link"
                >
                  Open secure checkout
                </a>
              ) : null}

              <div className={`checkout-pay-payment-warning ${paidResolved ? "resolved" : ""}`}>
                Send only the selected coin on the selected network. Sending a different coin or network may result in loss of funds.
              </div>

              <div className="checkout-pay-status-row">
                <button type="button" className="outline-button" onClick={refreshNow} disabled={refreshing}>
                  {refreshing ? "Checking..." : "Check payment status"}
                </button>
                {lastChecked ? <span>Last checked at {lastChecked}</span> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AdminOrderDetail } from "@/lib/orders";

const paymentStatuses = ["pending", "processing", "paid", "failed", "refunded"];
const orderStatuses = ["new", "confirmed", "processing", "fulfilled", "cancelled", "refunded"];

export default function AdminOrderActions({ order }: { order: AdminOrderDetail }) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [orderStatus, setOrderStatus] = useState(order.order_status);
  const [shippingProvider, setShippingProvider] = useState(order.shipping_provider ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url ?? "");
  const [fulfillmentNote, setFulfillmentNote] = useState(order.fulfillment_note ?? "");
  const [refundReason, setRefundReason] = useState(order.refund_reason ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.order_number)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus,
          orderStatus,
          shippingProvider,
          trackingNumber,
          trackingUrl,
          fulfillmentNote,
          refundReason,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Failed to update order.");
      setMessage("Order updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-order-actions" onSubmit={submit}>
      <div className="admin-grid-two">
        <label className="admin-field">
          <span>Payment status</span>
          <select className="admin-input" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
            {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span>Order status</span>
          <select className="admin-input" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}>
            {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>
      <div className="admin-grid-two">
        <label className="admin-field">
          <span>Shipping provider</span>
          <input className="admin-input" value={shippingProvider} onChange={(event) => setShippingProvider(event.target.value)} placeholder="USPS, UPS, Royal Mail..." />
        </label>
        <label className="admin-field">
          <span>Tracking number</span>
          <input className="admin-input" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
        </label>
      </div>
      <label className="admin-field">
        <span>Tracking URL</span>
        <input className="admin-input" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} />
      </label>
      <label className="admin-field">
        <span>Fulfillment note</span>
        <textarea className="admin-input admin-textarea" rows={4} value={fulfillmentNote} onChange={(event) => setFulfillmentNote(event.target.value)} />
      </label>
      <label className="admin-field">
        <span>Refund / cancel reason</span>
        <textarea className="admin-input admin-textarea" rows={3} value={refundReason} onChange={(event) => setRefundReason(event.target.value)} />
      </label>
      {message ? <div className="admin-success">{message}</div> : null}
      {error ? <div className="admin-alert">{error}</div> : null}
      <div className="admin-form-actions">
        <button type="submit" className="admin-button" disabled={saving}>
          {saving ? "Saving..." : "Save order changes"}
        </button>
      </div>
    </form>
  );
}

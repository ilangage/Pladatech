import Link from "next/link";
import { getAdminOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

function formatPrice(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
}

function formatCreatedAt(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>Orders</h1>
          <p>Checkout foundation orders created from the site.</p>
        </div>
        <Link href="/admin/products" className="admin-button admin-button-secondary">
          Back to products
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty">
                  <div className="admin-empty-card">
                    <strong>No orders yet</strong>
                    <p>Checkout orders will appear here after customers start placing them.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_number}</strong>
                    <div className="admin-muted">{order.shipping_method}</div>
                  </td>
                  <td>
                    <strong>{order.customer_name}</strong>
                    <div className="admin-muted">{order.customer_email}</div>
                  </td>
                  <td>
                    <strong>{formatPrice(order.total)}</strong>
                    <div className="admin-muted">{order.currency}</div>
                  </td>
                  <td>{order.payment_method}</td>
                  <td>
                    <div className="admin-row-actions">
                      <span className={`admin-pill ${order.payment_status === "pending" ? "admin-pill-active" : ""}`}>{order.payment_status}</span>
                      <span className={`admin-pill ${order.order_status === "new" ? "admin-pill-active" : ""}`}>{order.order_status}</span>
                    </div>
                  </td>
                  <td>{formatCreatedAt(order.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

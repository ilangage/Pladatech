import Link from "next/link";
import { notFound } from "next/navigation";
import AdminOrderActions from "@/components/admin/AdminOrderActions";
import { getAdminOrderDetail } from "@/lib/orders";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export const dynamic = "force-dynamic";

function formatPrice(value: number | string | null | undefined, currency = "USD") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0);
}

function line(label: string, value: string | number | null | undefined) {
  return (
    <div className="admin-detail-line">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getAdminOrderDetail(orderNumber);
  if (!order) notFound();

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>{order.order_number}</h1>
          <p>Manage status, tracking, fulfillment notes, cancellation and refund context.</p>
        </div>
        <Link href="/admin/orders" className="admin-button admin-button-secondary">Back to orders</Link>
      </div>

      <div className="admin-order-detail-grid">
        <div className="admin-card">
          <h2>Customer</h2>
          {line("Name", order.customer_name)}
          {line("Email", order.customer_email)}
          {line("Phone", order.customer_phone)}
          {line("Country", order.country)}
          {line("Address", `${order.address_line1}${order.address_line2 ? `, ${order.address_line2}` : ""}`)}
          {line("City / State / Postal", `${order.city}${order.state ? `, ${order.state}` : ""} ${order.postal_code}`)}
        </div>

        <div className="admin-card">
          <h2>Totals</h2>
          {line("Subtotal", formatPrice(order.subtotal, order.currency))}
          {line("Shipping", formatPrice(order.shipping_total, order.currency))}
          {line("Tax / VAT", formatPrice(order.tax_total ?? 0, order.currency))}
          {line("Discount", formatPrice(order.discount_total, order.currency))}
          {line("Gift wrap", formatPrice(order.gift_wrap_total, order.currency))}
          {line("Total", formatPrice(order.total, order.currency))}
        </div>
      </div>

      <div className="admin-card">
        <h2>Items</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.product_title || item.product_name}</strong>
                    <div className="admin-muted">{item.product_slug}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.unit_price, order.currency)}</td>
                  <td>{formatPrice(item.line_total, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <h2>Actions</h2>
        <AdminOrderActions order={order} />
      </div>
    </section>
  );
}

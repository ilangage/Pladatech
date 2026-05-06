import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import { getOrderPublicSummary } from "@/lib/orders";

type Props = {
  searchParams: Promise<{
    order?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order received | Pladatech",
  description: "Checkout confirmation page for Pladatech orders.",
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderValue = Array.isArray(params.order) ? params.order[0] : params.order;
  const orderNumber = orderValue?.trim() ?? "";
  const order = orderNumber ? await getOrderPublicSummary(orderNumber) : null;
  const paymentPending = !order || order.payment_status === "pending";

  return (
    <ShopShell>
      <section className="section-card checkout-shell">
        <div className="checkout-empty checkout-success">
          <span>Order received</span>
          <h1>Thanks for your order</h1>
          {order ? <p>Order number <strong>{order.order_number}</strong> has been created successfully.</p> : <p>Your order has been created successfully.</p>}
          <p>{paymentPending ? "Payment is pending for this order foundation. You can wire the payment gateway next without changing the cart flow." : "Your payment is being processed."}</p>
          <div className="checkout-empty-actions">
            <Link href="/" className="pill-button">
              Back to home
            </Link>
            <Link href="/#products" className="outline-button">
              Continue shopping
            </Link>
          </div>
          <p className="checkout-note">
            Need help? Contact support or send your order number through WhatsApp once live support is connected.
          </p>
        </div>
      </section>
    </ShopShell>
  );
}

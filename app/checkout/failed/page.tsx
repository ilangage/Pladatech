import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout failed | Pladatech",
  description: "Checkout failed page for Pladatech orders.",
};

export default function CheckoutFailedPage() {
  return (
    <ShopShell>
      <section className="section-card checkout-shell">
        <div className="checkout-empty checkout-failed">
          <span>Checkout failed</span>
          <h1>We could not complete the payment</h1>
          <p>Please try again or return to your cart to review the order.</p>
          <div className="checkout-empty-actions">
            <Link href="/#products" className="pill-button">
              Back to shop
            </Link>
            <Link href="/" className="outline-button">
              Home
            </Link>
          </div>
        </div>
      </section>
    </ShopShell>
  );
}

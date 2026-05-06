import type { Metadata } from "next";
import Link from "next/link";
import { getOrderPaymentPageData } from "@/lib/orders";
import CheckoutPayClient from "./CheckoutPayClient";

type Props = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crypto payment | Pladatech",
  description: "Complete your crypto payment inside the Pladatech storefront theme.",
};

export default async function CheckoutPayPage({ params }: Props) {
  const resolvedParams = await params;
  const orderNumber = resolvedParams.orderNumber?.trim() ?? "";
  const order = orderNumber ? await getOrderPaymentPageData(orderNumber) : null;

  return (
    <main className="checkout-pay-page">
      <div className="checkout-pay-shell">
        <div className="checkout-pay-topbar">
          <div className="checkout-pay-brand">
            <div className="checkout-pay-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div>
              <strong>Pladatech</strong>
              <span>Secure crypto payment</span>
            </div>
          </div>
          <Link href="/#products" className="outline-button checkout-pay-back">
            Back to store
          </Link>
        </div>

        <CheckoutPayClient
          initialOrder={
            order
              ? {
                  ...order,
                }
              : null
          }
        />
      </div>
    </main>
  );
}

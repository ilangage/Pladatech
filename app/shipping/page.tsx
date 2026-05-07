import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import PolicyContent from "@/components/PolicyContent";
import { policyPages } from "@/data/policy-pages";
import { policies } from "@/data/store";

export const metadata: Metadata = { title: "Shipping | Pladatech", description: policies.shipping.body.slice(0, 155) };

export default function ShippingPage() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <PolicyContent policy={policyPages.shipping} />
      </div>
    </ShopShell>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import PolicyContent from "@/components/PolicyContent";
import { policyPages } from "@/data/policy-pages";
import { policies } from "@/data/store";

export const metadata: Metadata = { title: "Terms | Pladatech", description: policies.terms.body.slice(0, 155) };

export default function TermsPage() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <PolicyContent policy={policyPages.terms} />
      </div>
    </ShopShell>
  );
}

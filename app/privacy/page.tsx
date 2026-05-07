import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import PolicyContent from "@/components/PolicyContent";
import { policyPages } from "@/data/policy-pages";
import { policies } from "@/data/store";

export const metadata: Metadata = { title: "Privacy | Pladatech", description: policies.privacy.body.slice(0, 155) };

export default function PrivacyPage() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <PolicyContent policy={policyPages.privacy} />
      </div>
    </ShopShell>
  );
}

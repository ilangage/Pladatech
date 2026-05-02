import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import { policies } from "@/data/store";

export const metadata: Metadata = { title: "Terms | Pladatech", description: policies.terms.body.slice(0, 155) };

export default function TermsPage() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <h1>{policies.terms.title}</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 800 }}>{policies.terms.body}</p>
      </div>
    </ShopShell>
  );
}

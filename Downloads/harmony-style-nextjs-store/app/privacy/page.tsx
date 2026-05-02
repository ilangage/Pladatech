import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import { policies } from "@/data/store";

export const metadata: Metadata = { title: "Privacy | Pladatech", description: policies.privacy.body.slice(0, 155) };

export default function PrivacyPage() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <h1>{policies.privacy.title}</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 800 }}>{policies.privacy.body}</p>
      </div>
    </ShopShell>
  );
}

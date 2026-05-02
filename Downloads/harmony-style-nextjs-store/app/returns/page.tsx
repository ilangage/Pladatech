import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import { policies } from "@/data/store";

export const metadata: Metadata = { title: "Returns | Pladatech", description: policies.returns.body.slice(0, 155) };

export default function ReturnsPage() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <h1>{policies.returns.title}</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 800 }}>{policies.returns.body}</p>
      </div>
    </ShopShell>
  );
}

import Link from "next/link";
import ShopShell from "@/components/ShopShell";

export default function NotFound() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <h1 style={{ letterSpacing: "-0.04em" }}>Page not found</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, maxWidth: 560 }}>
          That URL isn&apos;t available. Use the navigation above or go back to the homepage.
        </p>
      </div>
    </ShopShell>
  );
}

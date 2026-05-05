import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { collections } from "@/data/store";
import { loadProducts, getProductsBySlugsFromList } from "@/lib/product-catalog";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = collections.find((c) => c.slug === slug);
  if (!col) return {};
  return {
    title: `${col.name} | Pladatech`,
    description: col.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const col = collections.find((c) => c.slug === slug);
  if (!col) notFound();
  const list = getProductsBySlugsFromList(await loadProducts(), col.productSlugs);

  return (
    <ShopShell>
      <div className="subpage section-card">
          <img src={col.image} alt="" width={900} height={360} style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 24, marginBottom: 24 }} />
          <h1 style={{ fontSize: 48, letterSpacing: "-0.04em" }}>{col.name}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 720, lineHeight: 1.5 }}>{col.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginTop: 28 }}>
            {list.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} style={{ border: "1px solid var(--line)", borderRadius: 24, padding: 14, textDecoration: "none", color: "inherit", background: "white" }}>
                <img src={p.image} alt="" width="100%" height={200} style={{ objectFit: "cover", borderRadius: 18 }} />
                <strong style={{ display: "block", marginTop: 10 }}>{p.title}</strong>
                <span style={{ fontWeight: 800 }}>
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p.price)}
                </span>
              </Link>
            ))}
          </div>
      </div>
    </ShopShell>
  );
}

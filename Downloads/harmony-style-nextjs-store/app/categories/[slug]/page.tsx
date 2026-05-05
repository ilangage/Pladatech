import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { categoryList } from "@/data/store";
import { loadProducts, getProductsByCategoryFromList } from "@/lib/product-catalog";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categoryList.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryList.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} | Pladatech`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = categoryList.find((c) => c.slug === slug);
  if (!cat) notFound();
  const list = getProductsByCategoryFromList(await loadProducts(), cat.name);

  return (
    <ShopShell>
      <div className="subpage section-card">
          <img src={cat.image} alt="" width={900} height={420} style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 24, marginBottom: 24 }} />
          <h1 style={{ fontSize: 48, letterSpacing: "-0.04em" }}>{cat.name}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 720, lineHeight: 1.5 }}>{cat.description}</p>
          <h2 style={{ marginTop: 40, fontSize: 28 }}>Products</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginTop: 20 }}>
            {list.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} style={{ border: "1px solid var(--line)", borderRadius: 24, padding: 14, textDecoration: "none", color: "inherit", background: "white" }}>
                <img src={p.image} alt="" width="100%" height={200} style={{ objectFit: "cover", borderRadius: 18 }} />
                {p.badge ? <span className={`badge ${p.badgeKey}`} style={{ position: "static", display: "inline-block", marginTop: 10 }}>{p.badge}</span> : null}
                <strong style={{ display: "block", marginTop: 10, fontSize: 18 }}>{p.title}</strong>
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

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { bundles } from "@/data/store";
import { loadProducts, getProductsBySlugsFromList } from "@/lib/product-catalog";
import BundleAdd from "./BundleAdd";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return bundles.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = bundles.find((x) => x.slug === slug);
  if (!b) return {};
  return {
    title: `${b.name} | Pladatech Bundles`,
    description: b.description,
  };
}

export default async function BundlePage({ params }: Props) {
  const { slug } = await params;
  const bundle = bundles.find((b) => b.slug === slug);
  if (!bundle) notFound();
  const items = getProductsBySlugsFromList(await loadProducts(), bundle.productSlugs);

  return (
    <ShopShell>
      <div className="subpage section-card">
          <img src={bundle.image} alt="" width={800} height={360} style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 24, marginBottom: 24 }} />
          <h1 style={{ fontSize: "clamp(2.75rem, 5vw, 4rem)", lineHeight: 1.02, letterSpacing: "-0.04em", fontWeight: 800 }}>{bundle.name}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 720, lineHeight: 1.65, fontWeight: 500, fontSize: 17 }}>{bundle.description}</p>
          <p style={{ fontSize: 28, fontWeight: 700, marginTop: 16, letterSpacing: "-0.02em" }}>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(bundle.price)}
            <span style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: 17, marginLeft: 12, fontWeight: 500 }}>
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(bundle.comparePrice)}
            </span>
          </p>
          <BundleAdd products={items} />
          <h2 style={{ marginTop: 36, fontSize: 24, lineHeight: 1.08, letterSpacing: "-0.03em", fontWeight: 700 }}>Included products</h2>
          <ul style={{ lineHeight: 1.7, fontWeight: 500 }}>
            {items.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
      </div>
    </ShopShell>
  );
}

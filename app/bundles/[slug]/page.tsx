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
  const saveAmount = Math.max(0, bundle.comparePrice - bundle.price);
  const savePercent = bundle.comparePrice > 0 ? Math.round((saveAmount / bundle.comparePrice) * 100) : 0;

  return (
    <ShopShell>
      <div className="subpage section-card bundle-page">
        <img src={bundle.image} alt="" width={800} height={360} className="bundle-hero-image" />
        <div className="bundle-offer-grid">
          <div>
            <span className="bundle-kicker">Bundle offer</span>
            <h1>{bundle.name}</h1>
            <p>{bundle.description}</p>
          </div>
          <aside className="bundle-offer-card">
            <span>Bundle price</span>
            <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(bundle.price)}</strong>
            <p>
              <s>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(bundle.comparePrice)}</s>
              {saveAmount > 0 ? ` Save ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(saveAmount)}${savePercent ? ` (${savePercent}%)` : ""}` : ""}
            </p>
            <BundleAdd products={items} bundle={bundle} />
            <small>Bundle checkout uses the bundle price while reserving stock for each included item.</small>
          </aside>
        </div>
        <h2 className="bundle-section-title">Included products</h2>
        <div className="bundle-items-grid">
          {items.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="bundle-item-card">
              <img src={p.image} alt={p.title} width={120} height={120} />
              <div>
                <strong>{p.title}</strong>
                <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p.price)} · {p.stock} in stock</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ShopShell>
  );
}

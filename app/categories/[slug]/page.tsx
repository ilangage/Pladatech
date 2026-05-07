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
      <div className="subpage section-card category-page">
        <div className="category-hero">
          <img src={cat.image} alt="" width={900} height={420} className="category-hero-image" />
          <div className="category-hero-copy">
            <h1>{cat.name}</h1>
            <p>{cat.description}</p>
          </div>
        </div>

        <h2 className="category-products-title">Products</h2>
        <div className="category-products-grid">
          {list.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="category-product-card">
              <img src={p.image} alt="" width="100%" height={200} />
              {p.badge ? <span className={`badge ${p.badgeKey}`}>{p.badge}</span> : null}
              <strong>{p.title}</strong>
              <span>
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p.price)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ShopShell>
  );
}

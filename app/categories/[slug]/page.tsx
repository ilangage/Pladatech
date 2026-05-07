import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { categoryList } from "@/data/store";
import { categorySeoContent } from "@/data/category-seo";
import { loadProducts, getProductsByCategoryFromList } from "@/lib/product-catalog";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categoryList.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryList.find((c) => c.slug === slug);
  if (!cat) return {};
  const seo = categorySeoContent[cat.name];
  return {
    title: `${cat.name} Products | Pladatech`,
    description: seo?.intro ?? cat.description,
    alternates: {
      canonical: `/categories/${cat.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = categoryList.find((c) => c.slug === slug);
  if (!cat) notFound();
  const list = getProductsByCategoryFromList(await loadProducts(), cat.name);
  const seo = categorySeoContent[cat.name];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${cat.name} Products`,
      description: seo.intro,
      url: absoluteUrl(`/categories/${cat.slug}`),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: list.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/products/${product.slug}`),
          name: product.title,
        })),
      },
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: cat.name, path: `/categories/${cat.slug}` },
    ]),
    faqJsonLd(seo.faqs),
  ];

  return (
    <ShopShell>
      {structuredData.map((entry, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(entry)} />
      ))}
      <div className="subpage section-card category-page">
        <div className="category-hero">
          <img src={cat.image} alt="" width={900} height={420} className="category-hero-image" />
          <div className="category-hero-copy">
            <h1>{cat.name}</h1>
            <p>{cat.description}</p>
            <p>{seo.intro}</p>
            <div className="category-internal-links">
              {seo.internalLinks.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </div>
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
        <div className="category-seo-grid">
          <section>
            <h2>Buying tips</h2>
            <ul>
              {seo.buyingTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{cat.name} FAQs</h2>
            {seo.faqs.map((item, index) => (
              <details key={item.q} open={index === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </section>
        </div>
      </div>
    </ShopShell>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { products as fallbackProducts } from "@/data/products";
import { getProductReviews } from "@/data/product-reviews";
import { loadProductBySlug, loadProducts, getProductsBySlugsFromList } from "@/lib/product-catalog";
import ProductActions from "./ProductActions";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return fallbackProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle,
    description: product.seoDescription,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProductBySlug(slug);
  if (!product) notFound();
  const allProducts = await loadProducts();
  const related = getProductsBySlugsFromList(allProducts, product.relatedSlugs);
  const reviews = getProductReviews(product);

  return (
    <ShopShell>
      <div className="subpage section-card">
        <Link href="/#products">← Back to shop</Link>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start", marginTop: 18 }}>
          <img src={product.image} alt={product.title} width={600} height={600} />
          <div>
            <small style={{ color: "var(--muted)" }}>{product.brand}</small>
            <h1 style={{ fontSize: 44, letterSpacing: "-0.04em", margin: "10px 0" }}>{product.title}</h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>{product.shortDescription}</p>
            <p style={{ fontSize: 32, fontWeight: 900 }}>
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(product.price)}
              {product.oldPrice ? (
                <span style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: 18, marginLeft: 12 }}>
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(product.oldPrice)}
                </span>
              ) : null}
            </p>
            <ProductActions product={product} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginTop: 32 }}>
          <section>
            <h2>Overview</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{product.description}</p>
          </section>
          <section>
            <h2>Features</h2>
            <ul>{product.features.map((f) => <li key={f}>{f}</li>)}</ul>
          </section>
          <section>
            <h2>What&apos;s included</h2>
            <ul>{product.whatIncluded.map((f) => <li key={f}>{f}</li>)}</ul>
          </section>
          <section>
            <h2>Why customers love it</h2>
            <ul>{product.whyCustomersLoveIt.map((f) => <li key={f}>{f}</li>)}</ul>
          </section>
        </div>

        <section className="product-reviews" style={{ marginBottom: 32 }}>
          <h2>Delivery photos & reviews</h2>
          <p style={{ color: "var(--muted)" }}>Small image evidence from customers after the product arrived.</p>
          <div className="review-grid">
            {reviews.map((review) => (
              <article key={review.name} className="review-card">
                <div className="review-photo">
                  <img src={review.photo} alt={`${review.name} delivery photo for ${product.title}`} />
                  <span>{review.note}</span>
                </div>
                <div className="review-header">
                  <div>
                    <strong>{review.name}</strong>
                    <span>{review.location}</span>
                  </div>
                  <span className="review-badge">{review.badge}</span>
                </div>
                <div className="review-rating">
                  {"★★★★★".slice(0, review.rating)}
                  <span>{review.rating}.0/5</span>
                </div>
                <p>{review.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Specs</h2>
          <ul>{product.fullSpecs.map((s) => <li key={s.label}><strong>{s.label}:</strong> {s.value}</li>)}</ul>
        </section>
        <section>
          <h2>Shipping &amp; returns</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{product.shippingReturns}</p>
        </section>
        {related.length > 0 && (
          <section>
            <h2 style={{ fontSize: 28 }}>Related products</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} style={{ border: "1px solid var(--line)", borderRadius: 20, padding: 12, textDecoration: "none", color: "inherit" }}>
                  <img src={p.image} alt="" width={220} height={220} style={{ width: "100%", borderRadius: 16, objectFit: "cover" }} />
                  <strong>{p.title}</strong>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </ShopShell>
  );
}


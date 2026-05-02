import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { getProduct, products, getProductsBySlugs } from "@/data/store";
import { getProductReviews } from "@/data/product-reviews";
import { Icon } from "@/components/shop-shared";
import ProductActions from "./ProductActions";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.seoTitle,
    description: product.seoDescription,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getProductsBySlugs(product.relatedSlugs);
  const reviews = getProductReviews(product);

  return (
    <ShopShell>
      <article className="subpage section-card">
          <p>
            <Link href="/#products">← Back to shop</Link>
          </p>
          <div className="subpage-hero">
            <img src={product.image} alt={product.title} width={600} height={600} />
            <div>
              <small style={{ color: "var(--muted)" }}>{product.brand}</small>
              <h1 style={{ fontSize: 44, letterSpacing: "-0.04em", margin: "10px 0" }}>{product.title}</h1>
              <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>{product.shortDescription}</p>
              <p style={{ fontSize: 28, fontWeight: 900, margin: "16px 0" }}>
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
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28 }}>Overview</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{product.description}</p>
          </section>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28 }}>Features</h2>
            <ul style={{ lineHeight: 1.6, color: "var(--muted)" }}>
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28 }}>What&apos;s included</h2>
            <ul style={{ lineHeight: 1.6, color: "var(--muted)" }}>
              {product.whatIncluded.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28 }}>Why customers love it</h2>
            <ul style={{ lineHeight: 1.6, color: "var(--muted)" }}>
              {product.whyCustomersLoveIt.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
          <section className="product-reviews" style={{ marginBottom: 32 }}>
            <div className="section-heading" style={{ marginBottom: 20 }}>
              <span>Verified purchase feedback</span>
              <h2>Reviews with delivery photos</h2>
              <p>Small image evidence from customers after the product arrived.</p>
            </div>
            <div className="review-grid">
              {reviews.map((review) => (
                <article className="review-card" key={`${review.name}-${review.location}`}>
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
                  <div className="review-rating" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="star" size={14} />
                    ))}
                    <span>{review.rating.toFixed(1)}/5</span>
                  </div>
                  <p>{review.text}</p>
                </article>
              ))}
            </div>
          </section>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28 }}>Specs</h2>
            <dl className="spec-dl">
              {product.fullSpecs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28 }}>Shipping & returns</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{product.shippingReturns}</p>
          </section>
          {related.length > 0 && (
            <section>
              <h2 style={{ fontSize: 28 }}>Related products</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
                {related.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} style={{ border: "1px solid var(--line)", borderRadius: 20, padding: 12, textDecoration: "none", color: "inherit" }}>
                    <img src={p.image} alt="" width="100%" height={160} style={{ objectFit: "cover", borderRadius: 14 }} />
                    <strong style={{ display: "block", marginTop: 10 }}>{p.title}</strong>
                    <span style={{ color: "var(--muted)" }}>
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p.price)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
      </article>
    </ShopShell>
  );
}

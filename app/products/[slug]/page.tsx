import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { products as fallbackProducts } from "@/data/products";
import { loadProductReviews } from "@/lib/product-reviews";
import { loadProductBySlug, loadProducts, getProductsBySlugsFromList } from "@/lib/product-catalog";
import { breadcrumbJsonLd, faqJsonLd, jsonLd, productJsonLd } from "@/lib/seo";
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
  const reviews = await loadProductReviews(product);
  const deliveryEstimate = product.category === "Car & Mobile Essentials" ? "3-7 business days" : "4-8 business days";
  const shipWindow = product.stock > 0 ? "Ships in 1-3 business days" : "Currently out of stock";
  const warrantyText = product.category === "Kitchen & Wellness" ? "30-day return window + product support" : "30-day return window + setup support";
  const productFaqs = [
    {
      q: `When will ${product.title} ship?`,
      a: product.stock > 0 ? `In-stock orders usually leave the warehouse within 1-3 business days after payment confirmation.` : "This item is currently out of stock. Contact support for restock timing.",
    },
    {
      q: "What payment methods are accepted?",
      a: "Checkout supports NOWPayments crypto, card / fiat placeholder flow, and bank transfer order creation. Payment status is confirmed server-side.",
    },
    {
      q: "Can I return it?",
      a: "Eligible unused items can be returned within 30 days. Contact support with your order number before sending anything back.",
    },
  ];
  const structuredData = [
    productJsonLd(product, reviews),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: product.category, path: `/categories/${product.categorySlug}` },
      { name: product.title, path: `/products/${product.slug}` },
    ]),
    faqJsonLd(productFaqs),
  ];

  return (
    <ShopShell>
      {structuredData.map((entry, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(entry)} />
      ))}
      <div className="subpage section-card product-page">
        <Link href="/#products" className="outline-button product-back-link">
          ← Back to shop
        </Link>
        <div className="product-hero">
          <div className="product-hero-media">
            <img src={product.image} alt={product.title} width={600} height={600} className="product-hero-image" />
            {product.gallery.length > 1 ? (
              <div className="product-gallery-strip" aria-label={`${product.title} image gallery`}>
                {product.gallery.slice(0, 5).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`${product.title} angle ${index + 1}`} width={96} height={96} />
                ))}
              </div>
            ) : null}
          </div>
          <div className="product-hero-copy">
            <small>{product.brand}</small>
            <h1>{product.title}</h1>
            <p>{product.shortDescription}</p>
            <p className="product-price-row">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(product.price)}
              {product.oldPrice ? (
                <span className="product-old-price">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(product.oldPrice)}
                </span>
              ) : null}
            </p>
            <ProductActions product={product} />
            <div className="product-buying-info" aria-label="Buying information">
              <div>
                <strong>{product.stock > 0 ? "In stock" : "Out of stock"}</strong>
                <span>{product.stock > 0 ? `${product.stock} available · ${shipWindow}` : "Contact support for availability"}</span>
              </div>
              <div>
                <strong>Delivery estimate</strong>
                <span>USA/UK eligible orders: {deliveryEstimate}</span>
              </div>
              <div>
                <strong>Returns</strong>
                <span>30-day return window on eligible unused items</span>
              </div>
              <div>
                <strong>Warranty / guarantee</strong>
                <span>{warrantyText}</span>
              </div>
              <div>
                <strong>Secure payment</strong>
                <span>Crypto, card/fiat, and bank transfer options at checkout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="product-detail-sections">
          <section>
            <h2>Overview</h2>
            <p>{product.description}</p>
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
          <p>Approved customer reviews with delivery photos where available. Reviews are moderated before publishing.</p>
          <div className="review-grid">
            {reviews.map((review) => (
              <article key={review.id ?? review.name} className="review-card">
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
                {review.title ? <strong className="review-title">{review.title}</strong> : null}
                <p>{review.text}</p>
                <div className="review-meta">
                  <span>{review.date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(review.date)) : "Recent review"}</span>
                  <span>{review.source ?? "Customer submitted review"}</span>
                </div>
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
          <p>{product.shippingReturns}</p>
        </section>
        <section className="product-faq">
          <h2>Product FAQ</h2>
          {productFaqs.map((item, index) => (
            <details key={item.q} open={index === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>
        {related.length > 0 && (
          <section>
            <h2>Related products</h2>
            <div className="related-products-grid">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="related-product-card">
                  <img src={p.image} alt="" width={220} height={220} />
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

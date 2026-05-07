import type { ProductReview } from "@/data/types";
import type { Product } from "@/data/types";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://pladatech.com").replace(/\/$/, "");
export const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@pladatech.com";

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function jsonLd(data: unknown) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function productJsonLd(product: Product, reviews: ProductReview[]) {
  const reviewData = reviews.slice(0, 5).map((review) => ({
    "@type": "Review",
    author: { "@type": "Person", name: review.name },
    datePublished: review.date,
    name: review.title,
    reviewBody: review.text,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.gallery.map(absoluteUrl),
    description: product.shortDescription || product.description,
    sku: String(product.databaseId ?? product.id),
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    aggregateRating: product.reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        }
      : undefined,
    review: reviewData.length ? reviewData : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "USD",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Pladatech" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: [
          { "@type": "DefinedRegion", addressCountry: "US" },
          { "@type": "DefinedRegion", addressCountry: "GB" },
        ],
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: ["US", "GB"],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

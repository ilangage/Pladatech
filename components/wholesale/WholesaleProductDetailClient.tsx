"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getWholesaleCategoryLabel,
  getWholesaleSubcategoryLabel,
} from "@/data/wholesale-categories";
import { getWholesaleTierForQuantity, normalizeWholesalePriceTiers } from "@/data/wholesale-pricing";
import type { WholesalePriceTier } from "@/data/wholesale-types";
import type { WholesaleProduct } from "@/data/wholesale-types";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import WholesaleProductCard, { WHOLESALE_WHATSAPP_NUMBER } from "./WholesaleProductCard";

const FALLBACK_WHOLESALE_IMAGE = "/wholesale/placeholder.svg";

type Props = {
  product: WholesaleProduct;
  relatedProducts: WholesaleProduct[];
  cloudinaryCloudName: string;
  categoryLabel: string;
};

function formatLkr(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value)}`;
}

function stockLabel(status: WholesaleProduct["stockStatus"]) {
  if (status === "out_of_stock") return "Out of stock";
  if (status === "low_stock") return "Limited availability";
  return "In stock";
}

function buildWhatsAppLink(product: WholesaleProduct, selectedColor: string, quantity: number, selectedTier: WholesalePriceTier | null) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://www.pladatech.com/wholesale/${product.slug}`;
  const unitPrice = selectedTier?.unitPrice ?? 0;
  const estimatedTotal = unitPrice * quantity;
  const message = [
    "Hi Pladatech, I want to order this wholesale product.",
    "",
    `Product: ${product.title}`,
    selectedColor ? `Color: ${selectedColor}` : "",
    `Quantity: ${quantity} pc${quantity === 1 ? "" : "s"}`,
    selectedTier ? `Price tier: ${selectedTier.label}` : "",
    `Unit price: ${formatLkr(unitPrice)}`,
    `Estimated total: ${formatLkr(estimatedTotal)}`,
    `COD: ${product.codAvailable === false ? "Please confirm availability" : "Available where possible"}`,
    "",
    "Product page:",
    pageUrl,
    "",
    "Please confirm availability and delivery.",
  ].filter(Boolean).join("\n");

  return `https://wa.me/${WHOLESALE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function WholesaleProductDetailClient({ product, relatedProducts, cloudinaryCloudName, categoryLabel }: Props) {
  const gallery = useMemo(() => [product.imagePublicId, ...(product.galleryPublicIds ?? [])].filter(Boolean), [product.galleryPublicIds, product.imagePublicId]);
  const [selectedImage, setSelectedImage] = useState(gallery[0] ?? product.imagePublicId);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [openPanel, setOpenPanel] = useState("overview");

  const subcategoryLabel = getWholesaleSubcategoryLabel(product.category, product.subcategory);
  const priceTiers = useMemo(() => normalizeWholesalePriceTiers(product.priceTiers), [product.priceTiers]);
  const selectedTier = getWholesaleTierForQuantity(priceTiers, quantity);
  const bestTier = priceTiers[priceTiers.length - 1];
  const unitPrice = selectedTier?.unitPrice ?? 0;
  const estimatedTotal = unitPrice * quantity;
  const mainImageUrl = getCloudinaryImageUrl(selectedImage, { cloudName: cloudinaryCloudName, width: 900 });
  const isUnavailable = product.stockStatus === "out_of_stock";
  const whatsappLink = buildWhatsAppLink(product, selectedColor, quantity, selectedTier);
  const packageContents = product.packageContents ?? [];
  const faqs = product.faqs ?? [];
  const detailPanels = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p>{product.shortDescription ?? "A practical wholesale product selected for retail shops, social sellers, and bulk buyers."}</p>
          {product.profitNote ? <p className="wholesale-profit-note">{product.profitNote}</p> : null}
        </>
      ),
    },
    {
      id: "specifications",
      title: "Specifications",
      content: product.specifications?.length ? (
        <dl className="wholesale-details-specs">
          {product.specifications.map((specification) => (
            <div key={specification.label}>
              <dt>{specification.label}</dt>
              <dd>{specification.value}</dd>
            </div>
          ))}
          {product.dimensions ? <div><dt>Dimensions</dt><dd>{product.dimensions}</dd></div> : null}
          {product.weight ? <div><dt>Weight</dt><dd>{product.weight}</dd></div> : null}
        </dl>
      ) : (
        <p>Detailed specifications can be confirmed with support before placing a wholesale order.</p>
      ),
    },
    {
      id: "package",
      title: "Package Contents",
      content: packageContents.length ? (
        <ul className="wholesale-detail-list">
          {packageContents.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p>Package contents can be confirmed before dispatch because accessories may vary by supplier batch.</p>
      ),
    },
    {
      id: "delivery",
      title: "Delivery & COD",
      content: (
        <>
          <p>{product.deliveryEstimate ?? "Estimated delivery is confirmed after quantity, address, and product availability are reviewed."}</p>
          <p>{product.deliveryNote ?? "Islandwide delivery options are confirmed before dispatch."}</p>
          <p>{product.codAvailable === false ? "COD is not guaranteed for this item. Please confirm payment options by WhatsApp." : "Cash on Delivery may be available depending on delivery location and product availability."}</p>
        </>
      ),
    },
    {
      id: "returns",
      title: "Returns & Warranty",
      content: (
        <>
          <p>{product.returnNote ?? "Return support is available for damaged, defective, or incorrect items reported quickly after delivery."}</p>
          <p>{product.warrantyNote ?? "Basic supplier warranty applies for manufacturing defects. Misuse and physical damage are not covered."}</p>
        </>
      ),
    },
    {
      id: "reseller",
      title: "Reseller Notes",
      content: (
        <>
          <p>{product.marketingAssetsAvailable ? "Marketing assets may be available for reseller campaigns. Ask support for available photos or product media." : "Marketing assets can be requested, but availability may vary by product and supplier batch."}</p>
          {product.tags?.length ? <p>Discovery tags: {product.tags.join(", ")}</p> : null}
        </>
      ),
    },
    {
      id: "faq",
      title: "FAQ",
      content: faqs.length ? (
        <div className="wholesale-faq-list">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <strong>{faq.question}</strong>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Have a question about this wholesale product? Contact Pladatech on WhatsApp with the product name and quantity.</p>
      ),
    },
  ];

  return (
    <main className="wholesale-detail-page">
      <nav className="wholesale-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/wholesale">Wholesale</Link>
        <span>/</span>
        <Link href={`/wholesale?category=${product.category}`}>{categoryLabel}</Link>
        <span>/</span>
        <strong>{product.title}</strong>
      </nav>

      <section className="wholesale-detail-hero">
        <div className="wholesale-gallery">
          <div className="wholesale-gallery-main">
            <img
              src={mainImageUrl}
              alt={product.title}
              width={900}
              height={900}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_WHOLESALE_IMAGE;
              }}
            />
          </div>
          {gallery.length > 1 ? (
            <div className="wholesale-gallery-thumbs" aria-label="Product gallery">
              {gallery.map((publicId) => (
                <button
                  key={publicId}
                  type="button"
                  className={selectedImage === publicId ? "active" : ""}
                  onClick={() => setSelectedImage(publicId)}
                  aria-label={`Show ${product.title} image`}
                >
                  <img
                    src={getCloudinaryImageUrl(publicId, { cloudName: cloudinaryCloudName, width: 180 })}
                    alt=""
                    width={180}
                    height={180}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_WHOLESALE_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="wholesale-detail-panel">
          <div className="wholesale-detail-kicker">
            <span>{categoryLabel}{subcategoryLabel ? ` / ${subcategoryLabel}` : ""}</span>
            <strong className={`wholesale-stock wholesale-stock-${product.stockStatus}`}>{stockLabel(product.stockStatus)}</strong>
          </div>
          <h1>{product.title}</h1>
          {product.shortDescription ? <p className="wholesale-detail-summary">{product.shortDescription}</p> : null}

          <div className="wholesale-detail-moq">
            <span>Order options</span>
            <strong>{product.singleItemAvailable === false ? `${product.moq} pcs minimum` : "Single item orders available"}</strong>
            <small>{product.codAvailable === false ? "Confirm payment options before ordering" : "Cash on Delivery available where possible"}</small>
          </div>

          <div className="wholesale-service-grid" aria-label="Wholesale service highlights">
            <span>Single item {product.singleItemAvailable === false ? "by request" : "available"}</span>
            <span>{product.codAvailable === false ? "Payment confirm first" : "COD where possible"}</span>
            <span>Islandwide delivery</span>
            <span>Bulk pricing</span>
            {product.marketingAssetsAvailable ? <span>Marketing assets</span> : null}
          </div>

          {product.colors?.length ? (
            <div className="wholesale-colors wholesale-detail-colors" aria-label="Available colors">
              <span>Color: <strong>{selectedColor}</strong></span>
              <div className="wholesale-color-list">
                {product.colors.map((color) => (
                  <button
                    className={`wholesale-color-swatch${selectedColor === color ? " active" : ""}`}
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color}`}
                    aria-pressed={selectedColor === color}
                    title={color}
                  >
                    <i style={{ background: color }} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="wholesale-detail-tiers" aria-label="Wholesale price tiers">
            {priceTiers.map((tier) => (
              <button
                type="button"
                className={`${tier === bestTier ? "wholesale-tier wholesale-tier-best" : "wholesale-tier"}${selectedTier?.label === tier.label ? " wholesale-tier-active" : ""}`}
                key={`${tier.minQty}-${tier.maxQty ?? "plus"}`}
                onClick={() => setQuantity(tier.minQty)}
                aria-pressed={selectedTier?.label === tier.label}
              >
                {tier === bestTier ? <small>Best bulk price</small> : null}
                <strong>{formatLkr(tier.unitPrice)}</strong>
                <span>{tier.label}</span>
              </button>
            ))}
          </div>

          <label className="wholesale-qty-field">
            <span>Quantity</span>
            <input
              type="number"
              min={1}
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
            />
          </label>

          <div className="wholesale-order-summary" aria-label="Selected wholesale order summary">
            <div><span>Selected color</span><strong>{selectedColor || "Not selected"}</strong></div>
            <div><span>Quantity</span><strong>{quantity} pc{quantity === 1 ? "" : "s"}</strong></div>
            <div><span>Price tier</span><strong>{selectedTier?.label ?? "Not available"}</strong></div>
            <div><span>Unit price</span><strong>{formatLkr(unitPrice)}</strong></div>
            <div><span>Estimated total</span><strong>{formatLkr(estimatedTotal)}</strong></div>
          </div>

          <a className={`dark-button wholesale-detail-whatsapp${isUnavailable ? " is-disabled" : ""}`} href={isUnavailable ? undefined : whatsappLink} target="_blank" rel="noreferrer" aria-disabled={isUnavailable}>
            Order via WhatsApp
          </a>
          <p className="wholesale-detail-note">Wholesale pricing is confirmed before dispatch based on final quantity, color availability, and delivery location.</p>
        </div>
      </section>

      <section className="wholesale-detail-info">
        {detailPanels.map((panel) => (
          <article className="wholesale-detail-accordion" key={panel.id}>
            <button type="button" onClick={() => setOpenPanel(openPanel === panel.id ? "" : panel.id)} aria-expanded={openPanel === panel.id}>
              <span>{panel.title}</span>
              <strong>{openPanel === panel.id ? "−" : "+"}</strong>
            </button>
            {openPanel === panel.id ? <div className="wholesale-detail-panel-body">{panel.content}</div> : null}
          </article>
        ))}
      </section>

      {relatedProducts.length ? (
        <section className="wholesale-related">
          <div className="wholesale-results-head">
            <div>
              <span>More wholesale products</span>
              <h2>Related picks</h2>
            </div>
          </div>
          <div className="wholesale-product-grid">
            {relatedProducts.map((item) => (
              <WholesaleProductCard key={item.id} product={item} cloudinaryCloudName={cloudinaryCloudName} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="wholesale-mobile-sticky-cta" aria-label="Wholesale mobile order summary">
        <div>
          <span>{quantity} pc{quantity === 1 ? "" : "s"} · {selectedTier?.label ?? "Wholesale"}</span>
          <strong>{formatLkr(estimatedTotal)}</strong>
        </div>
        <a href={isUnavailable ? undefined : whatsappLink} className={isUnavailable ? "is-disabled" : ""} target="_blank" rel="noreferrer" aria-disabled={isUnavailable}>
          WhatsApp
        </a>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { getWholesaleCategoryLabel, getWholesaleSubcategoryLabel } from "@/data/wholesale-categories";
import { normalizeWholesalePriceTiers } from "@/data/wholesale-pricing";
import type { WholesaleProduct } from "@/data/wholesale-types";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";

// Replace this placeholder with the verified Pladatech wholesale WhatsApp number.
export const WHOLESALE_WHATSAPP_NUMBER = "947XXXXXXXX";
const WHOLESALE_PAGE_URL = "https://www.pladatech.com/wholesale";
const FALLBACK_WHOLESALE_IMAGE = "/wholesale/placeholder.svg";

function formatLkr(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value)}`;
}

export function generateWholesaleWhatsAppLink(product: WholesaleProduct, selectedColor?: string, pageUrl = WHOLESALE_PAGE_URL) {
  const tiers = normalizeWholesalePriceTiers(product.priceTiers).map((tier) => `${tier.label}: ${formatLkr(tier.unitPrice)} each`).join("\n");
  const message = [
    "Hi Pladatech, I want to order this wholesale product.",
    "",
    `Product: ${product.title}`,
    ...(selectedColor ? [`Color: ${selectedColor}`] : []),
    "Single item orders available",
    `COD: ${product.codAvailable === false ? "Please confirm availability" : "Available where possible"}`,
    "Price tiers:",
    tiers,
    "",
    "Product page:",
    pageUrl,
    "",
    "Please confirm availability and delivery.",
  ].join("\n");

  return `https://wa.me/${WHOLESALE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function stockLabel(status: WholesaleProduct["stockStatus"]) {
  if (status === "out_of_stock") return "Out of stock";
  if (status === "low_stock") return "Limited availability";
  return "In stock";
}

type WholesaleProductCardProps = {
  product: WholesaleProduct;
  cloudinaryCloudName: string;
};

export default function WholesaleProductCard({ product, cloudinaryCloudName }: WholesaleProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");
  const priceTiers = normalizeWholesalePriceTiers(product.priceTiers);
  const bestTierIndex = priceTiers.length - 1;
  const bestPrice = priceTiers[bestTierIndex]?.unitPrice ?? product.retailPrice;
  const isUnavailable = product.stockStatus === "out_of_stock";
  const imageUrl = product.imagePublicId
    ? getCloudinaryImageUrl(product.imagePublicId, { cloudName: cloudinaryCloudName, width: 600 })
    : FALLBACK_WHOLESALE_IMAGE;
  const categoryLabel = getWholesaleCategoryLabel(product.category);
  const subcategoryLabel = getWholesaleSubcategoryLabel(product.category, product.subcategory);

  return (
    <article className="wholesale-product-card">
      <div className="wholesale-product-image">
        <img
          src={imageUrl}
          alt={product.title}
          width={600}
          height={600}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_WHOLESALE_IMAGE;
          }}
        />
        {product.dealTag ? <span className="wholesale-deal-tag">{product.dealTag}</span> : null}
        <span className={`wholesale-stock wholesale-stock-${product.stockStatus}`}>{stockLabel(product.stockStatus)}</span>
      </div>

      <div className="wholesale-product-copy">
        <span className="wholesale-product-category">
          {categoryLabel}{subcategoryLabel ? ` / ${subcategoryLabel}` : ""}
        </span>
        <h2>{product.title}</h2>
        {product.shortDescription ? <p>{product.shortDescription}</p> : null}

        <div className="wholesale-card-price-row">
          <span>From</span>
          <strong>{formatLkr(bestPrice)}</strong>
          <small>Bulk price</small>
        </div>

        <div className="wholesale-card-badges" aria-label="Wholesale offer badges">
          {product.codAvailable !== false ? <span>COD</span> : null}
          {product.singleItemAvailable !== false ? <span>Single item</span> : null}
          {product.isNewArrival ? <span>New arrival</span> : null}
          {product.dealTag ? <span>{product.dealTag}</span> : null}
        </div>

        <div className="wholesale-product-meta">
          <span>Order</span>
          <strong>{product.singleItemAvailable === false ? `${product.moq} pcs minimum` : "Single item available"}</strong>
        </div>

        {product.colors?.length ? (
          <div className="wholesale-colors" aria-label="Available colors">
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

        <div className="wholesale-tier-grid" aria-label={`${product.title} wholesale prices`}>
          {priceTiers.map((tier, index) => (
            <div className={index === bestTierIndex ? "wholesale-tier wholesale-tier-best" : "wholesale-tier"} key={`${tier.minQty}-${tier.maxQty ?? "plus"}`}>
              {index === bestTierIndex ? <small>Best bulk price</small> : null}
              <strong>{formatLkr(tier.unitPrice)}</strong>
              <span>{tier.label}</span>
            </div>
          ))}
        </div>

        {product.profitNote ? <p className="wholesale-profit-note">{product.profitNote}</p> : null}

        <div className="wholesale-card-actions">
          <button
            className={`dark-button wholesale-whatsapp ${isUnavailable ? "is-disabled" : ""}`}
            type="button"
            onClick={() => {
              if (!isUnavailable) {
                window.open(generateWholesaleWhatsAppLink(product, selectedColor, window.location.href), "_blank", "noopener,noreferrer");
              }
            }}
            disabled={isUnavailable}
            aria-disabled={isUnavailable}
          >
            Order via WhatsApp
          </button>
          <Link className="outline-button" href={`/wholesale/${product.slug}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

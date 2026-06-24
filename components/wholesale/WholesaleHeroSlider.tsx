"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WholesaleBanner } from "@/data/wholesale-types";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";

const FALLBACK_WHOLESALE_IMAGE = "/wholesale/placeholder.svg";
const heroFeatureCards = [
  "Best Wholesale Prices",
  "Fast Islandwide Delivery",
  "Quality You Can Trust",
  "High Profit Potential",
];
const heroBenefitStrip = ["Single Item Available", "Bulk Discounts", "Regular New Arrivals", "Reseller Support"];

type WholesaleHeroSliderProps = {
  banners: WholesaleBanner[];
  cloudinaryCloudName: string;
};

export default function WholesaleHeroSlider({ banners, cloudinaryCloudName }: WholesaleHeroSliderProps) {
  const activeBanners = useMemo(
    () => banners.filter((banner) => banner.isActive).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [banners],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % activeBanners.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [activeBanners.length]);

  if (!activeBanners.length) return null;

  const banner = activeBanners[activeIndex] ?? activeBanners[0];
  const imageUrl = banner.imagePublicId
    ? getCloudinaryImageUrl(banner.imagePublicId, { cloudName: cloudinaryCloudName, width: 1100 })
    : FALLBACK_WHOLESALE_IMAGE;
  const primaryHref = banner.ctaHref || "/wholesale#all-wholesale-products";
  const primaryLabel = banner.ctaLabel || "Shop Wholesale";
  const highlightedTitle = highlightWholesaleTitle(banner.title);

  return (
    <section className="wholesale-hero-slider" aria-label="Wholesale featured offers">
      <div className="wholesale-hero-glow wholesale-hero-glow-one" aria-hidden="true" />
      <div className="wholesale-hero-glow wholesale-hero-glow-two" aria-hidden="true" />

      <div className="wholesale-hero-copy">
        {banner.badge ? <span className="wholesale-hero-badge">{banner.badge}</span> : null}
        <h1>{highlightedTitle}</h1>
        {banner.subtitle ? <p>{banner.subtitle}</p> : null}

        <div className="wholesale-hero-actions">
          <Link className="dark-button wholesale-hero-cta" href={primaryHref}>
            {primaryLabel}
          </Link>
          <Link className="outline-button wholesale-hero-secondary" href="/wholesale#all-wholesale-products">
            Browse Products
          </Link>
        </div>

        <div className="wholesale-hero-feature-grid" aria-label="Wholesale buyer benefits">
          {heroFeatureCards.map((feature) => (
            <span key={feature}>{feature}</span>
          ))}
        </div>
      </div>

      <div className="wholesale-hero-media">
        <img
          src={imageUrl}
          alt={banner.title}
          width={1100}
          height={720}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_WHOLESALE_IMAGE;
          }}
        />
      </div>

      <div className="wholesale-hero-benefit-strip" aria-label="Wholesale support benefits">
        {heroBenefitStrip.map((benefit) => (
          <span key={benefit}>{benefit}</span>
        ))}
      </div>

      {activeBanners.length > 1 ? (
        <div className="wholesale-hero-controls" aria-label="Wholesale banner controls">
          <button
            type="button"
            aria-label="Previous wholesale banner"
            onClick={() => setActiveIndex((current) => (current - 1 + activeBanners.length) % activeBanners.length)}
          >
            ‹
          </button>
          <div className="wholesale-hero-dots">
            {activeBanners.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === activeIndex ? "active" : ""}
                aria-label={`Show banner ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next wholesale banner"
            onClick={() => setActiveIndex((current) => (current + 1) % activeBanners.length)}
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}

function highlightWholesaleTitle(title: string) {
  const highlightPattern = /\b(wholesale|reseller|resellers|bulk|products|deals|sellers)\b/i;
  const words = title.split(/(\s+)/);

  return words.map((word, index) => {
    if (!highlightPattern.test(word)) return word;
    return <strong key={`${word}-${index}`}>{word}</strong>;
  });
}

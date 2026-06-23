"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WholesaleBanner } from "@/data/wholesale-types";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";

const FALLBACK_WHOLESALE_IMAGE = "/wholesale/placeholder.svg";

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

  return (
    <section className="wholesale-hero-slider" aria-label="Wholesale featured offers">
      <div className="wholesale-hero-copy">
        {banner.badge ? <span className="wholesale-hero-badge">{banner.badge}</span> : null}
        <h1>{banner.title}</h1>
        {banner.subtitle ? <p>{banner.subtitle}</p> : null}
        {banner.ctaHref && banner.ctaLabel ? (
          <Link className="dark-button wholesale-hero-cta" href={banner.ctaHref}>
            {banner.ctaLabel}
          </Link>
        ) : null}
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

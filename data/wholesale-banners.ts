import type { WholesaleBanner } from "./wholesale-types";

export const wholesaleBanners: WholesaleBanner[] = [
  {
    id: "wholesale-fast-moving-products",
    title: "Fast-moving wholesale products for online sellers",
    subtitle: "Source practical items with single-order availability, bulk pricing, and reseller-friendly support.",
    imagePublicId: "wholesale/banners/fast-moving-products",
    ctaLabel: "Browse hot deals",
    ctaHref: "#hot-wholesale-deals",
    badge: "Hot wholesale picks",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "wholesale-low-price-items",
    title: "Low-ticket products built for quick sales",
    subtitle: "Find impulse-friendly items for Facebook, TikTok, Instagram, and small shop promotions.",
    imagePublicId: "wholesale/banners/low-ticket-products",
    ctaLabel: "Shop under Rs. 1,000",
    ctaHref: "#under-rs-1000",
    badge: "Low price range",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "wholesale-new-arrivals",
    title: "New arrivals for fresh reseller content",
    subtitle: "Refresh your catalog with products that are easy to explain, demonstrate, and bundle.",
    imagePublicId: "wholesale/banners/new-arrivals",
    ctaLabel: "See new arrivals",
    ctaHref: "#new-arrivals",
    badge: "Fresh stock",
    isActive: true,
    sortOrder: 3,
  },
];

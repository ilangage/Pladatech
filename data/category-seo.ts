import type { Category } from "./types";

export type CategorySeoContent = {
  intro: string;
  buyingTips: string[];
  faqs: Array<{ q: string; a: string }>;
  internalLinks: Array<{ label: string; href: string }>;
};

export const categorySeoContent: Record<Category, CategorySeoContent> = {
  "Smart Cleaning": {
    intro:
      "Compare smart cleaning essentials for floors, pet hair, spills, carpets, and everyday home upkeep. These products are selected for practical use, simple storage, and cleaner daily routines.",
    buyingTips: ["Check the surface type before choosing a cleaner.", "Compare battery life, tank size, attachments, and storage needs.", "For pet homes, prioritize hair pickup and easy washable parts."],
    faqs: [
      { q: "Which smart cleaning product should I start with?", a: "For most homes, a robot vacuum or cordless stick vacuum is the best first upgrade. Add a spot cleaner if you have pets, kids, or carpets." },
      { q: "Do these products ship to USA and UK customers?", a: "Eligible products include USA/UK shipping options at checkout. Delivery timing depends on stock and destination." },
      { q: "Can I return a cleaning product?", a: "Eligible unused items can be returned within 30 days. Review the returns page and contact support before sending anything back." },
    ],
    internalLinks: [
      { label: "Best Sellers", href: "/collections/best-sellers" },
      { label: "Smart Cleaning Essentials", href: "/collections/smart-cleaning-essentials" },
      { label: "Shipping Policy", href: "/shipping" },
    ],
  },
  "Kitchen & Wellness": {
    intro:
      "Shop practical kitchen and wellness products for faster meals, cleaner routines, and simple self-care. This category focuses on items that are easy to use, giftable, and useful every week.",
    buyingTips: ["Check capacity and counter space for kitchen appliances.", "For wellness tools, compare intensity levels, attachments, and charging type.", "Review included accessories before choosing between similar products."],
    faqs: [
      { q: "Are kitchen and wellness products suitable for gifts?", a: "Yes. Many products in this category are practical gift options because they are useful, compact, and easy to understand." },
      { q: "What should I check before buying an air fryer?", a: "Compare capacity, drawer style, cleaning needs, and the amount of counter space available." },
      { q: "Do wellness products include support?", a: "Product pages include setup and support notes. Contact support if you need help choosing the right item." },
    ],
    internalLinks: [
      { label: "Kitchen & Wellness Picks", href: "/collections/kitchen-wellness-picks" },
      { label: "Wellness Bundle", href: "/bundles/wellness-bundle" },
      { label: "Returns & Refunds", href: "/returns" },
    ],
  },
  "Pet & Home Security": {
    intro:
      "Find pet-care and home-security essentials for easier routines, front-door awareness, and day-to-day peace of mind. Products are chosen for simple setup and practical home use.",
    buyingTips: ["For pet devices, check capacity, cleaning steps, and app/camera features.", "For security items, compare battery life, mounting needs, and storage options.", "Choose products that fit your rental or home setup without complicated installation."],
    faqs: [
      { q: "Are pet cameras and feeders beginner-friendly?", a: "Most selected products are designed for simple setup. Check the product specs and included items before ordering." },
      { q: "Do doorbell products need professional installation?", a: "Many battery doorbells are designed for straightforward setup, but installation requirements can vary by product and home." },
      { q: "Can I track my order after buying?", a: "Tracking information is provided when available. You can also contact support with your order number." },
    ],
    internalLinks: [
      { label: "Pet & Home Security Picks", href: "/collections/pet-home-security-picks" },
      { label: "Pet Owner Bundle", href: "/bundles/pet-owner-bundle" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  "Car & Mobile Essentials": {
    intro:
      "Explore car and mobile accessories for safer drives, easier charging, emergency readiness, and everyday convenience. Compare compact tools built for commuting, travel, and daily use.",
    buyingTips: ["For car safety products, check battery capacity and included cables.", "For chargers and mounts, confirm phone compatibility and mounting style.", "For travel use, prioritize compact size and reliable storage."],
    faqs: [
      { q: "What is the best car accessory to keep for emergencies?", a: "A lithium jump starter is a practical emergency item because it helps with unexpected battery issues and is easy to store." },
      { q: "Are mobile accessories compatible with every phone?", a: "Compatibility depends on the phone, case, and charging standard. Check product details before ordering." },
      { q: "Can I buy car products as a bundle?", a: "Yes. The Car Safety Bundle groups key driving essentials with a clearer bundle discount." },
    ],
    internalLinks: [
      { label: "Car & Mobile Picks", href: "/collections/car-mobile-picks" },
      { label: "Car Safety Bundle", href: "/bundles/car-safety-bundle" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
};

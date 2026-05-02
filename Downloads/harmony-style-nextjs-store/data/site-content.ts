import type { NavItem } from "./types";

export const announcementBar =
  "Free shipping offers available for USA & UK orders | Secure checkout | 30-day returns";

export const heroSlides = [
  {
    eyebrow: "Pladatech",
    title: "Smart Essentials for Cleaner, Safer & Easier Living",
    subheadline:
      "Discover practical home, kitchen, pet, car and mobile gadgets designed to save time, solve everyday problems and upgrade modern living.",
    primaryCta: "Shop Best Sellers",
    primaryHref: "/collections/best-sellers",
    secondaryCta: "Explore Bundles",
    secondaryHref: "/bundles/smart-cleaning-bundle",
    image: "/hero/pladatech-hero.png",
  },
];

export const navItems: NavItem[] = [
  { label: "Home", href: "/#top" },
  { label: "Shop", href: "/#products" },
  { label: "Smart Cleaning", href: "/categories/smart-cleaning" },
  { label: "Kitchen & Wellness", href: "/categories/kitchen-wellness" },
  { label: "Pet & Home Security", href: "/categories/pet-home-security" },
  { label: "Car & Mobile", href: "/categories/car-mobile-essentials" },
  { label: "Bundles", href: "/#bundles" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/#contact" },
];

export const shopFeedHeading = {
  title: "Shop by Everyday Need",
  subtitle: "Curated smart lifestyle picks for USA and UK customers.",
  profileHandle: "@Pladatech",
};

export const lookbookContent = {
  kicker: "Featured smart home",
  title: "Upgrade the Rooms You Live In Most",
  roomImage: "/hero/lookbook-room.png",
};

export const bestSellersSection = {
  kicker: "Best-Selling Problem Solvers",
  title: "Best Sellers",
};

export const trustRowItems: { icon: "truck" | "shield" | "box" | "star"; title: string; copy: string }[] = [
  { icon: "truck", title: "Fast USA & UK Shipping", copy: "Practical delivery options for eligible orders" },
  { icon: "shield", title: "Secure Checkout", copy: "Protected payment flow" },
  { icon: "box", title: "30-Day Returns", copy: "Eligible items per policy at checkout" },
  { icon: "star", title: "Practical Tested Products", copy: "Curated useful smart lifestyle picks" },
  { icon: "shield", title: "Customer Support", copy: "Helpful answers when you need them" },
];

export const quickOrderSection = {
  kicker: "Save More with Smart Bundles",
  title: "Bundle-ready essentials",
};

export const brandMarqueeItems = [
  "Smart home gadgets",
  "Home cleaning gadgets",
  "Kitchen gadgets",
  "Pet gadgets",
  "Car accessories",
  "USA UK online gadget store",
  "Pladatech",
  "Dash cam bundle",
  "Robot vacuum and mop",
  "Magnetic power bank",
  "Air fryer",
  "Dehumidifier",
  "Massage gun",
];

export const storiesContent = [
  {
    title: "How to choose a robot vacuum for pet hair",
    tag: "Smart Cleaning",
    date: "April 12, 2026",
    image: "/stories/story-cleaning.png",
    excerpt: "A practical read on floors, schedules, and everyday mess control for busy homes.",
  },
  {
    title: "Kitchen upgrades that save real time",
    tag: "Kitchen & Wellness",
    date: "April 18, 2026",
    image: "/stories/story-kitchen.png",
    excerpt: "Dual-zone cooking, compact options, and simple routines for weeknight meals.",
  },
  {
    title: "Front-door peace of mind for renters",
    tag: "Pet & Home Security",
    date: "April 22, 2026",
    image: "/stories/story-security.png",
    excerpt: "Battery doorbells, comfort gadgets, and pet check-ins without complicated installs.",
  },
];

export type ProblemBlock = {
  question: string;
  productSlugs: string[];
};

export const problemSolution = {
  title: "Shop by Problem, Not Just Product",
  blocks: [
    {
      question: "Pet hair everywhere?",
      productSlugs: ["robot-vacuum-mop-combo", "cordless-stick-vacuum", "portable-spot-carpet-cleaner"],
    },
    {
      question: "Want faster cooking?",
      productSlugs: ["dual-zone-air-fryer", "single-drawer-air-fryer"],
    },
    {
      question: "Need daily relaxation?",
      productSlugs: ["massage-gun", "neck-shoulder-massager", "water-flosser"],
    },
    {
      question: "Worried about car safety?",
      productSlugs: ["front-rear-dash-cam-bundle", "lithium-jump-starter", "magsafe-car-charger-mount"],
    },
    {
      question: "Need smarter home comfort?",
      productSlugs: ["compact-dehumidifier", "battery-video-doorbell-kit", "automatic-pet-feeder-camera"],
    },
  ] as ProblemBlock[],
};

export const collectionsSection = {
  title: "Curated collections",
  subtitle: "Shop popular combinations for real routines",
};

export const whyShopSection = {
  title: "Practical Products. Clear Prices. Trusted Shopping.",
  points: [
    "Curated useful products only",
    "Secure checkout",
    "USA & UK friendly product selection",
    "Clear shipping and returns",
    "Helpful customer support",
  ],
};

export const finalCta = {
  headline: "Upgrade Your Everyday Life with Smart Essentials",
  subheadline: "Shop practical gadgets for your home, car, pet, kitchen and mobile lifestyle.",
  cta: "Shop Best Sellers",
  href: "/collections/best-sellers",
};

export const faqs = [
  {
    q: "Where does Pladatech ship?",
    a: "Pladatech is designed for USA and UK customers. Shipping options and delivery times can vary depending on the product and destination.",
  },
  {
    q: "Are these products ready to use?",
    a: "Most products are designed for simple everyday use and include basic setup instructions or user guides where applicable.",
  },
  {
    q: "Can I return a product?",
    a: "Eligible items can be returned within 30 days according to our returns policy. Items must meet the return conditions shown at checkout or in the policy page.",
  },
  {
    q: "Are the product images final?",
    a: "Product images are currently demo images and can be replaced later with final supplier or brand images.",
  },
  {
    q: "Are these products suitable for gifts?",
    a: "Many Pladatech products are practical gift options, especially smart cleaning, wellness, pet, car, and mobile accessories.",
  },
];

export const contactFormTopics = [
  "Smart Cleaning",
  "Kitchen & Wellness",
  "Pet & Home Security",
  "Car & Mobile Essentials",
  "Order help",
];

export const policies = {
  about: {
    title: "About Pladatech",
    body: "Pladatech is a modern e-commerce store focused on practical smart lifestyle products for cleaner, safer and easier everyday living. We curate useful products across smart cleaning, kitchen, wellness, pet care, home security, car accessories and mobile essentials.",
  },
  shipping: {
    title: "Shipping",
    body: "We offer shipping options for eligible USA and UK orders. Delivery times may vary depending on product availability, shipping method and destination. Tracking details will be provided when available.",
  },
  returns: {
    title: "Returns",
    body: "Eligible items may be returned within 30 days according to our return conditions. Products must be unused, in original condition where applicable, and returned with all included accessories.",
  },
  contact: {
    title: "Contact",
    body: "Need help with an order or product question? Contact our support team and we will help you as soon as possible.",
  },
  trackOrder: {
    title: "Track your order",
    body: "Customers can track their order using the order tracking details provided after purchase.",
  },
  privacy: {
    title: "Privacy",
    body: "We respect your privacy. This placeholder page will be replaced with a full privacy policy describing how personal data is collected, used, and protected.",
  },
  terms: {
    title: "Terms of use",
    body: "These placeholder terms will be replaced with full legal terms governing use of the Pladatech website and purchases.",
  },
};

export const footerContent = {
  collections: [
    { label: "Best Sellers", href: "/collections/best-sellers" },
    { label: "Smart Cleaning Essentials", href: "/collections/smart-cleaning-essentials" },
    { label: "Kitchen & Wellness Picks", href: "/collections/kitchen-wellness-picks" },
    { label: "Pet & Home Security Picks", href: "/collections/pet-home-security-picks" },
    { label: "Car & Mobile Picks", href: "/collections/car-mobile-picks" },
  ],
  information: [
    { label: "About", href: "/about" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "FAQs", href: "/#contact" },
    { label: "Contact", href: "/contact" },
  ],
  phone: "+1 (800) 555-0142",
  email: "hello@pladatech.example",
  newsletterTitle: "Stay in the loop with Pladatech updates",
  copyright: "© 2026 Pladatech. Powered by Next.js",
};

export const promoPopup = {
  kicker: "Welcome offer",
  title: "Get updates on new smart essentials",
  body: "Join the list for product drops and practical living tips. Use code PLADATECH10 when checkout is connected.",
  code: "PLADATECH10",
};

export const megaMenu = {
  collectionsTitle: "Collections",
  shopByNeedTitle: "Shop by everyday need",
  needLinks: [
    { label: "Pet hair & floors", href: "/#problem-solution" },
    { label: "Faster cooking", href: "/collections/kitchen-wellness-picks" },
    { label: "Travel & charging", href: "/collections/car-mobile-picks" },
    { label: "Home comfort", href: "/collections/pet-home-security-picks" },
  ],
  promoEyebrow: "Featured",
  promoTitle: "Smart Cleaning Essentials",
  promoCopy: "Practical tools for floors, spills, pet messes, and home organization.",
  promoHref: "/collections/smart-cleaning-essentials",
  promoCta: "Shop collection",
};

export const homeMetadata = {
  title: "Pladatech | Smart Home, Cleaning, Kitchen, Pet, Car & Mobile Gadgets",
  description:
    "Shop practical smart lifestyle products for cleaner, safer and easier everyday living. Explore smart cleaning, kitchen, wellness, pet, car and mobile essentials for USA and UK customers.",
};

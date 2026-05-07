export type Category =
  | "Smart Cleaning"
  | "Kitchen & Wellness"
  | "Pet & Home Security"
  | "Car & Mobile Essentials";

export type Product = {
  id: string | number;
  databaseId?: string;
  title: string;
  slug: string;
  brand: string;
  category: Category;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  badgeKey: "new" | "sale" | "promo";
  stock: number;
  preorder?: boolean;
  colors: string[];
  specs: { label: string; value: string }[];
  image: string;
  hoverImage: string;
  gallery: string[];
  description: string;
  shortDescription: string;
  features: string[];
  whatIncluded: string[];
  whyCustomersLoveIt: string[];
  fullSpecs: { label: string; value: string }[];
  shippingReturns: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  relatedSlugs: string[];
  sortOrder?: number;
  isActive?: boolean;
};

export type CategoryMeta = {
  name: Category;
  slug: string;
  description: string;
  image: string;
};

export type Collection = {
  name: string;
  slug: string;
  description: string;
  productSlugs: string[];
  image: string;
};

export type Bundle = {
  name: string;
  slug: string;
  price: number;
  comparePrice: number;
  description: string;
  productSlugs: string[];
  image: string;
};

export type Review = {
  name: string;
  rating: number;
  text: string;
};

export type ProductReview = {
  id?: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  photo: string;
  note: string;
  badge: string;
  title?: string;
  date?: string;
  source?: string;
  verifiedPurchase?: boolean;
};

export type NavItem = { label: string; href: string };

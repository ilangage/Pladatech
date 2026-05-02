import { bundles } from "./bundles";
import { categoryList } from "./categories";
import { collections } from "./collections";
import { demoReviews } from "./reviews";
import {
  announcementBar,
  bestSellersSection,
  brandMarqueeItems,
  collectionsSection,
  contactFormTopics,
  faqs,
  finalCta,
  footerContent,
  heroSlides,
  homeMetadata,
  lookbookContent,
  megaMenu,
  navItems,
  policies,
  problemSolution,
  promoPopup,
  quickOrderSection,
  shopFeedHeading,
  storiesContent,
  trustRowItems,
  whyShopSection,
} from "./site-content";
import { products, getProduct, getProductsByCategorySlug, getProductsBySlugs, productBySlug } from "./products";
import type { Category, Product } from "./types";

export const categories: Category[] = categoryList.map((c) => c.name);

export {
  bundles,
  categoryList,
  collections,
  demoReviews,
  products,
  getProduct,
  getProductsByCategorySlug,
  getProductsBySlugs,
  productBySlug,
};
export type { Category, Product };
export {
  announcementBar,
  bestSellersSection,
  brandMarqueeItems,
  collectionsSection,
  contactFormTopics,
  faqs,
  finalCta,
  footerContent,
  heroSlides,
  homeMetadata,
  lookbookContent,
  megaMenu,
  navItems,
  policies,
  problemSolution,
  promoPopup,
  quickOrderSection,
  shopFeedHeading,
  storiesContent,
  trustRowItems,
  whyShopSection,
};

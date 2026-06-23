export type WholesaleStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type WholesalePriceTier = {
  label: string;
  minQty: number;
  maxQty?: number;
  unitPrice: number;
};

export type WholesaleSpecification = {
  label: string;
  value: string;
};

export type WholesaleFaq = {
  question: string;
  answer: string;
};

export type WholesaleProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  shortDescription?: string;
  imagePublicId: string;
  galleryPublicIds?: string[];
  colors?: string[];
  stockStatus: WholesaleStockStatus;
  moq: number;
  retailPrice: number;
  suggestedSellPrice?: number;
  priceTiers: WholesalePriceTier[];
  profitNote?: string;
  specifications?: WholesaleSpecification[];
  dealTag?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  tags?: string[];
  packageContents?: string[];
  deliveryEstimate?: string;
  deliveryNote?: string;
  codAvailable?: boolean;
  singleItemAvailable?: boolean;
  returnNote?: string;
  warrantyNote?: string;
  marketingAssetsAvailable?: boolean;
  videoPublicIds?: string[];
  faqs?: WholesaleFaq[];
  dimensions?: string;
  weight?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  sortOrder?: number;
};

export type WholesaleBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imagePublicId: string;
  ctaLabel?: string;
  ctaHref?: string;
  badge?: string;
  isActive: boolean;
  sortOrder?: number;
};

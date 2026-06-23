export type WholesaleSubcategoryConfig = {
  label: string;
  value: string;
};

export type WholesaleCategoryConfig = {
  label: string;
  value: string;
  description?: string;
  subcategories?: WholesaleSubcategoryConfig[];
};

export const wholesaleCategories = [
  {
    label: "All",
    value: "all",
    description: "Browse every active wholesale product.",
  },
  {
    label: "Kitchen & Dining",
    value: "kitchen-dining",
    description: "Fast-moving kitchen tools, drinkware accessories, storage, and prep gadgets.",
    subcategories: [
      { label: "Coffee & Tea Tools", value: "coffee-tea-tools" },
      { label: "Mini Blenders", value: "mini-blenders" },
      { label: "Food Storage", value: "food-storage" },
      { label: "Kitchen Tools", value: "kitchen-tools" },
    ],
  },
  {
    label: "Home & Living",
    value: "home-living",
    description: "Home utility, decor, laundry, and organizer products for everyday sellers.",
    subcategories: [
      { label: "Lights & Decor", value: "lights-decor" },
      { label: "Cleaning Tools", value: "cleaning-tools" },
      { label: "Storage & Organizers", value: "storage-organizers" },
      { label: "Laundry & Garment Care", value: "laundry-garment-care" },
    ],
  },
  {
    label: "Beauty & Personal Care",
    value: "beauty-personal-care",
    description: "Beauty, wellness, grooming, and personal care items.",
    subcategories: [
      { label: "Hair Tools", value: "hair-tools" },
      { label: "Skin Care Tools", value: "skin-care-tools" },
      { label: "Massage & Wellness", value: "massage-wellness" },
      { label: "Travel Care", value: "travel-care" },
    ],
  },
  {
    label: "Car Accessories",
    value: "car-accessories",
    description: "Car cleaning, organization, safety, charging, and driving accessories.",
    subcategories: [
      { label: "Car Cleaning", value: "car-cleaning" },
      { label: "Charging Accessories", value: "charging-accessories" },
      { label: "Organizers", value: "organizers" },
      { label: "Safety Accessories", value: "safety-accessories" },
    ],
  },
  {
    label: "Mobile & Gadgets",
    value: "mobile-gadgets",
    description: "Creator tools, phone accessories, chargers, and small smart gadgets.",
    subcategories: [
      { label: "Microphones", value: "microphones" },
      { label: "Chargers & Cables", value: "chargers-cables" },
      { label: "Phone Accessories", value: "phone-accessories" },
      { label: "Smart Gadgets", value: "smart-gadgets" },
    ],
  },
  {
    label: "Pet Supplies",
    value: "pet-supplies",
    description: "Pet grooming, feeding, cleaning, and home care products.",
    subcategories: [
      { label: "Pet Grooming", value: "pet-grooming" },
      { label: "Feeding Tools", value: "feeding-tools" },
      { label: "Pet Cleaning", value: "pet-cleaning" },
      { label: "Pet Travel", value: "pet-travel" },
    ],
  },
  {
    label: "Tools & Cleaning",
    value: "tools-cleaning",
    description: "Practical cleaning products, repair tools, and home maintenance items.",
    subcategories: [
      { label: "Home Cleaning", value: "home-cleaning" },
      { label: "Repair Tools", value: "repair-tools" },
      { label: "Organizing Tools", value: "organizing-tools" },
      { label: "Outdoor Cleaning", value: "outdoor-cleaning" },
    ],
  },
  {
    label: "Fashion Accessories",
    value: "fashion-accessories",
    description: "Accessory products for fashion, gifting, and boutique sellers.",
    subcategories: [
      { label: "Bags & Pouches", value: "bags-pouches" },
      { label: "Travel Accessories", value: "travel-accessories" },
      { label: "Jewelry Accessories", value: "jewelry-accessories" },
      { label: "Wardrobe Care", value: "wardrobe-care" },
    ],
  },
  {
    label: "Baby & Kids",
    value: "baby-kids",
    description: "Parent-friendly daily-use products for baby and kids sellers.",
    subcategories: [
      { label: "Baby Care", value: "baby-care" },
      { label: "Kids Accessories", value: "kids-accessories" },
      { label: "Learning Toys", value: "learning-toys" },
      { label: "Travel Essentials", value: "travel-essentials" },
    ],
  },
] as const satisfies readonly WholesaleCategoryConfig[];

export const wholesaleCategoryOptions = wholesaleCategories.filter((category) => category.value !== "all");

const legacyCategoryMap = new Map<string, string>([
  ["all", "all"],
  ["kitchen", "kitchen-dining"],
  ["kitchen & dining", "kitchen-dining"],
  ["kitchen-dining", "kitchen-dining"],
  ["home & living", "home-living"],
  ["home-living", "home-living"],
  ["beauty", "beauty-personal-care"],
  ["beauty & personal care", "beauty-personal-care"],
  ["beauty-personal-care", "beauty-personal-care"],
  ["car accessories", "car-accessories"],
  ["car-accessories", "car-accessories"],
  ["gadgets", "mobile-gadgets"],
  ["mobile & gadgets", "mobile-gadgets"],
  ["mobile-gadgets", "mobile-gadgets"],
  ["pet supplies", "pet-supplies"],
  ["pet-supplies", "pet-supplies"],
  ["tools & cleaning", "tools-cleaning"],
  ["tools-cleaning", "tools-cleaning"],
  ["fashion accessories", "fashion-accessories"],
  ["fashion-accessories", "fashion-accessories"],
  ["baby & kids", "baby-kids"],
  ["baby-kids", "baby-kids"],
]);

export function normalizeWholesaleCategory(value: string | null | undefined) {
  const key = (value ?? "").trim().toLowerCase();
  return legacyCategoryMap.get(key) ?? value ?? "kitchen-dining";
}

export function getWholesaleCategory(value: string | null | undefined): WholesaleCategoryConfig {
  const normalized = normalizeWholesaleCategory(value);
  return wholesaleCategories.find((category) => category.value === normalized) ?? wholesaleCategoryOptions[0];
}

export function getWholesaleCategoryLabel(value: string | null | undefined) {
  return getWholesaleCategory(value).label;
}

export function getWholesaleSubcategory(categoryValue: string | null | undefined, subcategoryValue: string | null | undefined) {
  const category = getWholesaleCategory(categoryValue);
  return category.subcategories?.find((subcategory) => subcategory.value === subcategoryValue);
}

export function getWholesaleSubcategoryLabel(categoryValue: string | null | undefined, subcategoryValue: string | null | undefined) {
  return getWholesaleSubcategory(categoryValue, subcategoryValue)?.label ?? "";
}

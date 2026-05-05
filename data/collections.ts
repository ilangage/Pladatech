import type { Collection } from "./types";

export const collections: Collection[] = [
  {
    name: "Best Sellers",
    slug: "best-sellers",
    description:
      "Our most popular smart lifestyle products for cleaner, safer and easier everyday living.",
    productSlugs: [
      "robot-vacuum-mop-combo",
      "dual-zone-air-fryer",
      "automatic-pet-feeder-camera",
      "front-rear-dash-cam-bundle",
      "massage-gun",
      "compact-dehumidifier",
    ],
    image: "/collections/best-sellers.png",
  },
  {
    name: "Smart Cleaning Essentials",
    slug: "smart-cleaning-essentials",
    description: "Practical cleaning tools for floors, carpets, pet messes, and home organization.",
    productSlugs: [
      "robot-vacuum-mop-combo",
      "cordless-stick-vacuum",
      "portable-spot-carpet-cleaner",
      "vacuum-storage-bags",
    ],
    image: "/collections/smart-cleaning-essentials.png",
  },
  {
    name: "Kitchen & Wellness Picks",
    slug: "kitchen-wellness-picks",
    description: "Kitchen and wellness essentials for easier routines and everyday comfort.",
    productSlugs: [
      "dual-zone-air-fryer",
      "single-drawer-air-fryer",
      "water-flosser",
      "massage-gun",
      "neck-shoulder-massager",
    ],
    image: "/collections/kitchen-wellness-picks.png",
  },
  {
    name: "Pet & Home Security Picks",
    slug: "pet-home-security-picks",
    description: "Useful products for pet care, room comfort, and home monitoring.",
    productSlugs: ["automatic-pet-feeder-camera", "compact-dehumidifier", "battery-video-doorbell-kit"],
    image: "/collections/pet-home-security-picks.png",
  },
  {
    name: "Car & Mobile Picks",
    slug: "car-mobile-picks",
    description: "Practical gadgets for drivers, commuters, travel, and daily charging.",
    productSlugs: [
      "front-rear-dash-cam-bundle",
      "lithium-jump-starter",
      "magnetic-power-bank-10000mah",
      "magsafe-car-charger-mount",
    ],
    image: "/collections/car-mobile-picks.png",
  },
];

import type { Bundle } from "./types";

export const bundles: Bundle[] = [
  {
    name: "Smart Cleaning Bundle",
    slug: "smart-cleaning-bundle",
    price: 479,
    comparePrice: 707,
    description: "A practical home cleaning bundle for floors, spills, and storage.",
    productSlugs: ["robot-vacuum-mop-combo", "portable-spot-carpet-cleaner", "vacuum-storage-bags"],
    image: "/bundles/smart-cleaning-bundle.png",
  },
  {
    name: "Wellness Bundle",
    slug: "wellness-bundle",
    price: 199,
    comparePrice: 327,
    description: "A simple wellness bundle for relaxation and daily self-care routines.",
    productSlugs: ["massage-gun", "neck-shoulder-massager", "water-flosser"],
    image: "/bundles/wellness-bundle.png",
  },
  {
    name: "Car Safety Bundle",
    slug: "car-safety-bundle",
    price: 279,
    comparePrice: 447,
    description: "A practical driving bundle for recording, emergency support, and phone charging.",
    productSlugs: ["front-rear-dash-cam-bundle", "lithium-jump-starter", "magsafe-car-charger-mount"],
    image: "/bundles/car-safety-bundle.png",
  },
  {
    name: "Pet Owner Bundle",
    slug: "pet-owner-bundle",
    price: 579,
    comparePrice: 847,
    description: "A smart bundle for pet owners who want easier cleaning and feeding.",
    productSlugs: ["automatic-pet-feeder-camera", "portable-spot-carpet-cleaner", "robot-vacuum-mop-combo"],
    image: "/bundles/pet-owner-bundle.png",
  },
];

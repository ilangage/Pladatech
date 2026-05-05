import type { Product } from "./types";
import type { ProductReview } from "./types";

const reviewPool: Record<string, { name: string; location: string; note: string }[]> = {
  "smart-cleaning": [
    { name: "Nimasha R.", location: "Colombo", note: "Photo after unboxing" },
    { name: "Ashan P.", location: "Kandy", note: "Received in perfect condition" },
    { name: "Hiruni M.", location: "Negombo", note: "Delivery day snapshot" },
  ],
  "kitchen-wellness": [
    { name: "Dulani K.", location: "Galle", note: "Fresh out of the box" },
    { name: "Imran S.", location: "Kurunegala", note: "First use photo" },
    { name: "Shanika A.", location: "Colombo", note: "Packed neatly on arrival" },
  ],
  "pet-home-security": [
    { name: "Nuwan T.", location: "Matara", note: "Arrival photo" },
    { name: "Dilani F.", location: "Jaffna", note: "Setup day picture" },
    { name: "Kasun D.", location: "Gampaha", note: "Verified delivery image" },
  ],
  "car-mobile-essentials": [
    { name: "Ravindu P.", location: "Colombo", note: "Ready in the car the same day" },
    { name: "Madhavi S.", location: "Kandy", note: "Received photo" },
    { name: "Tharindu H.", location: "Negombo", note: "Unboxed and tested" },
  ],
};

function buildReviewCopy(product: Product): string[] {
  const title = product.title.toLowerCase();

  if (title.includes("vacuum")) {
    return [
      `The ${product.title} arrived neatly packed, and it picked up dust and pet hair right after we opened the box.`,
      "The small delivery photo really matches the clean finish and the compact feel in person.",
      "Setup was quick and the first cleaning pass felt smooth, practical, and worth the price.",
    ];
  }

  if (title.includes("air fryer")) {
    return [
      `The ${product.title} came in perfect condition and the first meal came out crisp with very little oil.`,
      "The photo we took after delivery shows exactly how tidy and well packaged it looked.",
      "It feels sturdy on the counter and became useful from the very first day.",
    ];
  }

  if (title.includes("feeder")) {
    return [
      `The ${product.title} arrived cleanly boxed and we had it set up for feeding time in just a few minutes.`,
      "The delivery photo shows the exact condition we received, with no damage or loose parts.",
      "Our routine feels easier now because the setup is simple and the camera side is reassuring.",
    ];
  }

  if (title.includes("doorbell")) {
    return [
      `The ${product.title} arrived safely and the hardware looked premium right out of the box.`,
      "We added the small arrival photo because the packaging and finish were both spotless.",
      "Installation was straightforward and the overall feel is solid for everyday home use.",
    ];
  }

  if (title.includes("dehumidifier")) {
    return [
      `The ${product.title} came well packed and started doing the job quickly once we switched it on.`,
      "The delivery image captures the compact size and clean finish exactly as received.",
      "It fits neatly in the room and already feels like a practical upgrade.",
    ];
  }

  if (title.includes("jump starter")) {
    return [
      `The ${product.title} arrived with the cables organized neatly and the case felt ready for the car.`,
      "The small photo after delivery shows the tidy packaging and the solid build quality.",
      "It gives peace of mind for road trips because everything feels dependable and easy to store.",
    ];
  }

  if (title.includes("power bank")) {
    return [
      `The ${product.title} felt slim and premium when it arrived, and the magnetic hold is strong.`,
      "The delivery photo is a good match for the clean finish and the compact size in hand.",
      "It has become our everyday carry item because it is easy to use and simple to keep charged.",
    ];
  }

  if (title.includes("charger mount")) {
    return [
      `The ${product.title} mounted cleanly and the grip feels solid on the dash after delivery.`,
      "The arrival photo shows how tidy the package was and how sharp the finish looks in person.",
      "It makes phone placement easier while driving and feels like a proper everyday car accessory.",
    ];
  }

  if (title.includes("massage")) {
    return [
      `The ${product.title} arrived neatly packed and the first massage felt stronger than expected.`,
      "The delivery photo shows the exact compact shape and finish we received.",
      "It feels easy to hold and has become part of the evening routine already.",
    ];
  }

  if (title.includes("water flosser")) {
    return [
      `The ${product.title} came ready to use and the first clean felt noticeably better than a regular rinse.`,
      "The photo after delivery matches the polished finish and tidy packaging perfectly.",
      "It is simple to keep on the bathroom shelf and easy to use every day.",
    ];
  }

  return [
    `The ${product.title} arrived neatly packed and the first impression was clean, premium, and exactly as expected.`,
    "The delivery photo captures the same condition we received, so the small evidence section feels realistic.",
    "It was ready to use quickly and the finish felt better than the usual online order surprise.",
  ];
}

export function getProductReviews(product: Product): ProductReview[] {
  const pool = reviewPool[product.categorySlug] ?? reviewPool["smart-cleaning"];
  const copy = buildReviewCopy(product);

  return pool.map((entry, index) => ({
    name: entry.name,
    location: entry.location,
    note: entry.note,
    badge: index === 0 ? "Verified purchase" : "Delivery photo",
    rating: index === 2 && product.rating < 4.8 ? 4 : 5,
    text: copy[index] ?? copy[0],
    photo: product.image,
  }));
}

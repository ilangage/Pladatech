import type { WholesalePriceTier } from "./wholesale-types";

const tierBoundaries = [
  { label: "1–5 pcs", minQty: 1, maxQty: 4 },
  { label: "5–15 pcs", minQty: 5, maxQty: 14 },
  { label: "15–99 pcs", minQty: 15, maxQty: 99 },
  { label: "100+ pcs", minQty: 100 },
] as const;

export function normalizeWholesalePriceTiers(tiers: WholesalePriceTier[]) {
  if (!tiers.length) return [];

  return tiers.map((tier, index) => {
    const boundary = tierBoundaries[index];
    if (!boundary) return tier;

    return {
      ...tier,
      label: boundary.label,
      minQty: boundary.minQty,
      ...("maxQty" in boundary ? { maxQty: boundary.maxQty } : { maxQty: undefined }),
    };
  });
}

export function getWholesaleTierForQuantity(tiers: WholesalePriceTier[], quantity: number) {
  const normalizedTiers = normalizeWholesalePriceTiers(tiers);
  const safeQuantity = Math.max(1, Math.floor(quantity));

  return (
    normalizedTiers.find((tier) => safeQuantity >= tier.minQty && (tier.maxQty == null || safeQuantity <= tier.maxQty)) ??
    normalizedTiers[normalizedTiers.length - 1] ??
    null
  );
}

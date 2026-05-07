import type { ShippingMethod } from "@/lib/checkout-validation";

export type CheckoutTotals = {
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingLabel: string;
  taxLabel: string;
};

function normalizedCountry(country: string) {
  const value = country.trim().toLowerCase();
  if (["us", "usa", "united states", "united states of america"].includes(value)) return "US";
  if (["uk", "gb", "great britain", "united kingdom"].includes(value)) return "GB";
  return "OTHER";
}

export function calculateCheckoutTotals({
  subtotal,
  country,
  shippingMethod,
}: {
  subtotal: number;
  country: string;
  shippingMethod: ShippingMethod;
}): CheckoutTotals {
  const destination = normalizedCountry(country);
  const discountTotal = 0;
  let shippingTotal = 18;
  let shippingLabel = "International shipping estimate";
  let taxTotal = 0;
  let taxLabel = "Tax calculated at checkout";

  if (destination === "US") {
    shippingTotal = shippingMethod === "express" ? 12 : subtotal >= 75 ? 0 : 6;
    shippingLabel = shippingMethod === "express" ? "USA express shipping" : "USA standard shipping";
    taxTotal = 0;
    taxLabel = "US sales tax not collected in this checkout foundation";
  }

  if (destination === "GB") {
    shippingTotal = shippingMethod === "express" ? 18 : subtotal >= 75 ? 0 : 8;
    shippingLabel = shippingMethod === "express" ? "UK express shipping" : "UK standard shipping";
    taxTotal = Math.round(subtotal * 0.2 * 100) / 100;
    taxLabel = "Estimated UK VAT";
  }

  return {
    shippingTotal,
    taxTotal,
    discountTotal,
    shippingLabel,
    taxLabel,
  };
}

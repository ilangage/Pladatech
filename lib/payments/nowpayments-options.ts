export const NOWPAYMENTS_PAYMENT_OPTIONS = [
  { label: "USDT - TRC20", payCurrency: "usdttrc20", note: "Low network fee, recommended" },
  { label: "USDT - ERC20", payCurrency: "usdterc20", note: "Ethereum network, higher fee" },
  { label: "Bitcoin - BTC", payCurrency: "btc", note: "Bitcoin network" },
  { label: "Ethereum - ETH", payCurrency: "eth", note: "Ethereum network" },
  { label: "Litecoin - LTC", payCurrency: "ltc", note: "Fast and low-fee" },
] as const;

export type NowPaymentsPayCurrency = (typeof NOWPAYMENTS_PAYMENT_OPTIONS)[number]["payCurrency"];

export function isAllowedNowPaymentsPayCurrency(value: unknown): value is NowPaymentsPayCurrency {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return NOWPAYMENTS_PAYMENT_OPTIONS.some((option) => option.payCurrency === normalized);
}

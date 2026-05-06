export const PAYMENT_METHODS = {
  crypto_nowpayments: "Crypto Payment",
  fiat_gateway: "Card / Fiat Payment",
  bank_transfer: "Bank Transfer",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const SHIPPING_METHODS = {
  standard: { label: "Standard shipping", price: 0 },
  express: { label: "Express shipping", price: 12 },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_METHODS;

export type CheckoutCustomerInput = {
  name: string;
  email: string;
  phone?: string | null;
  country: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
};

export type CheckoutItemInput = {
  productId: string | number;
  slug: string;
  quantity: number;
  selectedColor?: string | null;
};

export type CheckoutRequestBody = {
  customer: CheckoutCustomerInput;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  customerNote?: string | null;
  giftWrap?: boolean;
  items: CheckoutItemInput[];
};

export type ValidatedCheckoutRequest = {
  customer: {
    name: string;
    email: string;
    phone: string | null;
    country: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
  };
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  customerNote: string | null;
  giftWrap: boolean;
  items: Array<{
    productId: string;
    slug: string;
    quantity: number;
    selectedColor: string | null;
  }>;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function sanitizePhone(phone?: string | null) {
  const value = asString(phone);
  if (!value) return null;
  const normalized = value.replace(/[^\d+]/g, "");
  return normalized || null;
}

export function validateCheckoutRequest(body: unknown):
  | { ok: true; data: ValidatedCheckoutRequest }
  | { ok: false; errors: string[] } {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["Request body is required."] };
  }

  const input = body as Record<string, unknown>;
  const customer = (input.customer ?? {}) as Record<string, unknown>;
  const items = Array.isArray(input.items) ? input.items : [];
  const errors: string[] = [];

  const name = asString(customer.name);
  const email = asString(customer.email).toLowerCase();
  const phone = sanitizePhone(customer.phone as string | null | undefined);
  const country = asString(customer.country);
  const addressLine1 = asString(customer.addressLine1);
  const addressLine2 = asString(customer.addressLine2);
  const city = asString(customer.city);
  const state = asString(customer.state);
  const postalCode = asString(customer.postalCode);
  const paymentMethod = asString(input.paymentMethod) as PaymentMethod;
  const shippingMethod = asString(input.shippingMethod) as ShippingMethod;
  const customerNote = asString(input.customerNote) || null;
  const giftWrap = Boolean(input.giftWrap);

  if (!name) errors.push("Customer name is required.");
  if (!email || !isEmail(email)) errors.push("A valid email address is required.");
  if (!country) errors.push("Country is required.");
  if (!addressLine1) errors.push("Address line 1 is required.");
  if (!city) errors.push("City is required.");
  if (!postalCode) errors.push("Postal code is required.");
  if (!(paymentMethod in PAYMENT_METHODS)) errors.push("Payment method must be crypto_nowpayments, fiat_gateway, or bank_transfer.");
  if (!(shippingMethod in SHIPPING_METHODS)) errors.push("Shipping method is invalid.");
  if (items.length === 0) errors.push("Cart must contain at least one item.");

  const normalizedItems = items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const productId = typeof entry.productId === "string" || typeof entry.productId === "number" ? String(entry.productId).trim() : "";
      const slug = asString(entry.slug);
      const selectedColor = asString(entry.selectedColor) || null;
      const quantity = Number(entry.quantity);
      if (!productId || !slug || !Number.isInteger(quantity) || quantity <= 0) {
        errors.push("Each cart item must include a product id, slug, and a positive quantity.");
        return null;
      }
      return { productId, slug, quantity, selectedColor };
    })
    .filter(Boolean) as ValidatedCheckoutRequest["items"];

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      customer: {
        name,
        email,
        phone,
        country,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state: state || null,
        postalCode,
      },
      paymentMethod,
      shippingMethod,
      customerNote,
      giftWrap,
      items: normalizedItems,
    },
  };
}

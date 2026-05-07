import "server-only";

import { randomBytes } from "crypto";
import { bundles } from "@/data/bundles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateCheckoutTotals } from "@/lib/checkout-rules";
import { loadProducts } from "@/lib/product-catalog";
import type { CheckoutRequestBody, ShippingMethod, ValidatedCheckoutRequest } from "@/lib/checkout-validation";
import { SHIPPING_METHODS } from "@/lib/checkout-validation";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  country: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  shipping_method: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotal: number | string;
  shipping_total: number | string;
  discount_total: number | string;
  tax_total?: number | string;
  gift_wrap_total: number | string;
  total: number | string;
  currency: string;
  customer_note: string | null;
  fulfillment_note?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipping_provider?: string | null;
  refund_reason?: string | null;
  canceled_at?: string | null;
  gateway_name: string | null;
  gateway_payment_id: string | null;
  gateway_invoice_url: string | null;
  raw_gateway_response: unknown;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminOrderRow = OrderRow;

export type AdminOrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  product_title: string;
  selected_color: string | null;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
  product_image: string | null;
  created_at: string | null;
};

export type AdminOrderDetail = AdminOrderRow & {
  items: AdminOrderItemRow[];
};

export type PaymentPageOrder = Pick<
  OrderRow,
  | "order_number"
  | "payment_method"
  | "payment_status"
  | "order_status"
  | "total"
  | "currency"
  | "shipping_method"
  | "gateway_name"
  | "gateway_payment_id"
  | "gateway_invoice_url"
  | "created_at"
> & {
  payAddress: string | null;
  payAmount: number | null;
  payCurrency: string | null;
  qrCode: string | null;
  selectedPayCurrency: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  paymentLink: string | null;
};

export type PublicOrderSummary = Pick<
  OrderRow,
  | "id"
  | "order_number"
  | "payment_method"
  | "payment_status"
  | "order_status"
  | "total"
  | "currency"
  | "shipping_method"
  | "created_at"
>;

export type OrderCreationResult = {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  currency: string;
  total: number;
  redirectUrl: string;
  gatewayName: string | null;
  gatewayPaymentId: string | null;
  gatewayInvoiceUrl: string | null;
};

type ResolvedItem = {
  product_id: string;
  product_database_id: string | null;
  stock_reservations: Array<{ product_database_id: string | null; product_name: string; quantity: number }>;
  product_slug: string;
  product_name: string;
  product_title: string;
  selected_color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_image: string | null;
};

export type OrderGatewayPatch = {
  paymentStatus?: string;
  orderStatus?: string;
  gatewayName?: string | null;
  gatewayPaymentId?: string | null;
  gatewayInvoiceUrl?: string | null;
  rawGatewayResponse?: unknown;
};

export type AdminOrderUpdatePayload = {
  paymentStatus?: string;
  orderStatus?: string;
  fulfillmentNote?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingProvider?: string | null;
  refundReason?: string | null;
};

function toNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toReadableError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) return error;

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = typeof record.message === "string" ? record.message : "";
    const details = typeof record.details === "string" ? record.details : "";
    const hint = typeof record.hint === "string" ? record.hint : "";
    const code = typeof record.code === "string" ? record.code : "";
    const combined = [code, message, details, hint].filter(Boolean).join(" - ");
    return new Error(combined || fallbackMessage);
  }

  return new Error(fallbackMessage);
}

function generateOrderNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const code = randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${stamp}-${code}`;
}

function getShippingTotal(shippingMethod: ShippingMethod) {
  return SHIPPING_METHODS[shippingMethod]?.price ?? 0;
}

function resolveGatewayName(paymentMethod: ValidatedCheckoutRequest["paymentMethod"]) {
  if (paymentMethod === "crypto_nowpayments") return "nowpayments";
  if (paymentMethod === "fiat_gateway") return "fiat_gateway";
  return "bank_transfer";
}

async function resolveItems(request: ValidatedCheckoutRequest) {
  const catalog = await loadProducts();
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));
  const byId = new Map(catalog.map((product) => [String(product.id), product]));

  const items: ResolvedItem[] = [];
  for (const entry of request.items) {
    const bundle = bundles.find((candidate) => candidate.slug === entry.slug);
    if (bundle) {
      const bundleProducts = bundle.productSlugs.map((slug) => bySlug.get(slug));
      if (bundleProducts.some((product) => !product)) {
        throw new Error(`Bundle is not available: ${bundle.name}`);
      }

      const quantity = Math.trunc(entry.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for ${bundle.name}.`);
      }

      const includedProducts = bundleProducts.filter(Boolean) as NonNullable<(typeof bundleProducts)[number]>[];
      for (const included of includedProducts) {
        if (included.stock <= 0) throw new Error(`${included.title} is currently out of stock.`);
        if (quantity > included.stock) throw new Error(`Only ${included.stock} bundle units available because of ${included.title} stock.`);
      }

      items.push({
        product_id: `bundle-${bundle.slug}`,
        product_database_id: null,
        stock_reservations: includedProducts.map((included) => ({
          product_database_id: included.databaseId ? String(included.databaseId) : null,
          product_name: included.title,
          quantity,
        })),
        product_slug: bundle.slug,
        product_name: bundle.name,
        product_title: bundle.name,
        selected_color: entry.selectedColor ?? null,
        quantity,
        unit_price: bundle.price,
        line_total: bundle.price * quantity,
        product_image: bundle.image,
      });
      continue;
    }

    const product = byId.get(entry.productId) ?? bySlug.get(entry.slug);
    if (!product) {
      throw new Error(`Product not found: ${entry.slug}`);
    }
    if (product.isActive === false) {
      throw new Error(`Product is inactive: ${product.title}`);
    }

    const quantity = Math.trunc(entry.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for ${product.title}.`);
    }
    if (product.stock <= 0) {
      throw new Error(`${product.title} is currently out of stock.`);
    }
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} left in stock for ${product.title}.`);
    }

    const unitPrice = toNumber(product.price, 0);
    const lineTotal = unitPrice * quantity;
    items.push({
      product_id: String(product.databaseId ?? product.id),
      product_database_id: product.databaseId ? String(product.databaseId) : null,
      stock_reservations: [{ product_database_id: product.databaseId ? String(product.databaseId) : null, product_name: product.title, quantity }],
      product_slug: product.slug,
      product_name: product.title,
      product_title: product.title,
      selected_color: entry.selectedColor ?? null,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      product_image: product.image ?? null,
    });
  }

  return items;
}

async function reserveProductStock(supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>, items: ResolvedItem[]) {
  for (const item of items) {
    for (const reservation of item.stock_reservations) {
      if (!reservation.product_database_id) continue;

      const { data: product, error: readError } = await supabaseAdmin
        .from("products")
        .select("stock,title")
        .eq("id", reservation.product_database_id)
        .single();

      if (readError || !product) {
        console.error("Stock lookup failed:", readError);
        throw toReadableError(readError, `Could not verify stock for ${reservation.product_name}.`);
      }

      const currentStock = toNumber((product as { stock?: unknown }).stock);
      if (currentStock <= 0) {
        throw new Error(`${reservation.product_name} is currently out of stock.`);
      }
      if (reservation.quantity > currentStock) {
        throw new Error(`Only ${currentStock} left in stock for ${reservation.product_name}.`);
      }

      const nextStock = Math.max(0, currentStock - reservation.quantity);
      const { error: updateError } = await supabaseAdmin
        .from("products")
        .update({ stock: nextStock, updated_at: new Date().toISOString() })
        .eq("id", reservation.product_database_id);

      if (updateError) {
        console.error("Stock reservation failed:", updateError);
        throw toReadableError(updateError, `Could not reserve stock for ${reservation.product_name}.`);
      }
    }
  }
}

function normalizeOrderRow(row: OrderRow): OrderRow {
  return {
    ...row,
    subtotal: toNumber(row.subtotal),
    shipping_total: toNumber(row.shipping_total),
    discount_total: toNumber(row.discount_total),
    tax_total: toNumber(row.tax_total),
    gift_wrap_total: toNumber(row.gift_wrap_total),
    total: toNumber(row.total),
  };
}

function extractNowPaymentsDetails(order: Pick<OrderRow, "gateway_invoice_url" | "raw_gateway_response" | "payment_status" | "currency" | "total">) {
  const raw = order.raw_gateway_response;
  const rawRecord = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const response = (rawRecord.data && typeof rawRecord.data === "object" ? (rawRecord.data as Record<string, unknown>) : rawRecord) as Record<string, unknown>;

  const asString = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : "");
  const asNumber = (value: unknown) => {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const payAddress =
    asString(response.pay_address) ||
    asString(response.address) ||
    asString(response.wallet_address) ||
    null;

  const payAmount =
    asNumber(response.pay_amount) ??
    asNumber(response.amount) ??
    asNumber(response.payment_amount) ??
    null;

  const payCurrency =
    asString(response.pay_currency) ||
    asString(response.currency) ||
    null;

  const qrCode =
    asString(response.qr_code) ||
    asString(response.qrCode) ||
    asString(response.qr_code_base64) ||
    asString(response.qrCodeBase64) ||
    asString(response.payment_qr_code) ||
    null;

  const selectedPayCurrency =
    asString(rawRecord.selected_pay_currency) ||
    asString(response.selected_pay_currency) ||
    asString(response.selectedPayCurrency) ||
    payCurrency ||
    null;

  const priceAmount =
    asNumber(response.price_amount) ??
    asNumber(response.amount) ??
    asNumber(order.total) ??
    null;

  const priceCurrency =
    asString(response.price_currency) ||
    asString(order.currency) ||
    null;

  const paymentLink =
    asString(order.gateway_invoice_url) ||
    asString(response.invoice_url) ||
    asString(response.payment_url) ||
    asString(response.url) ||
    null;

  return {
    payAddress,
    payAmount,
    payCurrency,
    qrCode,
    selectedPayCurrency,
    priceAmount,
    priceCurrency,
    paymentLink,
    paymentStatus: asString(response.payment_status) || asString(response.status) || order.payment_status,
  };
}

export async function createCheckoutOrder(request: ValidatedCheckoutRequest) {
  const items = await resolveItems(request);
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const totals = calculateCheckoutTotals({ subtotal, country: request.customer.country, shippingMethod: request.shippingMethod });
  const shippingTotal = totals.shippingTotal || getShippingTotal(request.shippingMethod);
  const giftWrapTotal = request.giftWrap ? 5 : 0;
  const discountTotal = totals.discountTotal;
  const taxTotal = totals.taxTotal;
  const total = subtotal + shippingTotal + taxTotal + giftWrapTotal - discountTotal;
  const orderNumber = generateOrderNumber();
  const supabaseAdmin = createSupabaseAdminClient();

  const orderInsert = {
    order_number: orderNumber,
    customer_name: request.customer.name,
    customer_email: request.customer.email,
    customer_phone: request.customer.phone,
    country: request.customer.country,
    address_line1: request.customer.addressLine1,
    address_line2: request.customer.addressLine2,
    city: request.customer.city,
    state: request.customer.state,
    postal_code: request.customer.postalCode,
    shipping_method: request.shippingMethod,
    payment_method: request.paymentMethod,
    payment_status: "pending",
    order_status: "new",
    subtotal,
    shipping_total: shippingTotal,
    discount_total: discountTotal,
    tax_total: taxTotal,
    gift_wrap_total: giftWrapTotal,
    total,
    currency: "USD",
    customer_note: request.customerNote,
    gateway_name: resolveGatewayName(request.paymentMethod),
    gateway_payment_id: null,
    gateway_invoice_url: null,
    raw_gateway_response: null,
  };

  const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert(orderInsert).select("*").single();
  if (orderError || !order) {
    console.error("Checkout order insert failed:", orderError);
    throw toReadableError(orderError, "Failed to create order.");
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_slug: item.product_slug,
    product_name: item.product_name,
    product_title: item.product_title,
    selected_color: item.selected_color,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
    product_image: item.product_image,
  }));

  const { error: itemError } = await supabaseAdmin.from("order_items").insert(orderItems);
  if (itemError) {
    console.error("Checkout order item insert failed:", itemError);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    throw toReadableError(itemError, "Failed to create order items.");
  }

  try {
    await reserveProductStock(supabaseAdmin, items);
  } catch (error) {
    await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    throw error;
  }

  const normalized = normalizeOrderRow(order as OrderRow);
  return {
    orderId: normalized.id,
    orderNumber: normalized.order_number,
    paymentStatus: normalized.payment_status,
    orderStatus: normalized.order_status,
    paymentMethod: normalized.payment_method,
    currency: normalized.currency,
    total: toNumber(normalized.total),
    gatewayName: normalized.gateway_name,
    gatewayPaymentId: normalized.gateway_payment_id,
    gatewayInvoiceUrl: normalized.gateway_invoice_url,
    redirectUrl: `/checkout/success?order=${encodeURIComponent(normalized.order_number)}`,
  } satisfies OrderCreationResult;
}

export async function updateOrderByOrderNumber(orderNumber: string, patch: OrderGatewayPatch) {
  const supabaseAdmin = createSupabaseAdminClient();
  const updates: Record<string, unknown> = {};

  if (patch.paymentStatus !== undefined) updates.payment_status = patch.paymentStatus;
  if (patch.orderStatus !== undefined) updates.order_status = patch.orderStatus;
  if (patch.gatewayName !== undefined) updates.gateway_name = patch.gatewayName;
  if (patch.gatewayPaymentId !== undefined) updates.gateway_payment_id = patch.gatewayPaymentId;
  if (patch.gatewayInvoiceUrl !== undefined) updates.gateway_invoice_url = patch.gatewayInvoiceUrl;
  if (patch.rawGatewayResponse !== undefined) updates.raw_gateway_response = patch.rawGatewayResponse;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("order_number", orderNumber)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeOrderRow(data as OrderRow) : null;
}

export async function updateOrderByGatewayPaymentId(paymentId: string, patch: OrderGatewayPatch) {
  const supabaseAdmin = createSupabaseAdminClient();
  const updates: Record<string, unknown> = {};

  if (patch.paymentStatus !== undefined) updates.payment_status = patch.paymentStatus;
  if (patch.orderStatus !== undefined) updates.order_status = patch.orderStatus;
  if (patch.gatewayName !== undefined) updates.gateway_name = patch.gatewayName;
  if (patch.gatewayPaymentId !== undefined) updates.gateway_payment_id = patch.gatewayPaymentId;
  if (patch.gatewayInvoiceUrl !== undefined) updates.gateway_invoice_url = patch.gatewayInvoiceUrl;
  if (patch.rawGatewayResponse !== undefined) updates.raw_gateway_response = patch.rawGatewayResponse;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("gateway_payment_id", paymentId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeOrderRow(data as OrderRow) : null;
}

export async function getAdminOrders(limit = 100): Promise<AdminOrderRow[]> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Admin orders load failed:", error);
    return [];
  }

  return ((data ?? []) as OrderRow[]).map(normalizeOrderRow);
}

export async function getAdminOrderDetail(orderNumber: string): Promise<AdminOrderDetail | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !order) {
    if (error) console.error("Admin order detail load failed:", error);
    return null;
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Admin order items load failed:", itemsError);
  }

  return {
    ...normalizeOrderRow(order as OrderRow),
    items: ((items ?? []) as AdminOrderItemRow[]).map((item) => ({
      ...item,
      quantity: Number(item.quantity ?? 0),
      unit_price: toNumber(item.unit_price),
      line_total: toNumber(item.line_total),
    })),
  };
}

export async function updateAdminOrder(orderNumber: string, payload: AdminOrderUpdatePayload) {
  const supabaseAdmin = createSupabaseAdminClient();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.paymentStatus !== undefined) updates.payment_status = payload.paymentStatus;
  if (payload.orderStatus !== undefined) updates.order_status = payload.orderStatus;
  if (payload.fulfillmentNote !== undefined) updates.fulfillment_note = payload.fulfillmentNote;
  if (payload.trackingNumber !== undefined) updates.tracking_number = payload.trackingNumber;
  if (payload.trackingUrl !== undefined) updates.tracking_url = payload.trackingUrl;
  if (payload.shippingProvider !== undefined) updates.shipping_provider = payload.shippingProvider;
  if (payload.refundReason !== undefined) updates.refund_reason = payload.refundReason;
  if (payload.orderStatus === "cancelled" && payload.refundReason) updates.canceled_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("order_number", orderNumber)
    .select("*")
    .maybeSingle();

  if (error) throw toReadableError(error, "Failed to update order.");
  return data ? normalizeOrderRow(data as OrderRow) : null;
}

export async function getOrderPublicSummary(orderNumber: string): Promise<PublicOrderSummary | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, payment_method, payment_status, order_status, total, currency, shipping_method, created_at")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Public order summary lookup failed:", error);
    return null;
  }

  return {
    id: data.id,
    order_number: data.order_number,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
    order_status: data.order_status,
    total: toNumber(data.total),
    currency: data.currency ?? "USD",
    shipping_method: data.shipping_method ?? "standard",
    created_at: data.created_at ?? null,
  };
}

export async function getOrderPaymentPageData(orderNumber: string): Promise<PaymentPageOrder | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("order_number, payment_method, payment_status, order_status, total, currency, shipping_method, gateway_name, gateway_payment_id, gateway_invoice_url, raw_gateway_response, created_at")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Payment page order lookup failed:", error);
    return null;
  }

  const details = extractNowPaymentsDetails({
    gateway_invoice_url: data.gateway_invoice_url ?? null,
    raw_gateway_response: data.raw_gateway_response,
    payment_status: data.payment_status ?? "pending",
    currency: data.currency ?? "USD",
    total: data.total ?? 0,
  });

  return {
    order_number: data.order_number,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
    order_status: data.order_status,
    total: toNumber(data.total),
    currency: data.currency ?? "USD",
    shipping_method: data.shipping_method ?? "standard",
    gateway_name: data.gateway_name ?? null,
    gateway_payment_id: data.gateway_payment_id ?? null,
    gateway_invoice_url: data.gateway_invoice_url ?? null,
    created_at: data.created_at ?? null,
    payAddress: details.payAddress,
    payAmount: details.payAmount,
    payCurrency: details.payCurrency,
    qrCode: details.qrCode,
    selectedPayCurrency: details.selectedPayCurrency,
    priceAmount: details.priceAmount,
    priceCurrency: details.priceCurrency,
    paymentLink: details.paymentLink,
  };
}

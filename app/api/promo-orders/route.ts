import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PromoOrderPayload = {
  productName?: unknown;
  productSlug?: unknown;
  productUrl?: unknown;
  source?: unknown;
  campaign?: unknown;
  name?: unknown;
  phone?: unknown;
  district?: unknown;
  address?: unknown;
  quantity?: unknown;
  selectedColor?: unknown;
  priceTier?: unknown;
  unitPrice?: unknown;
  estimatedTotal?: unknown;
  deliveryNote?: unknown;
  codAvailable?: unknown;
  notes?: unknown;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function createLeadId() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PROMO-${stamp}-${random}`;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as PromoOrderPayload | null;

  if (!payload) {
    return NextResponse.json({ error: "Invalid promo order request." }, { status: 400 });
  }

  const productName = clean(payload.productName);
  const productSlug = clean(payload.productSlug);
  const productUrl = clean(payload.productUrl);
  const name = clean(payload.name);
  const phone = clean(payload.phone);
  const district = clean(payload.district);
  const address = clean(payload.address);
  const quantity = Math.max(1, Math.floor(cleanNumber(payload.quantity, 1)));
  const selectedColor = clean(payload.selectedColor);
  const priceTier = clean(payload.priceTier);
  const unitPrice = cleanNumber(payload.unitPrice);
  const estimatedTotal = cleanNumber(payload.estimatedTotal);
  const deliveryNote = clean(payload.deliveryNote);
  const source = clean(payload.source) || "facebook_ad";
  const campaign = clean(payload.campaign);
  const notes = clean(payload.notes);
  const codAvailable = typeof payload.codAvailable === "boolean" ? (payload.codAvailable ? "Yes" : "No") : "Yes";

  if (!productName || !productSlug || !name || !phone || !district || !address) {
    return NextResponse.json({ error: "Missing required promo order fields." }, { status: 400 });
  }

  const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_PROMO_ORDERS_URL?.trim();
  if (!webhookUrl) {
    return NextResponse.json({ error: "Missing GOOGLE_APPS_SCRIPT_PROMO_ORDERS_URL." }, { status: 500 });
  }

  const promoOrder = {
    timestamp: new Date().toISOString(),
    leadId: createLeadId(),
    productName,
    productSlug,
    productUrl,
    source,
    campaign,
    name,
    phone,
    district,
    address,
    quantity,
    selectedColor,
    priceTier,
    unitPrice,
    estimatedTotal,
    deliveryNote,
    codAvailable,
    status: "New",
    whatsappSent: "No",
    notes,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promoOrder),
      cache: "no-store",
    });

    const text = await response.text();
    let result: unknown = null;
    try {
      result = text ? JSON.parse(text) : null;
    } catch {
      result = { raw: text };
    }

    if (!response.ok) {
      console.error("Promo order Apps Script failed:", result);
      return NextResponse.json({ error: "Failed to submit promo order.", details: result }, { status: 502 });
    }

    return NextResponse.json({ ok: true, leadId: promoOrder.leadId, result });
  } catch (error) {
    console.error("Promo order webhook request failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit promo order." },
      { status: 500 },
    );
  }
}

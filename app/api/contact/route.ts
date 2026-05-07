import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedTopics = new Set([
  "Smart Cleaning",
  "Kitchen & Wellness",
  "Pet & Home Security",
  "Car & Mobile Essentials",
  "Order help",
]);

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  topic?: unknown;
  orderNumber?: unknown;
  message?: unknown;
  company?: unknown;
  source?: unknown;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as ContactPayload | null;

  if (!payload) {
    return NextResponse.json({ error: "Invalid contact request." }, { status: 400 });
  }

  if (clean(payload.company)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(payload.name);
  const email = clean(payload.email).toLowerCase();
  const phone = clean(payload.phone);
  const topic = clean(payload.topic);
  const orderNumber = clean(payload.orderNumber);
  const message = clean(payload.message);
  const source = clean(payload.source) === "homepage" ? "homepage" : "contact_page";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  if (!allowedTopics.has(topic)) {
    return NextResponse.json({ error: "Please select a valid support topic." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        phone: phone || null,
        topic,
        order_number: orderNumber || null,
        message,
        source,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Contact message insert failed:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ticketId: data.id });
  } catch (error) {
    console.error("Contact API failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create support ticket." },
      { status: 500 },
    );
  }
}

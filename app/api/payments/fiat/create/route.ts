import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  // TODO: Connect the fiat gateway create session flow here.
  // Expected env vars:
  // - FIAT_GATEWAY_PUBLIC_KEY
  // - FIAT_GATEWAY_SECRET_KEY
  // - FIAT_GATEWAY_WEBHOOK_SECRET
  // - NEXT_PUBLIC_SITE_URL
  return NextResponse.json(
    {
      ok: false,
      error: "Fiat gateway is not connected yet.",
    },
    { status: 501 },
  );
}

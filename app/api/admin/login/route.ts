import { NextResponse } from "next/server";
import { adminCookieOptions, ADMIN_REFRESH_COOKIE, ADMIN_SESSION_COOKIE, fetchSupabaseUser, isAdminEmailAllowed } from "@/lib/admin-auth";
import { getSupabaseConfig } from "@/lib/supabase-config";

export async function POST(request: Request) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { email, password } = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = (await response.json()) as { access_token?: string; refresh_token?: string };
  if (!session.access_token || !session.refresh_token) {
    return NextResponse.json({ error: "Login failed." }, { status: 401 });
  }

  const user = await fetchSupabaseUser(session.access_token);
  if (!user || !isAdminEmailAllowed(user.email)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(ADMIN_SESSION_COOKIE, session.access_token, { ...adminCookieOptions(), maxAge: 60 * 60 * 24 });
  res.cookies.set(ADMIN_REFRESH_COOKIE, session.refresh_token, { ...adminCookieOptions(), maxAge: 60 * 60 * 24 * 30 });
  return res;
}


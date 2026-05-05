import { NextResponse } from "next/server";
import { ADMIN_REFRESH_COOKIE, ADMIN_SESSION_COOKIE, adminCookieOptions } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  response.cookies.set(ADMIN_REFRESH_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
}


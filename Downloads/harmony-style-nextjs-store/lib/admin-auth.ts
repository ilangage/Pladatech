import { cookies } from "next/headers";
import { getAdminEmailAllowlist, getSupabaseConfig } from "./supabase-config";

export const ADMIN_SESSION_COOKIE = "pladatech-admin-session";
export const ADMIN_REFRESH_COOKIE = "pladatech-admin-refresh";

export type AdminUser = {
  id: string;
  email: string;
};

export async function fetchSupabaseUser(accessToken: string): Promise<AdminUser | null> {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !accessToken) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  const user = (await response.json()) as { id?: string; email?: string | null };
  if (!user.id || !user.email) return null;
  return { id: user.id, email: user.email.toLowerCase() };
}

export function isAdminEmailAllowed(email: string) {
  const allowlist = getAdminEmailAllowlist();
  return allowlist.includes(email.toLowerCase());
}

export async function getAuthenticatedAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!accessToken) return null;
  return fetchSupabaseUser(accessToken);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

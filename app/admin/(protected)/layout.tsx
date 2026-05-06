import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAuthenticatedAdminUser, isAdminEmailAllowed } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdminEmailAllowed(user.email)) {
    return (
      <main style={{ minHeight: "100vh", padding: 32, background: "#f5f3ee", color: "#111" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", background: "white", border: "1px solid #e7e2db", borderRadius: 24, padding: 28 }}>
          <h1 style={{ marginTop: 0 }}>Access denied</h1>
          <p style={{ color: "#666" }}>This account is not in the ADMIN_EMAILS allowlist.</p>
          <Link href="/admin/login">Back to login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <strong>Pladatech Admin</strong>
          <span>{user.email}</span>
        </div>
        <div className="admin-topbar-actions">
          <Link href="/admin/products" className="admin-link">
            Products
          </Link>
          <Link href="/admin/orders" className="admin-link">
            Orders
          </Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="admin-button admin-button-secondary">
              Logout
            </button>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}

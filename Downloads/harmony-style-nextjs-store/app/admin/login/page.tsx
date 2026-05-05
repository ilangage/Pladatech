"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Login failed");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f3ee", padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: "min(440px, 100%)", background: "white", border: "1px solid #e7e2db", borderRadius: 28, padding: 28, display: "grid", gap: 14, boxShadow: "0 24px 60px rgba(0,0,0,.08)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 38, letterSpacing: "-0.05em" }}>Admin Login</h1>
          <p style={{ color: "#666" }}>Sign in with your Supabase Auth admin account.</p>
        </div>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="admin-input" />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Password</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="admin-input" />
        </label>
        {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
        <button type="submit" className="admin-button" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}

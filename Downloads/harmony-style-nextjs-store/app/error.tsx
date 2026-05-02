"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-shell">
      <div className="store-card" style={{ padding: "clamp(28px, 5vw, 56px)", maxWidth: 560, margin: "48px auto", textAlign: "center" }}>
        <h1 style={{ letterSpacing: "-0.04em", marginTop: 0 }}>Something went wrong</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{error.message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
          <button type="button" className="dark-button" onClick={() => reset()}>
            Try again
          </button>
          <Link href="/" className="outline-button" style={{ padding: "15px 22px", display: "inline-flex", alignItems: "center" }}>
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

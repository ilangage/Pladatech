"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 24, fontFamily: "system-ui, sans-serif", background: "#f5f3ee", color: "#101010" }}>
        <h1 style={{ fontSize: 22 }}>Something went wrong</h1>
        <p style={{ opacity: 0.85 }}>{error.message}</p>
        <button type="button" style={{ marginTop: 16, padding: "12px 20px", borderRadius: 999, border: 0, fontWeight: 700, cursor: "pointer" }} onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}

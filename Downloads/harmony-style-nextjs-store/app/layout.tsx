import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import HashScroll from "@/components/HashScroll";
import ToastHost from "@/components/ToastHost";
import { homeMetadata } from "@/data/store";

export const metadata: Metadata = {
  title: homeMetadata.title,
  description: homeMetadata.description,
  keywords: [
    "smart home gadgets",
    "home cleaning gadgets",
    "kitchen gadgets",
    "pet gadgets",
    "car accessories",
    "dash cam bundle",
    "robot vacuum and mop",
    "portable carpet cleaner",
    "magnetic power bank",
    "air fryer",
    "dehumidifier",
    "USA UK online gadget store",
    "massage gun",
    "neck and shoulder massager",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <noscript>
          <div style={{ padding: 24, background: "#f5f3ee", color: "#111" }}>
            JavaScript is required for this shop preview. Enable JavaScript and reload.
          </div>
        </noscript>
        <CartProvider>
          <HashScroll />
          {children}
          <ToastHost />
        </CartProvider>
      </body>
    </html>
  );
}

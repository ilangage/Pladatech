"use client";

import { useCart } from "@/components/cart-context";
import type { Product } from "@/data/store";

export default function BundleAdd({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  return (
    <button type="button" className="dark-button" style={{ marginTop: 16 }} onClick={() => products.forEach((p) => addToCart(p, 1))}>
      Add all items to cart
    </button>
  );
}

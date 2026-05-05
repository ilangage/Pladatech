"use client";

import { useCart } from "@/components/cart-context";
import type { Product } from "@/data/store";
import { useState } from "react";

function price(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [color, setColor] = useState<string | undefined>(product.colors[0]);

  if (!product.colors.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <button type="button" className="dark-button" style={{ alignSelf: "start" }} onClick={() => addToCart(product, 1)}>
          Add to cart · {price(product.price)}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {product.colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Finish ${c}`}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: color === c ? "3px solid #111" : "2px solid #bbb",
              background: c,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
      <button type="button" className="dark-button" style={{ alignSelf: "start" }} onClick={() => addToCart(product, 1, color)}>
        Add to cart · {price(product.price)}
      </button>
    </div>
  );
}

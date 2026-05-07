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
      <div className="product-actions">
        <button type="button" className="dark-button product-actions-submit" onClick={() => addToCart(product, 1)}>
          Add to cart · {price(product.price)}
        </button>
      </div>
    );
  }

  return (
    <div className="product-actions">
      <div className="product-swatches">
        {product.colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Finish ${c}`}
            className={`product-swatch ${color === c ? "active" : ""}`}
            style={{ background: c }}
          />
        ))}
      </div>
      <button type="button" className="dark-button product-actions-submit" onClick={() => addToCart(product, 1, color)}>
        Add to cart · {price(product.price)}
      </button>
    </div>
  );
}

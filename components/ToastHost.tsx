"use client";

import { useOptionalCart } from "@/components/cart-context";

export default function ToastHost() {
  const cart = useOptionalCart();
  if (!cart?.toast) return null;
  return <div className="toast">{cart.toast}</div>;
}

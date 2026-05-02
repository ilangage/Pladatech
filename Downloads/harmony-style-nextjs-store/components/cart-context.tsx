"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/store";

export type CartLine = Product & { quantity: number; selectedColor?: string };

type CartContextValue = {
  cart: CartLine[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  updateQty: (id: number, selectedColor: string | undefined, quantity: number) => void;
  subtotal: number;
  totalItems: number;
  giftWrap: boolean;
  setGiftWrap: (v: boolean) => void;
  cartNote: string;
  setCartNote: (v: string) => void;
  checkout: () => void;
  toast: string;
  showToast: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [cartNote, setCartNote] = useState("");
  const [toast, setToast] = useState("");

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1, selectedColor = product.colors[0]) => {
      setCart((current) => {
        const exists = current.find((item) => item.id === product.id && item.selectedColor === selectedColor);
        if (exists)
          return current.map((item) =>
            item.id === product.id && item.selectedColor === selectedColor
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        return [...current, { ...product, quantity, selectedColor }];
      });
      setCartOpen(true);
      showToast(`${product.title} added to cart`);
    },
    [showToast],
  );

  const updateQty = useCallback((id: number, selectedColor: string | undefined, quantity: number) => {
    setCart((current) =>
      current
        .map((line) => (line.id === id && line.selectedColor === selectedColor ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const checkout = useCallback(() => {
    showToast("Demo checkout: connect Shopify Checkout, Stripe or your payment gateway here.");
  }, [showToast]);

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.price * line.quantity, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);

  const value = useMemo(
    () => ({
      cart,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQty,
      subtotal,
      totalItems,
      giftWrap,
      setGiftWrap,
      cartNote,
      setCartNote,
      checkout,
      toast,
      showToast,
    }),
    [cart, cartOpen, addToCart, updateQty, subtotal, totalItems, giftWrap, cartNote, checkout, toast, showToast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** For toasts / optional UI: never throw (avoids 500 if context is briefly unavailable during SSR). */
export function useOptionalCart() {
  return useContext(CartContext);
}

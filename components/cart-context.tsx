"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/store";

export type CartLine = Product & { quantity: number; selectedColor?: string };

type CartContextValue = {
  cart: CartLine[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  updateQty: (id: string | number, selectedColor: string | undefined, quantity: number) => void;
  subtotal: number;
  totalItems: number;
  giftWrap: boolean;
  setGiftWrap: (v: boolean) => void;
  cartNote: string;
  setCartNote: (v: string) => void;
  checkout: () => void;
  clearCart: () => void;
  toast: string;
  showToast: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "pladatech-cart-v1";

type StoredCart = {
  cart?: CartLine[];
  giftWrap?: boolean;
  cartNote?: string;
};

function readStoredCart(): StoredCart | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCart;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [cartNote, setCartNote] = useState("");
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredCart();
    if (stored) {
      if (Array.isArray(stored.cart)) {
        setCart(stored.cart.filter((line) => line && typeof line.quantity === "number" && line.quantity > 0));
      }
      if (typeof stored.giftWrap === "boolean") setGiftWrap(stored.giftWrap);
      if (typeof stored.cartNote === "string") setCartNote(stored.cartNote);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    const payload: StoredCart = { cart, giftWrap, cartNote };
    try {
      if (cart.length === 0 && !giftWrap && !cartNote.trim()) {
        window.localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* localStorage can fail in private browsing or full storage; cart still works in memory. */
    }
  }, [cart, giftWrap, cartNote, hydrated]);

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

  const updateQty = useCallback((id: string | number, selectedColor: string | undefined, quantity: number) => {
    setCart((current) =>
      current
        .map((line) => (line.id === id && line.selectedColor === selectedColor ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const checkout = useCallback(() => {
    setCartOpen(false);
    router.push("/checkout");
  }, [router]);

  const clearCart = useCallback(() => {
    setCart([]);
    setGiftWrap(false);
    setCartNote("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

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
      clearCart,
      toast,
      showToast,
    }),
    [cart, cartOpen, addToCart, updateQty, subtotal, totalItems, giftWrap, cartNote, checkout, clearCart, toast, showToast],
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

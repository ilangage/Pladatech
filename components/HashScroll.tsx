"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function scrollToHashTarget() {
  const raw = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
  if (!raw) return;
  const id = decodeURIComponent(raw);
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Ensures `/#section` works after Next.js client navigations (e.g. from ShopShell pages to home anchors). */
export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHashTarget();
    const t = window.setTimeout(scrollToHashTarget, 80);
    window.addEventListener("hashchange", scrollToHashTarget);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", scrollToHashTarget);
    };
  }, [pathname]);

  return null;
}

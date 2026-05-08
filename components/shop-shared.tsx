import Link from "next/link";
import { footerContent } from "@/data/store";

export type IconName =
  | "search"
  | "user"
  | "cart"
  | "eye"
  | "plus"
  | "close"
  | "heart"
  | "menu"
  | "arrow"
  | "instagram"
  | "youtube"
  | "facebook"
  | "x"
  | "box"
  | "truck"
  | "shield"
  | "star"
  | "back";

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const solidCommon = { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor" };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>;
  if (name === "user") return <svg {...common}><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>;
  if (name === "cart") return <svg {...common}><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>;
  if (name === "eye") return <svg {...common}><path d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === "close") return <svg {...common}><path d="M18 6 6 18M6 6l12 12"/></svg>;
  if (name === "heart") return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
  if (name === "back") return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
  if (name === "instagram") return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/></svg>;
  if (name === "youtube") return <svg {...solidCommon}><path d="M23 7.5a4 4 0 0 0-2.8-2.8C18.2 4.2 12 4.2 12 4.2s-6.2 0-8.2.5A4 4 0 0 0 1 7.5 41 41 0 0 0 .5 12 41 41 0 0 0 1 16.5a4 4 0 0 0 2.8 2.8c2 .5 8.2.5 8.2.5s6.2 0 8.2-.5a4 4 0 0 0 2.8-2.8 41 41 0 0 0 .5-4.5 41 41 0 0 0-.5-4.5ZM9.7 15.4V8.6l6 3.4-6 3.4Z"/></svg>;
  if (name === "facebook") return <svg {...solidCommon}><path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v2H6v4h3v7h4v-7h3.3l.7-4h-4V9c0-.8.3-1 1-1Z"/></svg>;
  if (name === "x") return <svg {...common}><path d="M4 4l16 16M20 4 4 20"/></svg>;
  if (name === "box") return <svg {...common}><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>;
  if (name === "truck") return <svg {...common}><path d="M3 7h11v10H3z"/><path d="M14 11h4l3 3v3h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>;
  if (name === "star") return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6 6.6 1-4.8 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.8-4.6 6.6-1L12 2.5Z"/></svg>;
  return null;
}

export function Logo() {
  return (
    <div className="logo" aria-label="Pladatech logo">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function ShopFooter() {
  return (
    <footer className="footer section-card">
      <div className="footer-top">
        <Link href="/">
          <Logo />
        </Link>
        <div>
          <h3>Collections</h3>
          {footerContent.collections.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <h3>Information</h3>
          {footerContent.information.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <h3>{footerContent.phone}</h3>
          <Link href={`mailto:${footerContent.email}`}>{footerContent.email}</Link>
          <p className="footer-address">{footerContent.address}</p>
        </div>
      </div>
      <div className="newsletter">
        <h2>{footerContent.newsletterTitle}</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Enter your email" />
          <button type="submit">→</button>
        </form>
      </div>
      <div className="footer-bottom">
        <span>{footerContent.copyright}</span>
        <span>🌐 English · USD</span>
      </div>
    </footer>
  );
}

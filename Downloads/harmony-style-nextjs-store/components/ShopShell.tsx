"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { announcementBar, collections, megaMenu, navItems } from "@/data/store";
import { useCart, type CartLine } from "@/components/cart-context";
import { Icon, Logo, formatPrice, ShopFooter } from "@/components/shop-shared";

function MegaMenuPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="mega-menu" onMouseLeave={onClose}>
      <div>
        <h3>{megaMenu.collectionsTitle}</h3>
        {collections.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`}>
            {c.name}
          </Link>
        ))}
      </div>
      <div>
        <h3>{megaMenu.shopByNeedTitle}</h3>
        {megaMenu.needLinks.map((l) => (
          <Link key={l.label} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="mega-promo">
        <span>{megaMenu.promoEyebrow}</span>
        <strong>{megaMenu.promoTitle}</strong>
        <p>{megaMenu.promoCopy}</p>
        <Link href={megaMenu.promoHref} className="pill-button" style={{ display: "inline-flex", marginTop: 8 }}>
          {megaMenu.promoCta}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </div>
  );
}

function SocialRail() {
  return (
    <aside className="social-rail">
      <a href="#" aria-label="Facebook">
        <Icon name="facebook" size={22} />
      </a>
      <a href="#" aria-label="X">
        <Icon name="x" size={20} />
      </a>
      <a href="#" aria-label="Instagram">
        <Icon name="instagram" size={21} />
      </a>
      <a href="#" aria-label="YouTube">
        <Icon name="youtube" size={22} />
      </a>
      <button type="button">GET 20% OFF</button>
    </aside>
  );
}

function CartDrawerShell({
  open,
  onClose,
  cart,
  updateQty,
  subtotal,
  giftWrap,
  setGiftWrap,
  cartNote,
  setCartNote,
  checkout,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartLine[];
  updateQty: (id: string | number, selectedColor: string | undefined, quantity: number) => void;
  subtotal: number;
  giftWrap: boolean;
  setGiftWrap: (value: boolean) => void;
  cartNote: string;
  setCartNote: (value: string) => void;
  checkout: () => void;
}) {
  return (
    <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="drawer-header">
        <h2>Cart</h2>
        <button type="button" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-lines">
          {cart.map((line) => (
            <div className="cart-line" key={`${line.id}-${line.selectedColor}`}>
              <img src={line.image} alt={line.title} />
              <div>
                <strong>{line.title}</strong>
                <span>
                  {formatPrice(line.price)} · Finish <i style={{ background: line.selectedColor }} />
                </span>
                <div className="qty-control">
                  <button type="button" onClick={() => updateQty(line.id, line.selectedColor, line.quantity - 1)}>-</button>
                  <input
                    value={line.quantity}
                    onChange={(e) => updateQty(line.id, line.selectedColor, Number(e.target.value))}
                  />
                  <button type="button" onClick={() => updateQty(line.id, line.selectedColor, line.quantity + 1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="checkbox-line">
        <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} /> Add gift wrapping (+$5)
      </label>
      <textarea value={cartNote} onChange={(e) => setCartNote(e.target.value)} placeholder="Cart note / delivery instructions" rows={4} />
      <div className="drawer-footer">
        <div>
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal + (giftWrap ? 5 : 0))}</strong>
        </div>
        <button type="button" className="dark-button" onClick={checkout}>
          Checkout
        </button>
      </div>
    </aside>
  );
}

/**
 * Same chrome as the homepage (toolbar, card, announcement, header, social rail, footer, cart drawer).
 * Wrap inner pages so navigation and cart continue to work.
 */
export default function ShopShell({ children }: { children: ReactNode }) {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQty,
    subtotal,
    giftWrap,
    setGiftWrap,
    cartNote,
    setCartNote,
    checkout,
    totalItems,
  } = useCart();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <main className="page-shell">
      <div className="store-card" id="top">
        <div className="announcement-bar" role="region" aria-label="Store announcement">
          {announcementBar}
        </div>

        <header className="site-header">
          <button type="button" className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            <Icon name="menu" />
          </button>
          <Link href="/" onClick={() => setMobileMenu(false)}>
            <Logo />
          </Link>
          <nav className={mobileMenu ? "open" : ""}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => item.label === "Shop" && setMegaOpen(true)}
                onClick={() => setMobileMenu(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/#products" aria-label="Search" onClick={() => setMobileMenu(false)}>
              <Icon name="search" />
            </Link>
            <div className="account-wrap">
              <button type="button" aria-label="Account" onClick={() => setAccountOpen(!accountOpen)}>
                <Icon name="user" />
              </button>
              {accountOpen && (
                <div className="account-menu">
                  <strong>Customer account</strong>
                  <p>Sign in to view orders, addresses and saved products.</p>
                  <button type="button">Sign in with Shop</button>
                </div>
              )}
            </div>
            <button type="button" className="cart-button" aria-label="Cart" onClick={() => setCartOpen(true)}>
              <Icon name="cart" />
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>
          </div>
          {megaOpen && <MegaMenuPanel onClose={() => setMegaOpen(false)} />}
        </header>

        <SocialRail />

        {children}

        <ShopFooter />
      </div>

      <CartDrawerShell
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        subtotal={subtotal}
        giftWrap={giftWrap}
        setGiftWrap={setGiftWrap}
        cartNote={cartNote}
        setCartNote={setCartNote}
        checkout={checkout}
      />

      <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑
      </button>
    </main>
  );
}

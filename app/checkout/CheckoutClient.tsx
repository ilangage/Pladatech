"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { calculateCheckoutTotals } from "@/lib/checkout-rules";
import { PAYMENT_METHODS, SHIPPING_METHODS, type PaymentMethod, type ShippingMethod } from "@/lib/checkout-validation";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
}

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, subtotal, giftWrap, setGiftWrap, cartNote, setCartNote, setCartOpen, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United States");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [customerNote, setCustomerNote] = useState(cartNote);
  const [recoverySaved, setRecoverySaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const giftWrapTotal = giftWrap ? 5 : 0;
  const checkoutTotals = calculateCheckoutTotals({ subtotal, country, shippingMethod });
  const shippingTotal = checkoutTotals.shippingTotal;
  const taxTotal = checkoutTotals.taxTotal;
  const discountTotal = checkoutTotals.discountTotal;
  const total = subtotal + giftWrapTotal + shippingTotal + taxTotal - discountTotal;

  const orderItems = useMemo(
    () =>
      cart.map((line) => ({
        productId: String(line.databaseId ?? line.id),
        slug: line.slug,
        quantity: line.quantity,
        selectedColor: line.selectedColor ?? null,
      })),
    [cart],
  );

  async function submitOrder() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name,
            email,
            phone,
            country,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
          },
          paymentMethod,
          shippingMethod,
          customerNote,
          giftWrap,
          items: orderItems,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; redirectUrl?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Checkout failed.");
      }

      const redirectUrl = data.redirectUrl ?? "/checkout/success";
      clearCart();
      setCartOpen(false);
      if (/^https?:\/\//i.test(redirectUrl)) {
        window.location.assign(redirectUrl);
        return;
      }
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function saveRecoveryCart() {
    setRecoverySaved(false);
    setError("");
    try {
      const response = await fetch("/api/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subtotal,
          cart: cart.map((line) => ({
            id: line.databaseId ?? line.id,
            slug: line.slug,
            title: line.title,
            quantity: line.quantity,
            price: line.price,
            image: line.image,
          })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save cart.");
      setRecoverySaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save cart.");
    }
  }

  if (cart.length === 0) {
    return (
      <section className="section-card checkout-shell">
        <div className="checkout-empty">
          <span>Checkout</span>
          <h1>Your cart is empty</h1>
          <p>Add products to the cart before starting checkout.</p>
          <div className="checkout-empty-actions">
            <Link href="/#products" className="pill-button">
              Back to shop
            </Link>
            <Link href="/" className="outline-button">
              Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-card checkout-shell">
      <div className="section-heading row-heading">
        <div>
          <span>Checkout</span>
          <h1>Complete your order</h1>
        </div>
        <Link href="/#products" className="outline-button">
          Continue shopping
        </Link>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="checkout-card">
            <h2>Customer details</h2>
            <div className="checkout-grid-two">
              <label className="checkout-field">
                <span>Full name</span>
                <input className="checkout-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </label>
              <label className="checkout-field">
                <span>Email address</span>
                <input className="checkout-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </label>
            </div>
            <div className="checkout-grid-two">
              <label className="checkout-field">
                <span>Phone</span>
                <input className="checkout-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 000 000" />
              </label>
              <label className="checkout-field">
                <span>Country</span>
                <input className="checkout-input" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="United States" />
              </label>
            </div>
          </div>
          <div className="checkout-card checkout-recovery-card">
            <h2>Save cart for later</h2>
            <p>Enter your email and we can keep this cart available for follow-up support or recovery offers.</p>
            <button type="button" className="outline-button" onClick={saveRecoveryCart}>
              Save my cart
            </button>
            {recoverySaved ? <span className="checkout-recovery-success">Cart saved for recovery.</span> : null}
          </div>

          <div className="checkout-card">
            <h2>Shipping details</h2>
            <div className="checkout-grid-two">
              <label className="checkout-field">
                <span>Address line 1</span>
                <input className="checkout-input" value={addressLine1} onChange={(event) => setAddressLine1(event.target.value)} placeholder="Street, house, apartment" />
              </label>
              <label className="checkout-field">
                <span>Address line 2</span>
                <input className="checkout-input" value={addressLine2} onChange={(event) => setAddressLine2(event.target.value)} placeholder="Optional" />
              </label>
            </div>
            <div className="checkout-grid-three">
              <label className="checkout-field">
                <span>City</span>
                <input className="checkout-input" value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
              <label className="checkout-field">
                <span>State / Region</span>
                <input className="checkout-input" value={state} onChange={(event) => setState(event.target.value)} />
              </label>
              <label className="checkout-field">
                <span>Postal code</span>
                <input className="checkout-input" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
              </label>
            </div>
            <div className="checkout-grid-two checkout-inline-options">
              <label className={`checkout-option ${shippingMethod === "standard" ? "active" : ""}`}>
                <input type="radio" name="shipping" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} />
                <div>
                  <strong>{SHIPPING_METHODS.standard.label}</strong>
                  <span>Free</span>
                </div>
              </label>
              <label className={`checkout-option ${shippingMethod === "express" ? "active" : ""}`}>
                <input type="radio" name="shipping" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} />
                <div>
                  <strong>{SHIPPING_METHODS.express.label}</strong>
                  <span>{formatPrice(SHIPPING_METHODS.express.price)}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="checkout-card">
            <h2>Payment method</h2>
            <div className="checkout-payment-grid">
              {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                <label key={value} className={`checkout-option checkout-payment-option ${paymentMethod === value ? "active" : ""}`}>
                  <input type="radio" name="payment" checked={paymentMethod === value} onChange={() => setPaymentMethod(value as PaymentMethod)} />
                  <div>
                    <strong>{label}</strong>
                    <span>
                      {value === "bank_transfer"
                        ? "Manual review with support follow-up"
                        : value === "crypto_nowpayments"
                          ? "NOWPayments crypto checkout"
                          : "Card / fiat gateway ready"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="checkout-card">
            <h2>Notes</h2>
            <label className="checkout-field">
              <span>Customer note</span>
              <textarea className="checkout-textarea" rows={4} value={customerNote} onChange={(event) => {
                setCustomerNote(event.target.value);
                setCartNote(event.target.value);
              }} placeholder="Add delivery instructions or a short note" />
            </label>
            <label className="checkout-inline-check">
              <input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} />
              Add gift wrapping (+$5)
            </label>
          </div>
        </div>

        <aside className="checkout-summary checkout-card">
          <h2>Order summary</h2>
          <div className="checkout-items">
            {cart.map((line) => (
              <article key={`${line.id}-${line.selectedColor}`} className="checkout-item">
                <img src={line.image} alt={line.title} />
                <div>
                  <strong>{line.title}</strong>
                  <span>
                    Qty {line.quantity}
                    {line.selectedColor ? ` · Finish ${line.selectedColor}` : ""}
                  </span>
                </div>
                <strong>{formatPrice(line.price * line.quantity)}</strong>
              </article>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-total-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="checkout-total-row">
              <span>Shipping</span>
              <strong>{formatPrice(shippingTotal)}</strong>
            </div>
            <div className="checkout-total-row">
              <span>Tax / VAT</span>
              <strong>{formatPrice(taxTotal)}</strong>
            </div>
            <div className="checkout-total-row">
              <span>Gift wrap</span>
              <strong>{formatPrice(giftWrapTotal)}</strong>
            </div>
            <div className="checkout-total-row">
              <span>Discount</span>
              <strong>{formatPrice(discountTotal)}</strong>
            </div>
            <div className="checkout-total-row checkout-total-final">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          {error ? <div className="checkout-error">{error}</div> : null}

          <button type="button" className="dark-button checkout-submit" disabled={loading} onClick={submitOrder}>
            {loading ? "Placing order..." : "Place order"}
          </button>
          <div className="checkout-trust-block" aria-label="Checkout trust information">
            <div><strong>Secure payment</strong><span>Provider status is confirmed server-side.</span></div>
            <div><strong>30-day returns</strong><span>Eligible unused items can be returned.</span></div>
            <div><strong>USA/UK shipping</strong><span>Standard and express delivery options.</span></div>
            <div><strong>{checkoutTotals.taxLabel}</strong><span>{checkoutTotals.shippingLabel}</span></div>
            <div><strong>Support</strong><span>support@pladatech.com</span></div>
            <div><strong>Accepted methods</strong><span>Crypto, card/fiat, bank transfer.</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

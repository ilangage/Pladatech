"use client";

import { FormEvent, useMemo, useState } from "react";
import type { WholesaleProduct } from "@/data/wholesale-types";
import { getWholesaleTierForQuantity, normalizeWholesalePriceTiers } from "@/data/wholesale-pricing";

const WHATSAPP_NUMBER = "94700000000";

type PromoProductOrderLandingProps = {
  product: WholesaleProduct;
  imageUrls: string[];
};

type SubmittedOrder = {
  name: string;
  phone: string;
  district: string;
  address: string;
  quantity: number;
  color?: string;
  deliveryNote?: string;
  unitPrice: number;
  estimatedTotal: number;
};

function formatLkr(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value)}`;
}

function getSingleItemPrice(product: WholesaleProduct, quantity: number) {
  return getWholesaleTierForQuantity(product.priceTiers, quantity)?.unitPrice ?? product.retailPrice ?? 0;
}

function getPromoPageUrl(product: WholesaleProduct) {
  if (typeof window === "undefined") return `https://www.pladatech.com/promo/${product.slug}`;
  return window.location.href;
}

function buildWhatsAppLink(product: WholesaleProduct, order: SubmittedOrder) {
  const message = [
    "Hi Pladatech, I submitted an order request.",
    "",
    `Product: ${product.title}`,
    order.color ? `Color: ${order.color}` : "Color: Not selected",
    `Quantity: ${order.quantity}`,
    `Unit price: ${formatLkr(order.unitPrice)}`,
    `Estimated total: ${formatLkr(order.estimatedTotal)}`,
    "",
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `District: ${order.district}`,
    `Address: ${order.address}`,
    order.deliveryNote ? `Delivery note: ${order.deliveryNote}` : "",
    "",
    `Product page: ${getPromoPageUrl(product)}`,
    "",
    "Please confirm availability and delivery.",
  ].filter(Boolean).join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getBenefitHeadline(product: WholesaleProduct) {
  if (product.shortDescription) {
    return product.shortDescription.replace(/\.$/, "");
  }

  return `Order ${product.title} with islandwide delivery support`;
}

function getBenefitCards(product: WholesaleProduct) {
  const specificationCards = (product.specifications ?? []).slice(0, 3).map((specification, index) => ({
    icon: ["01", "02", "03"][index] ?? "✓",
    title: specification.label,
    copy: specification.value,
  }));

  if (specificationCards.length >= 3) return specificationCards;

  return [
    ...specificationCards,
    {
      icon: "✓",
      title: "Easy To Use",
      copy: "Simple everyday product selected for practical home use.",
    },
    {
      icon: "↗",
      title: "Portable Design",
      copy: product.dimensions ? `Compact size: ${product.dimensions}.` : "Easy to carry, store, and use when needed.",
    },
    {
      icon: "COD",
      title: "Cash On Delivery",
      copy: "Order request can be confirmed before delivery where available.",
    },
  ].slice(0, 3);
}

export default function PromoProductOrderLanding({ product, imageUrls }: PromoProductOrderLandingProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const tiers = useMemo(() => normalizeWholesalePriceTiers(product.priceTiers), [product.priceTiers]);
  const galleryImages = imageUrls.length ? imageUrls : ["/wholesale/placeholder.svg"];
  const activeImage = galleryImages[activeImageIndex] ?? galleryImages[0] ?? "/wholesale/placeholder.svg";
  const benefitHeadline = getBenefitHeadline(product);
  const benefitCards = getBenefitCards(product);
  const safeQuantity = Math.max(1, Math.floor(quantity || 1));
  const selectedTier = getWholesaleTierForQuantity(product.priceTiers, safeQuantity);
  const unitPrice = getSingleItemPrice(product, safeQuantity);
  const estimatedTotal = unitPrice * safeQuantity;
  const orderFormId = "promo-order-form";

  function scrollToOrderForm() {
    document.getElementById(orderFormId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const order = {
      name: name.trim(),
      phone: phone.trim(),
      district: district.trim(),
      address: address.trim(),
      quantity: safeQuantity,
      color: selectedColor || undefined,
      deliveryNote: deliveryNote.trim() || undefined,
      unitPrice,
      estimatedTotal,
    };

    try {
      const response = await fetch("/api/promo-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.title,
          productSlug: product.slug,
          productUrl: getPromoPageUrl(product),
          source: "facebook_ad",
          campaign: "",
          name: order.name,
          phone: order.phone,
          district: order.district,
          address: order.address,
          quantity: order.quantity,
          selectedColor: order.color ?? "",
          priceTier: selectedTier?.label ?? "Single item",
          unitPrice: order.unitPrice,
          estimatedTotal: order.estimatedTotal,
          deliveryNote: order.deliveryNote ?? "",
          codAvailable: product.codAvailable !== false,
          notes: "",
        }),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(result?.error ?? "Failed to submit order request.");
      }

      setSubmittedOrder(order);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit order request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="promo-page">
      <section className="promo-shell" aria-label={`${product.title} promo order page`}>
        <div className="promo-brand-row">
          <a href="/" className="promo-brand">Pladatech</a>
          <span>Single product offer</span>
        </div>

        <div className="promo-grid">
          <section className="promo-product-panel">
            <div className="promo-compact-offer">
              <img
                src={galleryImages[0]}
                alt={product.title}
                width={150}
                height={150}
                onError={(event) => {
                  event.currentTarget.src = "/wholesale/placeholder.svg";
                }}
              />
              <div>
                <span className="promo-eyebrow">Facebook Offer</span>
                <h1>{benefitHeadline}</h1>
                <p>{product.title}</p>
                <strong>{formatLkr(unitPrice)}</strong>
              </div>
            </div>

            <div className="promo-mobile-trust-row" aria-label="Quick trust highlights">
              <span>COD</span>
              <span>Islandwide Delivery</span>
              <span>Single Item Orders</span>
            </div>

            <div className="promo-gallery" aria-label={`${product.title} image gallery`}>
              <div className="promo-gallery-thumbs" aria-label="Product image thumbnails">
                {galleryImages.map((galleryImage, index) => (
                  <button
                    type="button"
                    key={`${galleryImage}-${index}`}
                    className={activeImageIndex === index ? "active" : ""}
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={activeImageIndex === index}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={galleryImage}
                      alt=""
                      width={110}
                      height={110}
                      onError={(event) => {
                        event.currentTarget.src = "/wholesale/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="promo-image-card">
                <img
                  src={activeImage}
                  alt={product.title}
                  width={1000}
                  height={900}
                  onError={(event) => {
                    event.currentTarget.src = "/wholesale/placeholder.svg";
                  }}
                />
              </div>
            </div>

            <div className="promo-warranty-grid" aria-label="Warranty and delivery support">
              <span><strong>7 Day Checking Warranty</strong><small>Check product condition after receiving.</small></span>
              <span><strong>Damaged Item Replacement Support</strong><small>Contact us with photos if delivery damage happens.</small></span>
              <span><strong>Islandwide Delivery Available</strong><small>Delivery can be confirmed before dispatch.</small></span>
            </div>

            <div className="promo-benefit-list" aria-label="Product benefits">
              {benefitCards.map((benefit) => (
                <article key={`${benefit.title}-${benefit.copy}`}>
                  <i>{benefit.icon}</i>
                  <strong>{benefit.title}</strong>
                  <span>{benefit.copy}</span>
                </article>
              ))}
            </div>
          </section>

          <aside className="promo-order-card" id={orderFormId}>
            {submittedOrder ? (
              <div className="promo-success">
                <span className="promo-success-badge">Order request received</span>
                <h2>Order Received Successfully</h2>
                <p className="promo-success-sinhala">ඔබගේ order request එක ලැබුණා.</p>
                <p>අපි availability සහ delivery details confirm කරන්න ඔබව contact කරන්නම්.</p>

                <dl className="promo-summary-list">
                  <div><dt>Product</dt><dd>{product.title}</dd></div>
                  <div><dt>Color</dt><dd>{submittedOrder.color ?? "Not selected"}</dd></div>
                  <div><dt>Quantity</dt><dd>{submittedOrder.quantity}</dd></div>
                  <div><dt>Unit price</dt><dd>{formatLkr(submittedOrder.unitPrice)}</dd></div>
                  <div><dt>Estimated total</dt><dd>{formatLkr(submittedOrder.estimatedTotal)}</dd></div>
                  <div><dt>Name</dt><dd>{submittedOrder.name}</dd></div>
                  <div><dt>Phone</dt><dd>{submittedOrder.phone}</dd></div>
                  <div><dt>District</dt><dd>{submittedOrder.district}</dd></div>
                  <div><dt>Address</dt><dd>{submittedOrder.address}</dd></div>
                </dl>

                <a className="promo-whatsapp-button" href={buildWhatsAppLink(product, submittedOrder)} target="_blank" rel="noreferrer">
                  WhatsApp එකෙන් Order Details යවන්න
                </a>
                <button type="button" className="promo-reset-button" onClick={() => setSubmittedOrder(null)}>
                  Details වෙනස් කරන්න
                </button>
              </div>
            ) : (
              <form className="promo-order-form" onSubmit={submitOrder}>
                <input type="hidden" name="productSlug" value={product.slug} />
                <input type="hidden" name="source" value="facebook_ad" />

                <div>
                  <span className="promo-eyebrow">Order request</span>
                  <h2>දැන් Order කරන්න</h2>
                  <p>Details පුරවන්න. අපි availability සහ delivery confirm කරන්නම්.</p>
                </div>

                <div className="promo-form-trust" aria-label="Order trust highlights">
                  <span>✓ Cash on Delivery Available</span>
                  <span>✓ Islandwide Delivery</span>
                  <span>✓ Single Item Orders Accepted</span>
                </div>

                <div className="promo-price-box">
                  <span>Special Offer Price</span>
                  <strong>{formatLkr(unitPrice)}</strong>
                  <small>Unit price · {selectedTier?.label ?? "Single item"} pricing</small>
                  <div className="promo-price-summary">
                    <span>Qty {safeQuantity}</span>
                    <b>{formatLkr(estimatedTotal)}</b>
                  </div>
                  <ul>
                    <li>✓ Islandwide Delivery</li>
                    <li>✓ Cash on Delivery</li>
                    <li>✓ Quality Checked</li>
                  </ul>
                </div>

                <label>
                  <span>Name</span>
                  <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="ඔබගේ නම" />
                </label>
                <label>
                  <span>Phone / WhatsApp</span>
                  <input required value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="07XXXXXXXX" />
                </label>
                <label>
                  <span>District</span>
                  <input required value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Colombo, Gampaha..." />
                </label>
                <label>
                  <span>Full delivery address</span>
                  <textarea required value={address} onChange={(event) => setAddress(event.target.value)} rows={3} placeholder="House no, road, city" />
                </label>

                <div className="promo-form-row">
                  <label>
                    <span>Quantity</span>
                    <input
                      required
                      min={1}
                      type="number"
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    />
                  </label>
                  {product.colors?.length ? (
                    <label>
                      <span>Color</span>
                      <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>
                        {product.colors.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>

                <label>
                  <span>Delivery note optional</span>
                  <textarea value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} rows={2} placeholder="Call before delivery, landmark..." />
                </label>

                {tiers.length ? (
                  <div className="promo-tier-list" aria-label="Available price tiers">
                    {tiers.map((tier) => (
                      <span className={selectedTier?.label === tier.label ? "active" : ""} key={tier.label}>
                        {tier.label}: {formatLkr(tier.unitPrice)}
                      </span>
                    ))}
                  </div>
                ) : null}

                {submitError ? <p className="promo-submit-error" role="alert">{submitError}</p> : null}

                <button type="submit" className="promo-submit-button" disabled={submitting}>
                  {submitting ? "Submitting..." : "දැන් Order කරන්න"}
                </button>
                <p className="promo-form-note">Cash on Delivery available where possible · Islandwide delivery · Single item orders accepted</p>
              </form>
            )}
          </aside>
        </div>

        {!submittedOrder ? (
          <button type="button" className="promo-mobile-sticky-cta" onClick={scrollToOrderForm}>
            දැන් Order කරන්න · {formatLkr(estimatedTotal)}
          </button>
        ) : null}
      </section>
    </main>
  );
}

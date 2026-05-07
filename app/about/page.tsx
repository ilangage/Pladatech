import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";

export const metadata: Metadata = {
  title: "About | Pladatech",
  description:
    "Pladatech is an online store focused on practical, smart, and useful everyday technology for modern homes, cars, pets, wellness, and daily living.",
};

const missionCategories = [
  "Smart home and cleaning gadgets",
  "Kitchen and lifestyle essentials",
  "Pet care and home security products",
  "Car safety and mobile accessories",
  "Wellness and daily comfort products",
];

const trustFocus = [
  {
    title: "Carefully Selected Products",
    body: "We aim to list products that are practical, useful, and relevant to everyday life. Our store is designed around problem-solving products, not unnecessary clutter.",
  },
  {
    title: "Clear Product Information",
    body: "We do our best to provide clear product descriptions, pricing, images, and key details so customers can make informed buying decisions before placing an order.",
  },
  {
    title: "Secure Checkout",
    body: "Customer payment security is important to us. Our checkout process is designed to be safe, simple, and easy to use.",
  },
  {
    title: "Transparent Shipping",
    body: "We provide estimated delivery timelines and shipping information before and after purchase where available. Customers can review our Shipping Policy for more details.",
  },
  {
    title: "30-Day Return Support",
    body: "Eligible items may be returned within 30 days of delivery according to our Returns Policy. If an item arrives damaged, defective, or incorrect, our support team will help review the issue.",
  },
  {
    title: "Customer Support",
    body: "If you have a question before or after placing an order, our support team is available by email at support@pladatech.com.",
  },
];

const categories = [
  {
    title: "Smart Cleaning",
    body: "Products designed to help make home cleaning easier, faster, and more convenient.",
  },
  {
    title: "Kitchen & Wellness",
    body: "Helpful products for cooking, personal care, wellness, comfort, and daily routines.",
  },
  {
    title: "Pet & Home Security",
    body: "Useful items for pet owners and households that want better control, monitoring, and convenience.",
  },
  {
    title: "Car & Mobile",
    body: "Practical accessories for driving, safety, charging, organization, and mobile use.",
  },
  {
    title: "Bundles",
    body: "Selected product combinations designed to give customers better value and convenience.",
  },
];

const promises = [
  "Keep product information clear and honest",
  "Provide a simple and secure shopping experience",
  "Offer support when customers need help",
  "Be transparent about shipping and returns",
  "Focus on useful products with practical value",
  "Continue improving our store and customer experience",
];

export default function AboutPage() {
  return (
    <ShopShell>
      <div className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <h1>About Pladatech</h1>
        <div style={{ display: "grid", gap: 28, color: "var(--muted)", lineHeight: 1.7, maxWidth: 900 }}>
          <section>
            <p>
              Pladatech is an online store focused on practical, smart, and useful everyday technology for modern homes,
              cars, pets, wellness, and daily living.
            </p>
            <p>
              Our goal is simple: to help customers find reliable products that make life cleaner, safer, easier, and more
              convenient.
            </p>
            <p>
              We carefully select products based on real everyday needs, including home cleaning, kitchen convenience,
              personal wellness, pet care, car safety, and mobile accessories. Instead of offering random gadgets, we focus
              on products that solve clear problems and provide practical value.
            </p>
          </section>

          <section>
            <h2>Our Mission</h2>
            <p>
              Our mission is to make useful technology more accessible to everyday customers. We believe smart products
              should not feel complicated. They should help save time, reduce effort, improve comfort, and make daily
              routines easier.
            </p>
            <p>That is why Pladatech focuses on practical product categories such as:</p>
            <ul>
              {missionCategories.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>Every product we feature is chosen with customer usefulness, value, and convenience in mind.</p>
          </section>

          <section>
            <h2>Why Shop With Pladatech?</h2>
            <p>
              We understand that trust matters when shopping online. Pladatech is built to provide a simple, transparent,
              and customer-friendly shopping experience.
            </p>
            <div style={{ display: "grid", gap: 18 }}>
              {trustFocus.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>What We Sell</h2>
            <p>Pladatech focuses on everyday smart products across several useful categories:</p>
            <div style={{ display: "grid", gap: 18 }}>
              {categories.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Our Customer Promise</h2>
            <p>At Pladatech, we want every customer to feel confident before placing an order.</p>
            <p>Our promise is to:</p>
            <ul>
              {promises.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              We may not be the biggest store, but we are focused on building a better, cleaner, and more trustworthy
              shopping experience for our customers.
            </p>
          </section>

          <section>
            <h2>Shipping & Delivery</h2>
            <p>
              Pladatech currently ships to selected regions, including the United States, the United Kingdom, and selected
              international locations.
            </p>
            <p>
              Delivery times may vary depending on product availability, warehouse location, courier handling, customs
              processing, and the customer&apos;s delivery address.
            </p>
            <p>
              For full details, please visit our <Link href="/shipping">Shipping Policy</Link> page.
            </p>
          </section>

          <section>
            <h2>Returns & Refunds</h2>
            <p>We want customers to shop with confidence.</p>
            <p>
              Eligible products may be returned within 30 days of delivery, provided they meet our return conditions.
              Damaged, defective, or incorrect items should be reported to our support team as soon as possible after
              delivery.
            </p>
            <p>
              For full details, please visit our <Link href="/returns">Returns Policy</Link> page.
            </p>
          </section>

          <section>
            <h2>Need Help?</h2>
            <p>If you have a question about a product, order, shipping, or returns, please contact us:</p>
            <p>
              Email: <a href="mailto:support@pladatech.com">support@pladatech.com</a>
              <br />
              Website: <a href="https://pladatech.com">https://pladatech.com</a>
            </p>
            <p>
              Thank you for choosing Pladatech. We&apos;re here to help you discover practical technology that makes
              everyday life easier.
            </p>
          </section>
        </div>
      </div>
    </ShopShell>
  );
}

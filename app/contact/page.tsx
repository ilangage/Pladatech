import Link from "next/link";
import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import ContactForm from "@/components/ContactForm";
import { policies } from "@/data/store";

export const metadata: Metadata = { title: "Contact | Pladatech", description: policies.contact.body.slice(0, 155) };

export default function ContactPage() {
  return (
    <ShopShell>
      <div className="subpage section-card contact-page">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <div className="contact-page-grid">
          <div className="contact-page-copy">
            <span>Pladatech support</span>
            <h1>{policies.contact.title}</h1>
            <p>{policies.contact.body}</p>
            <div className="contact-support-card">
              <strong>Support hours</strong>
              <p>We usually reply within 1 business day. For order questions, include your order number if you have one.</p>
              <p>Business address: Kam Tong Building, 831 Canton Rd, Yau Ma Tei, Hong Kong, Hong Kong.</p>
            </div>
          </div>
          <ContactForm source="contact_page" />
        </div>
      </div>
    </ShopShell>
  );
}

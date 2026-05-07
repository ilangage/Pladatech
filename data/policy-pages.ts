export type PolicySection = {
  title: string;
  body: string;
  items?: string[];
};

export type PolicyPage = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: PolicySection[];
};

export const policyPages = {
  privacy: {
    eyebrow: "Privacy policy",
    title: "Privacy Policy",
    updated: "Last updated: May 7, 2026",
    intro:
      "Pladatech collects only the information needed to process orders, provide customer support, improve the shopping experience, and protect the website from fraud or abuse.",
    sections: [
      {
        title: "Information we collect",
        body: "When you browse, contact us, or place an order, we may collect contact details, shipping details, order details, payment status information, device/browser data, and support messages.",
        items: ["Name, email, phone number, and shipping address", "Products viewed, cart contents, order totals, and order status", "Support messages submitted through the contact form", "Basic analytics data such as pages visited, device type, and approximate region"],
      },
      {
        title: "How we use information",
        body: "We use customer information to run the store, fulfil orders, answer support requests, improve product selection, and keep checkout secure.",
        items: ["Process orders and provide tracking/support", "Respond to contact form and order help requests", "Improve website performance, product pages, and advertising relevance", "Detect spam, fraud, payment abuse, or security issues"],
      },
      {
        title: "Payments and third-party services",
        body: "Payment details are handled by payment providers. Pladatech does not store full card details or private crypto wallet keys. Provider status data may be saved so we can confirm an order.",
      },
      {
        title: "Data sharing",
        body: "We only share information with service providers required for ecommerce operations, such as hosting, analytics, payment processing, delivery, customer support, and fraud prevention.",
      },
      {
        title: "Your choices",
        body: "You may contact us to request access, correction, or deletion of personal information where applicable. Some records may need to be retained for legal, payment, tax, or fraud-prevention reasons.",
      },
    ],
  },
  terms: {
    eyebrow: "Store terms",
    title: "Terms of Use",
    updated: "Last updated: May 7, 2026",
    intro:
      "These terms explain the basic conditions for using Pladatech, browsing products, contacting support, and placing orders through the website.",
    sections: [
      {
        title: "Use of the website",
        body: "You agree to use Pladatech for lawful personal shopping purposes and not to misuse the website, interfere with checkout, copy content at scale, or attempt unauthorized access.",
      },
      {
        title: "Product information",
        body: "We work to keep product titles, descriptions, images, prices, stock notes, and specifications accurate. Minor differences in packaging, color, dimensions, or accessories may occur depending on supplier batches.",
      },
      {
        title: "Orders and availability",
        body: "An order is accepted only after checkout is completed and payment status is confirmed or payment instructions are issued. We may cancel or refund orders affected by pricing errors, unavailable stock, suspected fraud, or unsupported shipping destinations.",
      },
      {
        title: "Pricing and payment",
        body: "Prices are shown in USD unless stated otherwise. Payment status is confirmed through the relevant payment provider or webhook. Customers must send the correct payment amount, coin, and network when using crypto checkout.",
      },
      {
        title: "Customer responsibility",
        body: "Customers are responsible for providing accurate contact, delivery, and payment details. Incorrect addresses, unsupported payment networks, or incomplete contact information may delay fulfilment.",
      },
    ],
  },
  shipping: {
    eyebrow: "Delivery policy",
    title: "Shipping Policy",
    updated: "Last updated: May 7, 2026",
    intro:
      "Pladatech offers delivery options for eligible orders. Delivery times depend on product availability, destination, courier capacity, and payment confirmation.",
    sections: [
      {
        title: "Processing time",
        body: "Most orders are reviewed and prepared after payment is confirmed. Processing usually takes 1-3 business days before dispatch, depending on stock and order volume.",
      },
      {
        title: "Delivery estimates",
        body: "Estimated delivery windows are shown as guidance only. Weather, customs, courier delays, remote delivery areas, and high-demand periods can affect delivery timing.",
      },
      {
        title: "Tracking",
        body: "When tracking is available, details will be shared by email or support message. Customers can contact support with their order number for delivery updates.",
      },
      {
        title: "Address accuracy",
        body: "Please enter a complete and accurate delivery address. Address corrections after dispatch may not be possible and can cause delays or additional courier charges.",
      },
      {
        title: "Missing or delayed parcels",
        body: "If a parcel is delayed, contact support with the order number. We will review courier information and help with the next available resolution.",
      },
    ],
  },
  returns: {
    eyebrow: "Returns policy",
    title: "Returns & Refunds",
    updated: "Last updated: May 7, 2026",
    intro:
      "Eligible items may be returned within 30 days when they meet our return conditions. Contact support before sending any item back so we can review the request.",
    sections: [
      {
        title: "Return eligibility",
        body: "Items should be unused, complete, and in original condition with packaging and accessories where applicable. Some hygiene, personal-care, clearance, damaged-by-customer, or final-sale items may be excluded.",
      },
      {
        title: "Damaged or incorrect items",
        body: "If an item arrives damaged or incorrect, contact support as soon as possible with your order number, photos of the packaging, photos of the item, and a short description of the issue.",
      },
      {
        title: "Refund timing",
        body: "Approved refunds are processed after the return is reviewed. Bank, card, or payment provider processing times may vary after the refund is issued.",
      },
      {
        title: "Return shipping",
        body: "Return shipping responsibility depends on the reason for return and the product condition. Support will confirm instructions before a return is sent.",
      },
      {
        title: "How to start a return",
        body: "Use the contact form and choose Order help. Include your order number, email, product name, reason for return, and supporting photos if relevant.",
      },
    ],
  },
} satisfies Record<string, PolicyPage>;

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
      "At Pladatech, we aim to provide a smooth, reliable, and transparent delivery experience for every customer. Please read our Shipping Policy carefully before placing an order.",
    sections: [
      {
        title: "Order Processing Time",
        body: "All orders are processed within 1-3 business days after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day. During high-demand periods, order processing may take slightly longer, but we will always do our best to dispatch your order as quickly as possible.",
      },
      {
        title: "Shipping Locations",
        body: "We currently ship to selected regions, including the United States, the United Kingdom, and selected international locations. Available shipping options may vary depending on the product, supplier, warehouse location, and delivery address. If a product cannot be shipped to your location, this will usually be shown during checkout or communicated by our support team.",
      },
      {
        title: "Estimated Delivery Time",
        body: "Estimated delivery times are guidance only and may vary due to customs clearance, courier delays, weather conditions, public holidays, high order volume, or other factors outside our control.",
        items: ["United States: 5-12 business days", "United Kingdom: 6-14 business days", "Selected international locations: 7-21 business days"],
      },
      {
        title: "Shipping Costs",
        body: "Shipping costs are calculated at checkout based on your delivery location, product type, product weight, and selected shipping method. From time to time, Pladatech may offer free shipping promotions or special delivery offers. Any available shipping discount will be clearly shown at checkout before payment is completed.",
      },
      {
        title: "Order Tracking",
        body: "Once your order has been shipped, you will receive a confirmation email with tracking information, where available. Please allow 24-72 hours for tracking details to update after dispatch. In some cases, tracking updates may be delayed while the package is being transferred between courier facilities.",
      },
      {
        title: "Multiple Item Orders",
        body: "If your order contains multiple products, items may be shipped separately depending on warehouse availability, supplier location, and courier handling. This means you may receive more than one package and more than one tracking number. You will not be charged extra shipping fees for split deliveries unless clearly stated at checkout.",
      },
      {
        title: "Incorrect Shipping Information",
        body: "Please make sure your shipping address is accurate and complete before placing your order. Pladatech is not responsible for delays, failed deliveries, or lost packages caused by incorrect or incomplete shipping details provided by the customer. If you notice an address mistake after placing your order, please contact us as soon as possible at support@pladatech.com. We will do our best to update the address before the order is shipped, but we cannot guarantee changes after processing has started.",
      },
      {
        title: "Customs, Duties & Taxes",
        body: "For international orders, customs duties, import taxes, or local fees may apply depending on your country's regulations. These charges are the responsibility of the customer and are not included in the product price or shipping cost unless clearly stated at checkout. Pladatech is not responsible for delays caused by customs inspections or import procedures.",
      },
      {
        title: "Delayed or Lost Packages",
        body: "While most orders arrive within the estimated delivery window, delays can occasionally happen. If your order has not arrived within 21 business days after dispatch, please contact us with your order number and tracking details. We will review the issue and work with the courier or supplier to help resolve it. If a package is confirmed lost by the courier, we will review the case and provide an appropriate solution, which may include a replacement or refund depending on the situation.",
      },
      {
        title: "Damaged Packages",
        body: "If your package arrives damaged, please contact us within 48 hours of delivery. To help us review the issue quickly, please include the details below. We may request additional information before approving a replacement, refund, or other solution.",
        items: ["Your order number", "Photos of the damaged package", "Photos of the damaged item", "A short description of the issue"],
      },
      {
        title: "Failed Delivery or Unclaimed Packages",
        body: "If a package cannot be delivered because the address is incorrect, the customer is unavailable, or the package is not collected from the courier within the required time, the order may be returned to the sender or marked as failed delivery. Additional shipping fees may apply if the package needs to be resent.",
      },
      {
        title: "Contact Us",
        body: "For any shipping-related questions, please contact our support team. Email: support@pladatech.com. Website: https://pladatech.com. We're here to help and will respond as soon as possible.",
      },
    ],
  },
  returns: {
    eyebrow: "Returns policy",
    title: "Returns Policy",
    updated: "Last updated: May 7, 2026",
    intro:
      "At Pladatech, we want every customer to shop with confidence. If you are not fully satisfied with your order, please read our Returns Policy carefully to understand how returns, replacements, and refunds are handled.",
    sections: [
      {
        title: "Return Eligibility",
        body: "We accept return requests within 30 days of delivery. To be eligible for a return, the item must meet the conditions below. Pladatech reserves the right to reject a return if the item does not meet these conditions.",
        items: ["Unused and in the same condition that you received it", "In its original packaging", "Complete with all accessories, manuals, parts, and included items", "Not damaged due to misuse, improper handling, or customer negligence"],
      },
      {
        title: "Non-Returnable Items",
        body: "For hygiene, safety, or product-specific reasons, some items may not be eligible for return. If you are unsure whether your item is eligible for return, please contact us before sending it back.",
        items: ["Used personal care or wellness products", "Opened hygiene-related products", "Items damaged by misuse or improper handling", "Products missing original packaging, accessories, or parts", "Gift cards or digital products, if applicable", "Clearance, final sale, or discounted items marked as non-returnable"],
      },
      {
        title: "How to Request a Return",
        body: "To start a return request, please contact our support team at support@pladatech.com. Our support team will review your request and provide return instructions if the return is approved. Please do not send items back without contacting us first. Returns sent without approval may not be accepted.",
        items: ["Your order number", "The email address used for the order", "The product name", "The reason for the return", "Photos or videos if the item is damaged, defective, or incorrect"],
      },
      {
        title: "Damaged, Defective, or Incorrect Items",
        body: "If your item arrives damaged, defective, or different from what you ordered, please contact us within 48 hours of delivery. Once reviewed, we may offer a replacement, refund, store credit, or another appropriate solution depending on the situation.",
        items: ["Your order number", "Clear photos of the item", "Photos of the packaging", "A short description of the issue", "A video showing the problem, if applicable"],
      },
      {
        title: "Return Shipping Costs",
        body: "Return shipping costs may vary depending on the reason for the return. If the return is due to customer preference, incorrect size selection, change of mind, or an incorrect address provided by the customer, the customer may be responsible for return shipping costs. If the return is due to a damaged, defective, or incorrect item caused by our side, Pladatech will review the case and may cover the return shipping cost or provide an alternative solution. Original shipping fees are non-refundable unless the return is due to an error on our side.",
      },
      {
        title: "Refunds",
        body: "Once your returned item is received and inspected, we will notify you about the approval or rejection of your refund. If approved, your refund will be processed to your original payment method where possible. Refund processing times may vary depending on your payment provider, bank, or card issuer. Please allow 5-10 business days after approval for the refund to appear in your account. In some cases, we may offer store credit or a replacement instead of a refund, depending on the situation and product condition.",
      },
      {
        title: "Replacements",
        body: "If your product is confirmed to be defective, damaged, or incorrect, we may offer a replacement where available. Replacement approval depends on product availability, order details, and evidence provided by the customer. If a replacement is not available, we may offer a refund or store credit.",
      },
      {
        title: "Order Cancellations",
        body: "If you want to cancel an order, please contact us as soon as possible at support@pladatech.com. We will do our best to cancel the order before it is processed or shipped. However, once an order has been processed, packed, or shipped, we may not be able to cancel it. In that case, you may need to wait until the item is delivered and then request a return according to this policy.",
      },
      {
        title: "Exchanges",
        body: "We currently do not guarantee direct exchanges for all products. If you need a different item, the best option is to request a return for the original item and place a new order after the return is approved.",
      },
      {
        title: "Late or Missing Refunds",
        body: "If your refund has been approved but you have not received it yet, please first check your bank account or payment provider again. Then contact your card issuer or bank, as processing times can vary. If you have completed these steps and still have not received your refund, please contact us at support@pladatech.com.",
      },
      {
        title: "Important Notes",
        body: "Returns, refunds, replacements, and store credits are reviewed case by case based on the product condition and issue reported.",
        items: ["Returned items must be approved by Pladatech before being sent back", "Items returned without approval may not be accepted", "Customers are responsible for making sure returned items are safely packaged", "Pladatech is not responsible for return packages lost or damaged in transit unless the return shipping was arranged by us"],
      },
      {
        title: "Contact Us",
        body: "For any return, refund, or replacement questions, please contact our support team. Email: support@pladatech.com. Website: https://pladatech.com. We're here to help and will respond as soon as possible.",
      },
    ],
  },
} satisfies Record<string, PolicyPage>;

# Harmony Style Next.js Ecommerce Storefront

This is a premium audio ecommerce storefront inspired by the uploaded theme preview. It is a frontend-ready Next.js prototype with product cards, quick buy, quick view, slide-out cart, promo popup, mega menu, image hotspots, search, product filtering, product tabs, FAQ/contact, stories/blog section and responsive layout.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Main files

- `app/page.tsx` - homepage entry
- `components/Storefront.tsx` - all storefront UI and interactive logic
- `data/store.ts` - products, collections, feed items, stories and brand data
- `app/globals.css` - complete responsive styling

## Included features from the video/screenshots

### Cart and checkout
- Slide-out cart
- Sticky cart button
- Cart notes
- Gift wrapping option
- Quick buy
- Pre-order button support
- Demo checkout placeholder

### Customer account
- Account menu
- Sign in with Shop style button placeholder

### Marketing and conversion
- Trust badges
- Stock counter
- Recommended products
- Recently viewed products
- Quick view modal
- Quick order list
- Promo popup
- Promo banner/countdown
- Product badges
- In-menu promo
- FAQ section
- Contact form

### Merchandising
- Slideshow/banner structure
- Shipping/delivery information tab
- Size/spec information
- Product video placeholder
- Product tabs
- Product options / swatches
- Lookbook image hotspot section
- Image zoom in quick view
- Image rollover on product cards
- Product galleries structure
- High-resolution image support
- Color swatches

### Product discovery
- Back-to-top button
- Enhanced search overlay
- Mega menu
- Product filtering and sorting
- Recently viewed products
- Recommended products
- Sticky header
- Swatch filters structure
- Horizontal product carousel / infinite-scroll style collection row

## Important production notes

This is not a real payment/backend system yet. For a live ecommerce site, connect one of these:

1. Shopify Storefront API + Shopify Checkout
2. WooCommerce API
3. Custom backend with Stripe/PayHere/crypto gateway/order database

For fastest launch with reliable checkout, keep Shopify as backend and use this UI as a headless Next.js storefront.

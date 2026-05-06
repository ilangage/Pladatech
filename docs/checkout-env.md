# Checkout Environment Variables

Current ecommerce/admin env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

Checkout/payment env vars:

- `NEXT_PUBLIC_SITE_URL`
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`
- `FIAT_GATEWAY_PUBLIC_KEY`
- `FIAT_GATEWAY_SECRET_KEY`
- `FIAT_GATEWAY_WEBHOOK_SECRET`

Notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- The checkout flow creates orders in Supabase first, then generates a NOWPayments payment only after the customer selects a coin/network on the internal `/checkout/pay/[orderNumber]` page.
- Supported NOWPayments `pay_currency` values in this project are: `usdttrc20`, `usdterc20`, `btc`, `eth`, and `ltc`.
- The internal payment page keeps the customer on-site and shows the generated payment address, amount, payment ID, and optional QR/link returned by NOWPayments.
- Webhook/IPN remains the source of truth for `paid`, `processing`, `failed`, and `expired` updates.
- The generate-payment route is `POST /api/payments/nowpayments/create-payment`.
- Fiat gateway routes remain placeholders for now.
- `NEXT_PUBLIC_SITE_URL` must be set to the public site base URL so invoice success/cancel/IPN callbacks resolve correctly.

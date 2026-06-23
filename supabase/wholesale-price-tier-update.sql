-- Pladatech wholesale price tier update
-- Safe to re-run. This only updates public.wholesale_products.
-- It does not touch retail products, checkout, cart, payment, analytics, or orders.

update public.wholesale_products
set moq = 1,
    updated_at = now();

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":599},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":450},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":399},{"label":"100+ pcs","minQty":100,"unitPrice":349}]'::jsonb,
  updated_at = now()
where slug = 'usb-rechargeable-coffee-frother';

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":2490},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":2100},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":1890},{"label":"100+ pcs","minQty":100,"unitPrice":1690}]'::jsonb,
  updated_at = now()
where slug = 'portable-mini-blender';

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":3490},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":2990},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":2750},{"label":"100+ pcs","minQty":100,"unitPrice":2490}]'::jsonb,
  updated_at = now()
where slug = 'car-vacuum-cleaner-wireless';

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":1790},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":1450},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":1290},{"label":"100+ pcs","minQty":100,"unitPrice":1150}]'::jsonb,
  updated_at = now()
where slug = 'led-sunset-projection-lamp';

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":3990},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":3490},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":3190},{"label":"100+ pcs","minQty":100,"unitPrice":2890}]'::jsonb,
  updated_at = now()
where slug = 'portable-clothes-steamer';

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":990},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":750},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":650},{"label":"100+ pcs","minQty":100,"unitPrice":590}]'::jsonb,
  updated_at = now()
where slug = 'mini-sealing-machine-usb-rechargeable';

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":2990},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":2490},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":2290},{"label":"100+ pcs","minQty":100,"unitPrice":1990}]'::jsonb,
  updated_at = now()
where slug = 'wireless-lavalier-microphone';

update public.wholesale_products
set
  price_tiers = '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":1290},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":990},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":850},{"label":"100+ pcs","minQty":100,"unitPrice":750}]'::jsonb,
  updated_at = now()
where slug = 'pet-grooming-brush';

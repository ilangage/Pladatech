create extension if not exists pgcrypto;

create table if not exists wholesale_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  subcategory text,
  short_description text,
  image_public_id text,
  gallery_public_ids jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  stock_status text default 'in_stock',
  moq integer default 1,
  retail_price numeric,
  suggested_sell_price numeric,
  price_tiers jsonb default '[]'::jsonb,
  profit_note text,
  specifications jsonb default '[]'::jsonb,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint wholesale_products_stock_status_check
    check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  constraint wholesale_products_moq_check
    check (moq > 0)
);

create index if not exists wholesale_products_category_idx
  on wholesale_products (category);

create index if not exists wholesale_products_subcategory_idx
  on wholesale_products (subcategory);

create index if not exists wholesale_products_status_idx
  on wholesale_products (stock_status);

create index if not exists wholesale_products_active_sort_idx
  on wholesale_products (is_active, sort_order);

create index if not exists wholesale_products_created_at_idx
  on wholesale_products (created_at desc);

create or replace function set_wholesale_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists wholesale_products_updated_at on wholesale_products;

create trigger wholesale_products_updated_at
before update on wholesale_products
for each row
execute function set_wholesale_products_updated_at();

alter table wholesale_products enable row level security;

drop policy if exists "Public can read active wholesale products" on wholesale_products;

create policy "Public can read active wholesale products"
on wholesale_products
for select
using (is_active = true);

-- Admin create/update/delete operations in this project use the protected server-side
-- admin API with SUPABASE_SERVICE_ROLE_KEY. The service role bypasses RLS.
-- Do not expose the service-role key in client/browser code.

insert into wholesale_products (
  slug,
  title,
  category,
  subcategory,
  short_description,
  image_public_id,
  gallery_public_ids,
  colors,
  stock_status,
  moq,
  retail_price,
  suggested_sell_price,
  price_tiers,
  profit_note,
  specifications,
  is_active,
  sort_order
)
values
  (
    'usb-rechargeable-coffee-frother',
    'USB Rechargeable Coffee Frother',
    'kitchen-dining',
    'coffee-tea-tools',
    'Compact rechargeable milk frother for coffee, cappuccino and home use.',
    'wholesale/coffee-frother/main',
    '["wholesale/coffee-frother/1", "wholesale/coffee-frother/2", "wholesale/coffee-frother/3"]'::jsonb,
    '["Black", "White", "Pink"]'::jsonb,
    'in_stock',
    1,
    599,
    599,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":599},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":450},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":399},{"label":"100+ pcs","minQty":100,"unitPrice":349}]'::jsonb,
    'Potential reseller profit from Rs. 250 per unit.',
    '[]'::jsonb,
    true,
    1
  ),
  (
    'portable-mini-blender',
    'Portable Mini Blender',
    'kitchen-dining',
    'mini-blenders',
    null,
    'wholesale/mini-blender/main',
    '[]'::jsonb,
    '["White", "Pink", "Green"]'::jsonb,
    'in_stock',
    1,
    2490,
    2990,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":2490},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":2100},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":1890},{"label":"100+ pcs","minQty":100,"unitPrice":1690}]'::jsonb,
    'Good product for fitness, kitchen and lifestyle sellers.',
    '[]'::jsonb,
    true,
    2
  ),
  (
    'car-vacuum-cleaner-wireless',
    'Car Vacuum Cleaner Wireless',
    'car-accessories',
    'car-cleaning',
    null,
    'wholesale/car-vacuum/main',
    '[]'::jsonb,
    '["Black"]'::jsonb,
    'in_stock',
    1,
    3490,
    3990,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":3490},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":2990},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":2750},{"label":"100+ pcs","minQty":100,"unitPrice":2490}]'::jsonb,
    'Suitable for car accessory pages and TikTok product demos.',
    '[]'::jsonb,
    true,
    3
  ),
  (
    'led-sunset-projection-lamp',
    'LED Sunset Projection Lamp',
    'home-living',
    'lights-decor',
    null,
    'wholesale/sunset-lamp/main',
    '[]'::jsonb,
    '["Black", "White"]'::jsonb,
    'in_stock',
    1,
    1790,
    1990,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":1790},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":1450},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":1290},{"label":"100+ pcs","minQty":100,"unitPrice":1150}]'::jsonb,
    'Strong visual product for reels and room décor content.',
    '[]'::jsonb,
    true,
    4
  ),
  (
    'portable-clothes-steamer',
    'Portable Clothes Steamer',
    'home-living',
    'laundry-garment-care',
    null,
    'wholesale/clothes-steamer/main',
    '[]'::jsonb,
    '["White", "Pink"]'::jsonb,
    'in_stock',
    1,
    3990,
    4490,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":3990},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":3490},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":3190},{"label":"100+ pcs","minQty":100,"unitPrice":2890}]'::jsonb,
    'Useful household product with repeat gift demand.',
    '[]'::jsonb,
    true,
    5
  ),
  (
    'mini-sealing-machine-usb-rechargeable',
    'Mini Sealing Machine USB Rechargeable',
    'kitchen-dining',
    'food-storage',
    null,
    'wholesale/mini-sealer/main',
    '[]'::jsonb,
    '["White", "Pink", "Blue"]'::jsonb,
    'in_stock',
    1,
    990,
    1190,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":990},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":750},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":650},{"label":"100+ pcs","minQty":100,"unitPrice":590}]'::jsonb,
    'Low-ticket fast-moving product for impulse buyers.',
    '[]'::jsonb,
    true,
    6
  ),
  (
    'wireless-lavalier-microphone',
    'Wireless Lavalier Microphone',
    'mobile-gadgets',
    'microphones',
    null,
    'wholesale/lavalier-mic/main',
    '[]'::jsonb,
    '["Black"]'::jsonb,
    'in_stock',
    1,
    2990,
    3490,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":2990},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":2490},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":2290},{"label":"100+ pcs","minQty":100,"unitPrice":1990}]'::jsonb,
    'Good for creator, TikTok and mobile accessory audiences.',
    '[]'::jsonb,
    true,
    7
  ),
  (
    'pet-grooming-brush',
    'Pet Grooming Brush',
    'pet-supplies',
    'pet-grooming',
    null,
    'wholesale/pet-grooming-brush/main',
    '[]'::jsonb,
    '["Blue", "Pink", "Green"]'::jsonb,
    'in_stock',
    1,
    1290,
    1490,
    '[{"label":"1–5 pcs","minQty":1,"maxQty":4,"unitPrice":1290},{"label":"5–15 pcs","minQty":5,"maxQty":14,"unitPrice":990},{"label":"15–99 pcs","minQty":15,"maxQty":99,"unitPrice":850},{"label":"100+ pcs","minQty":100,"unitPrice":750}]'::jsonb,
    'Suitable for pet pages and shop owners.',
    '[]'::jsonb,
    true,
    8
  )
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  subcategory = excluded.subcategory,
  short_description = excluded.short_description,
  image_public_id = excluded.image_public_id,
  gallery_public_ids = excluded.gallery_public_ids,
  colors = excluded.colors,
  stock_status = excluded.stock_status,
  moq = excluded.moq,
  retail_price = excluded.retail_price,
  suggested_sell_price = excluded.suggested_sell_price,
  price_tiers = excluded.price_tiers,
  profit_note = excluded.profit_note,
  specifications = excluded.specifications,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

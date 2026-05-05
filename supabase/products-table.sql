create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  brand text default 'Pladatech',
  category text not null,
  price numeric not null,
  compare_at_price numeric,
  rating numeric default 0,
  review_count integer default 0,
  stock integer default 0,
  badge text,
  image_url text,
  image_alt text,
  gallery_images jsonb default '[]'::jsonb,
  short_description text,
  overview text,
  features jsonb default '[]'::jsonb,
  whats_included jsonb default '[]'::jsonb,
  why_customers_love_it jsonb default '[]'::jsonb,
  specs jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  feature_chips jsonb default '[]'::jsonb,
  related_product_slugs jsonb default '[]'::jsonb,
  collection_slugs jsonb default '[]'::jsonb,
  is_featured boolean default false,
  is_best_seller boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table products enable row level security;

drop policy if exists "Public can read active products" on products;
create policy "Public can read active products"
on products for select
using (is_active = true);

drop policy if exists "Authenticated users can read products" on products;
create policy "Authenticated users can read products"
on products for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert products" on products;
create policy "Authenticated users can insert products"
on products for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update products" on products;
create policy "Authenticated users can update products"
on products for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete products" on products;
create policy "Authenticated users can delete products"
on products for delete
to authenticated
using (true);

-- RLS notes:
-- Public users should only be allowed to read rows where is_active = true.
-- Admin writes must be protected by server-side checks and the ADMIN_EMAILS allowlist.
-- Suggested public read policy:
--   create policy "Public can read active products"
--   on products for select
--   using (is_active = true);

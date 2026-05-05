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

-- RLS notes:
-- Public users should only be allowed to read rows where is_active = true.
-- Admin writes must be protected by server-side checks and the ADMIN_EMAILS allowlist.
-- Suggested public read policy:
--   create policy "Public can read active products"
--   on products for select
--   using (is_active = true);


-- Pladatech wholesale banner table.
-- This table is independent from retail products, checkout, cart, payment, and order tables.

create extension if not exists pgcrypto;

create table if not exists public.wholesale_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_public_id text not null,
  cta_label text,
  cta_href text,
  badge text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint wholesale_banners_image_public_id_key unique (image_public_id)
);

create or replace function public.set_wholesale_banners_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_wholesale_banners_updated_at on public.wholesale_banners;

create trigger set_wholesale_banners_updated_at
before update on public.wholesale_banners
for each row
execute function public.set_wholesale_banners_updated_at();

alter table public.wholesale_banners enable row level security;

drop policy if exists "Public can read active wholesale banners" on public.wholesale_banners;

create policy "Public can read active wholesale banners"
on public.wholesale_banners
for select
using (is_active = true);

-- Service role bypasses RLS by default and can manage all rows from server-side admin code.
-- If you add browser-based admin editing later, align write policies with the existing admin allowlist/auth setup.

insert into public.wholesale_banners (
  title,
  subtitle,
  image_public_id,
  cta_label,
  cta_href,
  badge,
  is_active,
  sort_order
) values
  (
    'Fast-moving wholesale products for online sellers',
    'Source practical items with single-order availability, bulk pricing, and reseller-friendly support.',
    'wholesale/banners/fast-moving-products',
    'Browse hot deals',
    '/wholesale#hot-wholesale-deals',
    'Hot wholesale picks',
    true,
    1
  ),
  (
    'Low-ticket products built for quick sales',
    'Find impulse-friendly items for Facebook, TikTok, Instagram, and small shop promotions.',
    'wholesale/banners/low-ticket-products',
    'Shop under Rs. 1,000',
    '/wholesale#under-rs-1000',
    'Low price range',
    true,
    2
  ),
  (
    'New arrivals for fresh reseller content',
    'Refresh your catalog with products that are easy to explain, demonstrate, and bundle.',
    'wholesale/banners/new-arrivals',
    'See new arrivals',
    '/wholesale#new-arrivals',
    'Fresh stock',
    true,
    3
  )
on conflict (image_public_id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  cta_label = excluded.cta_label,
  cta_href = excluded.cta_href,
  badge = excluded.badge,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

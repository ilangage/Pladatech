-- Pladatech wholesale category system update
-- Safe to re-run. This does not touch retail products, checkout, cart, payment, or order tables.

alter table if exists public.wholesale_products
  add column if not exists subcategory text;

comment on column public.wholesale_products.category is
  'Wholesale main category slug. Values are managed by the website category config.';

comment on column public.wholesale_products.subcategory is
  'Optional wholesale subcategory slug. Values are managed by the website category config.';

update public.wholesale_products
set
  category = 'kitchen-dining',
  subcategory = 'coffee-tea-tools',
  updated_at = now()
where slug = 'usb-rechargeable-coffee-frother';

update public.wholesale_products
set
  category = 'kitchen-dining',
  subcategory = 'mini-blenders',
  updated_at = now()
where slug = 'portable-mini-blender';

update public.wholesale_products
set
  category = 'car-accessories',
  subcategory = 'car-cleaning',
  updated_at = now()
where slug = 'car-vacuum-cleaner-wireless';

update public.wholesale_products
set
  category = 'home-living',
  subcategory = 'lights-decor',
  updated_at = now()
where slug = 'led-sunset-projection-lamp';

update public.wholesale_products
set
  category = 'home-living',
  subcategory = 'laundry-garment-care',
  updated_at = now()
where slug = 'portable-clothes-steamer';

update public.wholesale_products
set
  category = 'kitchen-dining',
  subcategory = 'food-storage',
  updated_at = now()
where slug = 'mini-sealing-machine-usb-rechargeable';

update public.wholesale_products
set
  category = 'mobile-gadgets',
  subcategory = 'microphones',
  updated_at = now()
where slug = 'wireless-lavalier-microphone';

update public.wholesale_products
set
  category = 'pet-supplies',
  subcategory = 'pet-grooming',
  updated_at = now()
where slug = 'pet-grooming-brush';

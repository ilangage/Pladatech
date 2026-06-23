-- Pladatech wholesale marketplace field update.
-- This only touches the independent public.wholesale_products table.
-- It does not modify retail products, checkout, cart, payment, or order tables.

alter table if exists public.wholesale_products
  add column if not exists deal_tag text,
  add column if not exists is_featured boolean default false,
  add column if not exists is_new_arrival boolean default false,
  add column if not exists tags jsonb default '[]'::jsonb,
  add column if not exists package_contents jsonb default '[]'::jsonb,
  add column if not exists delivery_estimate text,
  add column if not exists delivery_note text,
  add column if not exists cod_available boolean default true,
  add column if not exists single_item_available boolean default true,
  add column if not exists return_note text,
  add column if not exists warranty_note text,
  add column if not exists marketing_assets_available boolean default false,
  add column if not exists video_public_ids jsonb default '[]'::jsonb,
  add column if not exists faqs jsonb default '[]'::jsonb,
  add column if not exists dimensions text,
  add column if not exists weight text,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

create index if not exists wholesale_products_featured_idx
  on public.wholesale_products (is_featured)
  where is_featured = true;

create index if not exists wholesale_products_new_arrival_idx
  on public.wholesale_products (is_new_arrival)
  where is_new_arrival = true;

create index if not exists wholesale_products_cod_idx
  on public.wholesale_products (cod_available)
  where cod_available = true;

update public.wholesale_products
set
  deal_tag = 'Hot deal',
  is_featured = true,
  is_new_arrival = false,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x USB rechargeable coffee frother", "1 x charging cable", "1 x user guide"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Islandwide delivery can be confirmed by WhatsApp before dispatch. Cash on Delivery may be available depending on location.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects. Misuse and physical damage are not covered.',
  marketing_assets_available = true,
  tags = '["hot-deal", "kitchen", "coffee", "low-ticket", "reseller-pick", "under-1000"]'::jsonb,
  faqs = '[{"question":"Can I order one unit first?","answer":"Yes. Single item orders are available so you can test demand before buying bulk."},{"question":"Is COD available?","answer":"Cash on Delivery can be confirmed by WhatsApp depending on delivery location and availability."}]'::jsonb,
  dimensions = 'Compact handheld size',
  weight = 'Lightweight',
  seo_title = 'USB Rechargeable Coffee Frother Wholesale | Pladatech',
  seo_description = 'Buy USB rechargeable coffee frothers with single item and bulk pricing options for Sri Lankan resellers.'
where slug = 'usb-rechargeable-coffee-frother';

update public.wholesale_products
set
  deal_tag = 'New arrival',
  is_featured = true,
  is_new_arrival = true,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x portable mini blender", "1 x USB charging cable", "1 x instruction leaflet"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Delivery availability and color stock can be confirmed by WhatsApp before dispatch.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects. Battery misuse and physical damage are not covered.',
  marketing_assets_available = true,
  tags = '["new-arrival", "kitchen", "fitness", "lifestyle", "reseller-pick"]'::jsonb,
  faqs = '[{"question":"Is this suitable for social media demos?","answer":"Yes. Portable blenders are visual products that work well for short product demos."},{"question":"Can I confirm colors before ordering?","answer":"Yes. Please include your preferred color in the WhatsApp order message."}]'::jsonb,
  dimensions = 'Portable bottle-style blender',
  weight = 'Lightweight portable appliance',
  seo_title = 'Portable Mini Blender Wholesale | Pladatech',
  seo_description = 'Wholesale portable mini blender with single item and bulk pricing for kitchen, fitness, and lifestyle sellers.'
where slug = 'portable-mini-blender';

update public.wholesale_products
set
  deal_tag = 'Reseller pick',
  is_featured = true,
  is_new_arrival = false,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x wireless car vacuum cleaner", "1 x charging cable", "1 x nozzle attachment"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Car accessory orders can be confirmed by WhatsApp with final quantity and delivery city.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects. Filters and accessories may vary by batch.',
  marketing_assets_available = true,
  tags = '["car-accessories", "cleaning", "reseller-pick", "demo-product"]'::jsonb,
  faqs = '[{"question":"Is this good for TikTok or Facebook demos?","answer":"Yes. Car cleaning products are practical and easy to demonstrate."},{"question":"Can I order for a car accessories shop?","answer":"Yes. Single item and bulk quantity options are available."}]'::jsonb,
  dimensions = 'Compact handheld vacuum',
  weight = 'Portable car cleaning device',
  seo_title = 'Wireless Car Vacuum Cleaner Wholesale | Pladatech',
  seo_description = 'Wholesale wireless car vacuum cleaner for car accessory shops, online sellers, and bulk buyers.'
where slug = 'car-vacuum-cleaner-wireless';

update public.wholesale_products
set
  deal_tag = 'Trending',
  is_featured = false,
  is_new_arrival = true,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x LED sunset projection lamp", "1 x power cable"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Lighting product availability and color options can be confirmed before dispatch.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects. Physical damage is not covered.',
  marketing_assets_available = true,
  tags = '["trending", "home-decor", "lighting", "content-creation", "gift-product"]'::jsonb,
  faqs = '[{"question":"Is this good for content creators?","answer":"Yes. Visual lighting products are useful for reels, room decor content, and gift promotions."}]'::jsonb,
  dimensions = 'Compact table lamp',
  weight = 'Lightweight decor item',
  seo_title = 'LED Sunset Projection Lamp Wholesale | Pladatech',
  seo_description = 'Wholesale LED sunset projection lamps for decor sellers, gift shops, and social media product pages.'
where slug = 'led-sunset-projection-lamp';

update public.wholesale_products
set
  deal_tag = 'Bulk value',
  is_featured = true,
  is_new_arrival = false,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x portable clothes steamer", "1 x water cup or attachment set", "1 x user guide"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Delivery and final package contents can be confirmed before dispatch.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects. Water damage from misuse is not covered.',
  marketing_assets_available = false,
  tags = '["home-living", "laundry", "fashion-sellers", "bulk-value"]'::jsonb,
  faqs = '[{"question":"Who is this product suitable for?","answer":"It works well for fashion sellers, boutiques, home users, and travel-focused buyers."}]'::jsonb,
  dimensions = 'Portable garment steamer',
  weight = 'Small appliance',
  seo_title = 'Portable Clothes Steamer Wholesale | Pladatech',
  seo_description = 'Wholesale portable clothes steamer for boutiques, home sellers, and bulk appliance buyers.'
where slug = 'portable-clothes-steamer';

update public.wholesale_products
set
  deal_tag = 'Under Rs. 1,000',
  is_featured = false,
  is_new_arrival = true,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x mini sealing machine", "1 x USB charging cable"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Low-ticket product orders can be confirmed by WhatsApp before dispatch.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects.',
  marketing_assets_available = true,
  tags = '["under-1000", "kitchen", "food-storage", "impulse-buy", "low-ticket"]'::jsonb,
  faqs = '[{"question":"Is this suitable for impulse buyers?","answer":"Yes. It is a low-ticket practical product that can work well in bundles and live selling."}]'::jsonb,
  dimensions = 'Mini handheld sealer',
  weight = 'Lightweight',
  seo_title = 'Mini USB Sealing Machine Wholesale | Pladatech',
  seo_description = 'Wholesale mini USB sealing machines for kitchen sellers, bundles, and low-ticket product promotions.'
where slug = 'mini-sealing-machine-usb-rechargeable';

update public.wholesale_products
set
  deal_tag = 'Creator product',
  is_featured = true,
  is_new_arrival = true,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x wireless lavalier microphone set", "1 x receiver", "1 x charging cable", "1 x user guide"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Connector compatibility and stock can be confirmed before dispatch.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects. Compatibility issues should be checked before order confirmation.',
  marketing_assets_available = true,
  tags = '["creator", "mobile-gadgets", "microphone", "tiktok", "reseller-pick"]'::jsonb,
  faqs = '[{"question":"Is this good for content creators?","answer":"Yes. Lavalier microphones are practical for mobile video, interviews, live selling, and teaching."}]'::jsonb,
  dimensions = 'Compact wireless microphone set',
  weight = 'Lightweight gadget',
  seo_title = 'Wireless Lavalier Microphone Wholesale | Pladatech',
  seo_description = 'Wholesale wireless lavalier microphone for creators, mobile accessory sellers, and social commerce pages.'
where slug = 'wireless-lavalier-microphone';

update public.wholesale_products
set
  deal_tag = 'Pet seller pick',
  is_featured = false,
  is_new_arrival = false,
  cod_available = true,
  single_item_available = true,
  package_contents = '["1 x pet grooming brush"]'::jsonb,
  delivery_estimate = 'Estimated delivery: 2–5 business days after order confirmation.',
  delivery_note = 'Pet product color and stock can be confirmed before dispatch.',
  return_note = 'Return support is available for damaged, defective, or incorrect items reported quickly after delivery.',
  warranty_note = 'Basic supplier warranty applies for manufacturing defects.',
  marketing_assets_available = false,
  tags = '["pet-supplies", "pet-grooming", "pet-seller-pick", "low-ticket"]'::jsonb,
  faqs = '[{"question":"Can pet pages resell this product?","answer":"Yes. It is a simple practical product for pet owners and small pet shops."}]'::jsonb,
  dimensions = 'Handheld grooming brush',
  weight = 'Lightweight',
  seo_title = 'Pet Grooming Brush Wholesale | Pladatech',
  seo_description = 'Wholesale pet grooming brush for pet pages, grooming services, small shops, and bulk buyers.'
where slug = 'pet-grooming-brush';

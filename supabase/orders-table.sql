create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  country text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text,
  postal_code text not null,
  shipping_method text not null,
  payment_method text not null default 'bank_transfer',
  payment_status text not null default 'pending',
  order_status text not null default 'new',
  subtotal numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  gift_wrap_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'USD',
  customer_note text,
  fulfillment_note text,
  tracking_number text,
  tracking_url text,
  shipping_provider text,
  refund_reason text,
  canceled_at timestamptz,
  gateway_name text,
  gateway_payment_id text,
  gateway_invoice_url text,
  raw_gateway_response jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid,
  product_slug text not null,
  product_name text not null,
  product_title text not null,
  selected_color text,
  quantity integer not null,
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null,
  product_image text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
alter table order_items enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on orders;
create trigger set_orders_updated_at
before update on orders
for each row
execute function public.set_updated_at();

create index if not exists orders_order_number_idx on orders (order_number);
create index if not exists orders_customer_email_idx on orders (customer_email);
create index if not exists orders_payment_status_idx on orders (payment_status);
create index if not exists orders_order_status_idx on orders (order_status);
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists order_items_order_id_idx on order_items (order_id);

alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists country text;
alter table orders add column if not exists address_line1 text;
alter table orders add column if not exists address_line2 text;
alter table orders add column if not exists city text;
alter table orders add column if not exists state text;
alter table orders add column if not exists postal_code text;
alter table orders add column if not exists shipping_method text;
alter table orders add column if not exists payment_method text default 'bank_transfer';
alter table orders add column if not exists payment_status text default 'pending';
alter table orders add column if not exists order_status text default 'new';
alter table orders add column if not exists subtotal numeric(12,2) default 0;
alter table orders add column if not exists shipping_total numeric(12,2) default 0;
alter table orders add column if not exists tax_total numeric(12,2) default 0;
alter table orders add column if not exists discount_total numeric(12,2) default 0;
alter table orders add column if not exists gift_wrap_total numeric(12,2) default 0;
alter table orders add column if not exists total numeric(12,2) default 0;
alter table orders add column if not exists currency text default 'USD';
alter table orders add column if not exists customer_note text;
alter table orders add column if not exists fulfillment_note text;
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists tracking_url text;
alter table orders add column if not exists shipping_provider text;
alter table orders add column if not exists refund_reason text;
alter table orders add column if not exists canceled_at timestamptz;
alter table orders add column if not exists gateway_name text;
alter table orders add column if not exists gateway_payment_id text;
alter table orders add column if not exists gateway_invoice_url text;
alter table orders add column if not exists raw_gateway_response jsonb default '{}'::jsonb;
alter table orders add column if not exists updated_at timestamptz default now();

alter table order_items add column if not exists product_id uuid;
alter table order_items alter column product_id drop not null;
alter table order_items add column if not exists product_slug text;
alter table order_items add column if not exists product_name text;
alter table order_items add column if not exists product_title text;
alter table order_items add column if not exists selected_color text;
alter table order_items add column if not exists quantity integer;
alter table order_items add column if not exists unit_price numeric(12,2);
alter table order_items add column if not exists line_total numeric(12,2);
alter table order_items add column if not exists product_image text;
alter table order_items add column if not exists created_at timestamptz default now();

-- Orders are written from server-only API routes with the service role key.
-- No public insert/select policy is added here for checkout foundations.

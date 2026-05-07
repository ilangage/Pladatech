create table if not exists abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  cart_snapshot jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  status text not null default 'captured',
  recovery_sent_at timestamptz,
  recovered_order_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists abandoned_carts_email_idx on abandoned_carts (email);
create index if not exists abandoned_carts_status_idx on abandoned_carts (status);
create index if not exists abandoned_carts_updated_at_idx on abandoned_carts (updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_abandoned_carts_updated_at on abandoned_carts;
create trigger set_abandoned_carts_updated_at
before update on abandoned_carts
for each row
execute function public.set_updated_at();

-- Captured from server-side API using service role.
-- Recovery emails can be added later with Resend/SendGrid/Klaviyo.

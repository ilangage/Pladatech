create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  topic text not null,
  order_number text,
  message text not null,
  status text default 'new',
  source text default 'contact_page',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists contact_messages_email_idx on contact_messages (email);
create index if not exists contact_messages_order_number_idx on contact_messages (order_number);
create index if not exists contact_messages_status_idx on contact_messages (status);
create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);

create or replace function set_contact_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contact_messages_updated_at on contact_messages;

create trigger contact_messages_updated_at
before update on contact_messages
for each row
execute function set_contact_messages_updated_at();

-- RLS notes:
-- 1. Do not allow public read access to support tickets.
-- 2. Public form submissions should go through the server-side /api/contact route.
-- 3. Admin reads/writes should use protected server routes with the service role key.

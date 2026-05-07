create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  customer_name text not null,
  customer_email text,
  customer_location text,
  rating numeric not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  photo_url text,
  photo_note text,
  source text default 'Customer submitted review',
  verified_purchase boolean default false,
  status text default 'pending',
  review_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists product_reviews_product_slug_idx on product_reviews (product_slug);
create index if not exists product_reviews_status_idx on product_reviews (status);
create index if not exists product_reviews_review_date_idx on product_reviews (review_date desc);

create or replace function set_product_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists product_reviews_updated_at on product_reviews;

create trigger product_reviews_updated_at
before update on product_reviews
for each row
execute function set_product_reviews_updated_at();

-- RLS notes:
-- 1. Public storefront should only read rows where status = 'approved'.
-- 2. Review creation/moderation should be handled by protected admin/server routes.
-- 3. Do not expose customer_email publicly.

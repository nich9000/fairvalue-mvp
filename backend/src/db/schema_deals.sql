-- Deal search engine schema (additive to schema.sql). Run in the Supabase SQL editor.
-- Classification fields (platform/fulfillment_model/traffic_channel/listing_status) are
-- varchar rather than strict Postgres ENUMs: real marketplace data has messy/hybrid values
-- (e.g. "Amazon FBA / Shopify") that don't fit a fixed enum without losing information.

create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),

  external_id varchar,
  source_marketplace varchar not null,
  source_url varchar,

  listing_price decimal not null,
  annual_revenue decimal not null,
  annual_profit decimal,
  multiple_achieved decimal not null,
  profit_margin_pct decimal,
  growth_rate_yoy_pct decimal,

  platform varchar not null,
  niche_category varchar,
  fulfillment_model varchar,
  traffic_channel varchar,
  customer_retention_pct decimal,
  recurring_revenue_pct decimal,

  data_completeness_score integer,

  listed_date date,
  sold_date date,
  listing_status varchar not null default 'active',

  description text,

  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create index if not exists idx_marketplace_listings_platform on marketplace_listings(platform);
create index if not exists idx_marketplace_listings_niche on marketplace_listings(niche_category);
create index if not exists idx_marketplace_listings_multiple on marketplace_listings(multiple_achieved);
create index if not exists idx_marketplace_listings_status on marketplace_listings(listing_status);
create index if not exists idx_marketplace_listings_revenue on marketplace_listings(annual_revenue);

create table if not exists marketplace_pricing_index (
  id uuid primary key default gen_random_uuid(),

  platform varchar not null,
  fulfillment_model varchar,
  traffic_channel varchar,
  niche_category varchar,

  median_multiple decimal not null,
  mean_multiple decimal,
  std_dev_multiple decimal,
  min_multiple decimal,
  max_multiple decimal,

  sample_size integer,
  sample_date timestamp not null,

  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create table if not exists deal_rankings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings(id) on delete cascade unique,

  value_score decimal,
  quality_score decimal,
  growth_score decimal,
  risk_score decimal,
  composite_score decimal,

  calculated_at timestamp default current_timestamp
);

create index if not exists idx_deal_rankings_composite on deal_rankings(composite_score desc);

create table if not exists user_saved_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  listing_id uuid not null references marketplace_listings(id) on delete cascade,

  saved_at timestamp default current_timestamp,
  notes text,
  interest_level varchar default 'medium',

  unique(user_id, listing_id)
);

create index if not exists idx_user_saved_deals_user on user_saved_deals(user_id);
create index if not exists idx_user_saved_deals_listing on user_saved_deals(listing_id);

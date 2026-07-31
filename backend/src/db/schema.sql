-- FairValue schema. Run this in the Supabase SQL editor.
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar unique not null,
  password_hash varchar not null,
  created_at timestamp default current_timestamp,
  subscription_status varchar default 'free',
  subscription_expires timestamp,
  is_active boolean default true
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  store_name varchar not null,
  platform varchar not null,
  annual_revenue decimal,
  annual_profit decimal,
  store_age_months integer,
  customer_concentration_pct decimal,
  customer_retention_pct decimal,
  gross_margin_pct decimal,
  recurring_revenue_pct decimal,
  growth_rate_yoy_pct decimal,
  niche_specialization_level integer,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create table if not exists valuations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  base_multiple decimal,
  base_valuation decimal,
  final_valuation_low decimal,
  final_valuation_high decimal,
  confidence_score decimal,
  improvement_opportunities json,
  calculated_at timestamp default current_timestamp
);

create table if not exists comps (
  id uuid primary key default gen_random_uuid(),
  sale_price decimal not null,
  annual_revenue decimal not null,
  annual_profit decimal,
  multiple_achieved decimal,
  platform varchar,
  niche_category varchar,
  customer_retention_pct decimal,
  growth_rate_yoy_pct decimal,
  gross_margin_pct decimal,
  sold_date date,
  source varchar,
  is_verified boolean default false,
  data_quality_score integer,
  created_at timestamp default current_timestamp
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  tier varchar default 'free',
  status varchar default 'active',
  stripe_subscription_id varchar,
  renewal_date timestamp,
  created_at timestamp default current_timestamp
);

create index if not exists idx_stores_user_id on stores(user_id);
create index if not exists idx_valuations_store_id on valuations(store_id);
create index if not exists idx_comps_platform on comps(platform);
create index if not exists idx_comps_niche on comps(niche_category);
create index if not exists idx_comps_revenue on comps(annual_revenue);

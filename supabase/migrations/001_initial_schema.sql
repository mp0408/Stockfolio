-- ============================================================
-- STOCKFOLIO DATABASE SCHEMA
-- Run this in the Supabase SQL Editor to set up all tables,
-- indexes, triggers, and Row Level Security policies.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. STORES
-- ============================================================

create table public.stores (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

alter table public.stores enable row level security;

create policy "Users can view their own store"
  on public.stores for select
  using (owner_id = auth.uid());

create policy "Users can create a store on signup"
  on public.stores for insert
  with check (owner_id = auth.uid());

create policy "Owners can update their store"
  on public.stores for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ============================================================
-- 2. PROFILES (extends auth.users)
-- ============================================================

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  store_id   uuid references public.stores(id) on delete set null,
  full_name  text not null,
  role       text check (role in ('manager', 'staff')) default 'manager' not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- 3. PRODUCTS
-- ============================================================

create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  store_id            uuid references public.stores(id) on delete cascade not null,
  name                text not null,
  sku                 text not null,
  quantity            int not null default 0,
  low_stock_threshold int not null default 5,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

-- Stock status is DERIVED from quantity vs low_stock_threshold,
-- never stored, to avoid drift.

-- Unique SKU per store
create unique index idx_products_store_sku on public.products(store_id, sku);

-- Index for filtering by store
create index idx_products_store on public.products(store_id);

alter table public.products enable row level security;

create policy "Users can only access their store products"
  on public.products for select
  using (
    store_id = (select store_id from public.profiles where id = auth.uid())
  );

create policy "Users can insert products for their store"
  on public.products for insert
  with check (
    store_id = (select store_id from public.profiles where id = auth.uid())
  );

create policy "Users can update their store products"
  on public.products for update
  using (
    store_id = (select store_id from public.profiles where id = auth.uid())
  )
  with check (
    store_id = (select store_id from public.profiles where id = auth.uid())
  );

create policy "Users can delete their store products"
  on public.products for delete
  using (
    store_id = (select store_id from public.profiles where id = auth.uid())
  );

-- Auto-update updated_at on product changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- 4. INVENTORY LOGS (audit trail)
-- ============================================================

create table public.inventory_logs (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references public.products(id) on delete cascade not null,
  store_id       uuid references public.stores(id) on delete cascade not null,
  change_type    text check (
    change_type in ('increase', 'decrease', 'reorder', 'manual_adjust')
  ) not null,
  quantity_delta int not null,
  note           text,
  created_by     uuid references auth.users(id) not null,
  created_at     timestamptz default now() not null
);

-- Index for querying logs by product
create index idx_logs_product on public.inventory_logs(product_id);
create index idx_logs_store on public.inventory_logs(store_id);

alter table public.inventory_logs enable row level security;

create policy "Users can view their store logs"
  on public.inventory_logs for select
  using (
    store_id = (select store_id from public.profiles where id = auth.uid())
  );

create policy "Users can insert logs for their store"
  on public.inventory_logs for insert
  with check (
    store_id = (select store_id from public.profiles where id = auth.uid())
    and created_by = auth.uid()
  );

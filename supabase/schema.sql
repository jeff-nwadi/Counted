-- =============================================================================
-- Counted — schema.sql
-- Source of truth for the database. Apply via the Supabase SQL editor.
-- =============================================================================
-- This file mirrors the four tables from AGENTS.md Section 4 (locations, items,
-- stock_levels, transfers) and adds two more for multi-tenancy:
--   - orgs: a customer/business
--   - profiles: 1:1 with auth.users, holds org membership
-- Every business table carries an org_id and is RLS-protected (see policies.sql).
--
-- Apply order: schema.sql first, then policies.sql, then (optionally) seed.sql.
-- =============================================================================


-- ----- 0. Extensions -----
create extension if not exists "pgcrypto";


-- ----- 1. orgs -----
-- A "tenant" in the multi-tenant sense. Every business customer is one org.
create table public.orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);


-- ----- 2. profiles -----
-- 1:1 with auth.users. Stores which org a signed-in user belongs to.
-- A user is created in auth.users by Supabase Auth; we insert a profile row
-- on first sign-in via a trigger (defined further down).
create table public.profiles (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  org_id    uuid not null references public.orgs(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);
create index profiles_org_idx on public.profiles(org_id);




-- ----- 3. locations -----
create table public.locations (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.orgs(id) on delete cascade,
  name       text not null,
  code       text not null,                 -- e.g. "DT-01"
  created_at timestamptz not null default now(),
  unique (org_id, code)
);
create index locations_org_idx on public.locations(org_id);


-- ----- 4. items -----
-- SKUs are unique within an org, not globally — two customers can both have
-- an item with sku "BLUE-M". Keeps the constraint honest at the right scope.
create table public.items (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.orgs(id) on delete cascade,
  sku        text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  unique (org_id, sku)
);
create index items_org_idx on public.items(org_id);


-- ----- 5. stock_levels -----
-- One row per (location, item) pair. `qty` is the live count, `reorder_level`
-- is the threshold below which the system should suggest a transfer.
create table public.stock_levels (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs(id) on delete cascade,
  location_id   uuid not null references public.locations(id) on delete cascade,
  item_id       uuid not null references public.items(id) on delete cascade,
  qty           integer not null default 0,
  reorder_level integer not null default 0,
  updated_at    timestamptz not null default now(),
  unique (location_id, item_id)
);
create index stock_levels_org_idx    on public.stock_levels(org_id);
create index stock_levels_location_idx on public.stock_levels(location_id);
create index stock_levels_item_idx   on public.stock_levels(item_id);


-- ----- 6. transfers -----
-- Append-only log. Nothing is deleted or silently overwritten — every approved
-- transfer is recorded, which is what makes the Transfer History screen
-- trustworthy (AGENTS.md Section 2, "core logic underneath all five screens").
create table public.transfers (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs(id) on delete cascade,
  item_id       uuid not null references public.items(id) on delete restrict,
  qty           integer not null check (qty > 0),
  from_location uuid not null references public.locations(id) on delete restrict,
  to_location   uuid not null references public.locations(id) on delete restrict,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index transfers_org_idx    on public.transfers(org_id);
create index transfers_item_idx   on public.transfers(item_id);
create index transfers_created_at on public.transfers(created_at desc);


-- ----- 7. handle_new_user trigger -----
-- When Supabase Auth creates a new user, ensure a profile row exists.
-- On first ever sign-up, also create an org and assign them as the owner.
-- Subsequent sign-ups (invited teammates) need a different path — out of
-- scope for v1, which assumes single-user per org.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  -- Bootstrap: create an org and a profile for the first user only.
  -- If a profile row already exists for this user (e.g. invited teammate),
  -- do nothing — the invite flow will handle their org assignment.
  if not exists (select 1 from public.profiles where user_id = new.id) then
    insert into public.orgs (name)
    values (coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s business')
    returning id into new_org_id;

    insert into public.profiles (user_id, org_id, full_name)
    values (new.id, new_org_id, new.raw_user_meta_data->>'full_name');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ----- 8. Realtime -----
-- Add the four data tables to the supabase_realtime publication so the
-- client can subscribe to row-level changes (AGENTS.md Section 4: "Enable
-- Supabase real-time on stock_levels").
alter publication supabase_realtime add table public.stock_levels;
alter publication supabase_realtime add table public.transfers;
alter publication supabase_realtime add table public.locations;
alter publication supabase_realtime add table public.items;

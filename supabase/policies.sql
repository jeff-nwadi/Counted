-- =============================================================================
-- Counted — policies.sql
-- Row Level Security: every business table is scoped by org_id.
-- Apply AFTER schema.sql.
-- =============================================================================
-- Every policy follows the same shape: a user can read/write a row iff the
-- row's org_id matches the org_id on their profile. A helper function
-- `public.current_org_id()` reads the JWT claim via the profiles table.
--
-- AGENTS.md Section 4 calls this out as "critical: without RLS, one
-- customer's business could see another's data."
-- =============================================================================


-- ----- 0. Enable RLS on every business table -----
alter table public.orgs         enable row level security;
alter table public.profiles     enable row level security;
alter table public.locations    enable row level security;
alter table public.items        enable row level security;
alter table public.stock_levels enable row level security;
alter table public.transfers    enable row level security;


-- ----- 1. Helper: current user's org_id -----
-- Returns the org_id of the signed-in user, or null if not signed in.
-- `security definer` so it can read profiles regardless of profile RLS,
-- and `stable` so Postgres can cache the result within a single query.
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where user_id = auth.uid()
  limit 1;
$$;


-- ----- 2. orgs -----
-- A user can read their own org. They cannot create one directly — the
-- handle_new_user trigger creates it on first sign-up.
create policy "orgs: read own org"
  on public.orgs
  for select
  to authenticated
  using (id = public.current_org_id());

create policy "orgs: update own org"
  on public.orgs
  for update
  to authenticated
  using (id = public.current_org_id())
  with check (id = public.current_org_id());


-- ----- 3. profiles -----
create policy "profiles: read own org members"
  on public.profiles
  for select
  to authenticated
  using (org_id = public.current_org_id());

create policy "profiles: update own profile"
  on public.profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ----- 4. locations -----
create policy "locations: read own org"
  on public.locations
  for select
  to authenticated
  using (org_id = public.current_org_id());

create policy "locations: insert own org"
  on public.locations
  for insert
  to authenticated
  with check (org_id = public.current_org_id());

create policy "locations: update own org"
  on public.locations
  for update
  to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

create policy "locations: delete own org"
  on public.locations
  for delete
  to authenticated
  using (org_id = public.current_org_id());


-- ----- 5. items -----
create policy "items: read own org"
  on public.items
  for select
  to authenticated
  using (org_id = public.current_org_id());

create policy "items: insert own org"
  on public.items
  for insert
  to authenticated
  with check (org_id = public.current_org_id());

create policy "items: update own org"
  on public.items
  for update
  to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

create policy "items: delete own org"
  on public.items
  for delete
  to authenticated
  using (org_id = public.current_org_id());


-- ----- 6. stock_levels -----
create policy "stock_levels: read own org"
  on public.stock_levels
  for select
  to authenticated
  using (org_id = public.current_org_id());

create policy "stock_levels: insert own org"
  on public.stock_levels
  for insert
  to authenticated
  with check (org_id = public.current_org_id());

create policy "stock_levels: update own org"
  on public.stock_levels
  for update
  to authenticated
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

create policy "stock_levels: delete own org"
  on public.stock_levels
  for delete
  to authenticated
  using (org_id = public.current_org_id());


-- ----- 7. transfers -----
-- Append-only. No delete policy on purpose — once a transfer is recorded,
-- the history is the source of truth (AGENTS.md Section 2).
create policy "transfers: read own org"
  on public.transfers
  for select
  to authenticated
  using (org_id = public.current_org_id());

create policy "transfers: insert own org"
  on public.transfers
  for insert
  to authenticated
  with check (org_id = public.current_org_id());

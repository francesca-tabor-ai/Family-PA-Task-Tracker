-- Migration: Create Categories Table
-- Hierarchical category system for Family PA tasks and other modules
-- Categories are household-scoped and support parent-child relationships

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.families(id) on delete cascade,
  -- Note: Using families table as households. If you have a separate households table,
  -- change the reference to: references public.households(id) on delete cascade
  name text not null,
  slug text not null,
  parent_id uuid references public.categories(id) on delete cascade,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  
  -- Unique constraint: slug must be unique per household
  constraint categories_household_slug_unique unique (household_id, slug),
  
  -- Ensure parent_id is not self-referencing in a way that creates cycles
  -- (This is enforced by application logic, but we add a check constraint)
  constraint categories_parent_check check (parent_id is null or parent_id != id)
);

-- Indexes for performance
create index if not exists categories_household_id_idx on public.categories(household_id);
create index if not exists categories_parent_id_idx on public.categories(parent_id);
create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_active_idx on public.categories(is_active);
create index if not exists categories_sort_order_idx on public.categories(household_id, sort_order);

-- Updated_at trigger
create or replace function public.update_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row
  execute function public.update_categories_updated_at();

-- Enable RLS
alter table public.categories enable row level security;

-- RLS Policies

-- Select: Users can read categories for households (families) they belong to
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select
  using (public.is_family_member(household_id));

-- Insert: Only household members can insert categories
drop policy if exists categories_insert on public.categories;
create policy categories_insert on public.categories
  for insert
  with check (public.is_family_member(household_id));

-- Update: Only household members can update categories
drop policy if exists categories_update on public.categories;
create policy categories_update on public.categories
  for update
  using (public.is_family_member(household_id))
  with check (public.is_family_member(household_id));

-- Delete: Only household members can delete categories
drop policy if exists categories_delete on public.categories;
create policy categories_delete on public.categories
  for delete
  using (public.is_family_member(household_id));

-- Comments
comment on table public.categories is 'Hierarchical category system for organizing tasks and other Family PA modules. Categories are household-scoped and support parent-child relationships.';
comment on column public.categories.household_id is 'Reference to the household (family) this category belongs to';
comment on column public.categories.name is 'Display name of the category';
comment on column public.categories.slug is 'URL-friendly identifier, unique per household';
comment on column public.categories.parent_id is 'Reference to parent category (null for top-level categories)';
comment on column public.categories.sort_order is 'Order for display within the same level';
comment on column public.categories.is_active is 'Whether the category is active and visible';


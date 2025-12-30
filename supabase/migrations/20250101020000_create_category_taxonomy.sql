-- Migration: Create Category Taxonomy
-- Hierarchical category system stored as full paths (e.g., "Health & Wellness > Dentists & specialists")

-- Categories reference table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  -- null family_id means it's a system-wide category available to all families
  path text not null unique, -- Full path like "Health & Wellness > Dentists & specialists"
  parent_path text, -- Parent path for hierarchical queries (null for top-level)
  level integer not null default 1, -- Depth in hierarchy (1 = top-level)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  
  constraint categories_path_format check (path ~ '^[^>]+( > [^>]+)*$'), -- Ensures proper format
  constraint categories_parent_check check (
    (parent_path is null and level = 1) or 
    (parent_path is not null and level > 1)
  )
);

-- Indexes
create index if not exists categories_family_id_idx on public.categories(family_id);
create index if not exists categories_path_idx on public.categories(path);
create index if not exists categories_parent_path_idx on public.categories(parent_path);
create index if not exists categories_level_idx on public.categories(level);
create index if not exists categories_active_idx on public.categories(is_active);

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

-- RLS Policies for categories
-- Select: Everyone can see system categories (family_id is null) and their family's custom categories
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select
  using (
    family_id is null or 
    public.is_family_member(family_id)
  );

-- Insert: Family members can add custom categories to their family
drop policy if exists categories_insert on public.categories;
create policy categories_insert on public.categories
  for insert
  with check (
    (family_id is null and auth.uid() is not null) or -- System categories (admin only, handled by service role)
    (family_id is not null and public.is_family_member(family_id))
  );

-- Update: Family members can update their family's custom categories
drop policy if exists categories_update on public.categories;
create policy categories_update on public.categories
  for update
  using (
    (family_id is null and auth.uid() is not null) or -- System categories (admin only)
    (family_id is not null and public.is_family_member(family_id))
  )
  with check (
    (family_id is null and auth.uid() is not null) or
    (family_id is not null and public.is_family_member(family_id))
  );

-- Delete: Family members can delete their family's custom categories (not system categories)
drop policy if exists categories_delete on public.categories;
create policy categories_delete on public.categories
  for delete
  using (
    family_id is not null and 
    public.is_family_member(family_id)
  );

-- Helper function to get category name from path
create or replace function public.get_category_name(path text)
returns text
language sql
immutable
as $$
  select split_part(path, ' > ', -1);
$$;

-- Helper function to get top-level category from path
create or replace function public.get_top_level_category(path text)
returns text
language sql
immutable
as $$
  select split_part(path, ' > ', 1);
$$;

-- Comments
comment on table public.categories is 'Hierarchical category taxonomy for tasks. Categories are stored as full paths (e.g., "Health & Wellness > Dentists & specialists")';
comment on column public.categories.path is 'Full hierarchical path (e.g., "Health & Wellness > Dentists & specialists")';
comment on column public.categories.parent_path is 'Parent category path (null for top-level categories)';
comment on column public.categories.level is 'Depth in hierarchy (1 = top-level)';
comment on column public.categories.family_id is 'null for system-wide categories, uuid for family-specific custom categories';


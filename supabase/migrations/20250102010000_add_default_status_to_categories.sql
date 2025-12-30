-- Migration: Add default_status field to categories table
-- Allows categories to specify a default task status when tasks are created under them

-- Add default_status column
alter table public.categories
  add column if not exists default_status text;

-- Add check constraint for valid status values
alter table public.categories
  add constraint categories_default_status_check 
  check (default_status is null or default_status in ('open', 'in_progress', 'done', 'canceled', 'inbox', 'pending', 'scheduled', 'completed'));

-- Add index for queries filtering by default_status
create index if not exists categories_default_status_idx on public.categories(default_status)
where default_status is not null;

-- Comment
comment on column public.categories.default_status is 'Default task status when creating tasks under this category/subcategory. Maps to task.status field.';


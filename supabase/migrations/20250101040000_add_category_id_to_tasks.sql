-- Migration: Add category_id to tasks table
-- Links tasks to categories table for proper relationship

-- Add category_id column
alter table public.tasks
  add column if not exists category_id uuid references public.categories(id) on delete set null;

-- Create index for category_id
create index if not exists tasks_category_id_idx on public.tasks(category_id);

-- Comment
comment on column public.tasks.category_id is 'Reference to category in categories table. NULL for uncategorised tasks.';


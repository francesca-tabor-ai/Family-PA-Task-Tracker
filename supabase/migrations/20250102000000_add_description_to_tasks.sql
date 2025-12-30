-- Migration: Add description field to tasks table
-- Allows tasks to have optional detailed descriptions

-- Add description column
alter table public.tasks
  add column if not exists description text;

-- Add index for full-text search (optional, but useful for searching descriptions)
create index if not exists tasks_description_idx on public.tasks using gin(to_tsvector('english', description))
where description is not null;

-- Comment
comment on column public.tasks.description is 'Optional detailed description of the task.';


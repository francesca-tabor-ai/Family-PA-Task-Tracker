-- Migration: Refactor Task Data Model
-- Adds new fields and updates status enum to support new workflow states

-- Step 1: Add new columns to tasks table
alter table public.tasks
  add column if not exists description text,
  add column if not exists categories text[] default '{}',
  add column if not exists people uuid[] default '{}',
  add column if not exists scheduled_for timestamptz,
  add column if not exists high_risk boolean default false,
  add column if not exists updated_at timestamptz default now();

-- Step 2: Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Step 3: Create trigger for updated_at
drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.update_updated_at_column();

-- Step 4: Update status constraint to include new statuses
-- First, we need to handle existing data migration
-- Map old statuses to new ones:
-- 'open' -> 'inbox'
-- 'done' -> 'completed'
-- 'in_progress' -> 'in_progress' (keep)
-- 'canceled' -> 'delegated' (map canceled to delegated)

-- Update existing status values
update public.tasks
set status = case
  when status = 'open' then 'inbox'
  when status = 'done' then 'completed'
  when status = 'canceled' then 'delegated'
  else status
end;

-- Step 5: Drop old constraint and create new one
alter table public.tasks
  drop constraint if exists tasks_status_check;

alter table public.tasks
  add constraint tasks_status_check check (
    status in ('inbox', 'waiting', 'scheduled', 'in_progress', 'completed', 'delegated')
  );

-- Step 6: Update source_type constraint (rename to source and add enum)
alter table public.tasks
  drop constraint if exists tasks_source_type_check;

-- Add new source column if it doesn't exist
alter table public.tasks
  add column if not exists source text;

-- Migrate existing source_type to source
update public.tasks
set source = case
  when source_type = 'whatsapp' then 'voice'
  when source_type = 'manual' then 'manual'
  when source_type = 'import' then 'api'
  else 'manual'
end
where source is null;

-- Set default for source
alter table public.tasks
  alter column source set default 'manual';

-- Add constraint for source enum
alter table public.tasks
  add constraint tasks_source_check check (
    source in ('manual', 'voice', 'api')
  );

-- Step 7: Create indexes for new fields
create index if not exists tasks_categories_idx on public.tasks using gin(categories);
create index if not exists tasks_people_idx on public.tasks using gin(people);
create index if not exists tasks_scheduled_for_idx on public.tasks(scheduled_for);
create index if not exists tasks_high_risk_idx on public.tasks(high_risk);
create index if not exists tasks_updated_at_idx on public.tasks(updated_at);
create index if not exists tasks_status_idx on public.tasks(status);

-- Step 8: Add comment for documentation
comment on column public.tasks.status is 'Task status: inbox (new), waiting (blocked), scheduled (has date), in_progress (active), completed (done), delegated (assigned to someone)';
comment on column public.tasks.source is 'Task source: manual (UI), voice (WhatsApp), api (programmatic)';
comment on column public.tasks.categories is 'Array of category paths for hierarchical categorization';
comment on column public.tasks.people is 'Array of person/user IDs associated with this task';
comment on column public.tasks.scheduled_for is 'Date/time when task is scheduled to be worked on';
comment on column public.tasks.high_risk is 'Flag for high-priority or time-sensitive tasks';


-- Migration: Create People Model
-- Separate Person model for linking to tasks

-- People table
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  group_type text not null default 'adult',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  
  constraint people_group_type_check check (
    group_type in ('adult', 'child', 'pet', 'emergency_contact')
  )
);

-- Indexes
create index if not exists people_family_id_idx on public.people(family_id);
create index if not exists people_group_type_idx on public.people(group_type);
create index if not exists people_name_idx on public.people(name);

-- Updated_at trigger
create or replace function public.update_people_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_people_updated_at on public.people;
create trigger trg_people_updated_at
  before update on public.people
  for each row
  execute function public.update_people_updated_at();

-- Enable RLS
alter table public.people enable row level security;

-- RLS Policies for people
-- Select: family members can see their family's people
drop policy if exists people_select on public.people;
create policy people_select on public.people
  for select
  using (public.is_family_member(family_id));

-- Insert: family members can add people to their family
drop policy if exists people_insert on public.people;
create policy people_insert on public.people
  for insert
  with check (public.is_family_member(family_id));

-- Update: family members can update their family's people
drop policy if exists people_update on public.people;
create policy people_update on public.people
  for update
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- Delete: family members can delete their family's people
drop policy if exists people_delete on public.people;
create policy people_delete on public.people
  for delete
  using (public.is_family_member(family_id));

-- Comments
comment on table public.people is 'People associated with families (adults, children, pets, emergency contacts)';
comment on column public.people.group_type is 'Type of person: adult, child, pet, emergency_contact';
comment on column public.people.notes is 'Optional notes about the person';


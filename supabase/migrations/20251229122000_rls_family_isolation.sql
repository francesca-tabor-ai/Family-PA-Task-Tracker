-- Helper: check membership
create or replace function public.is_family_member(family uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.user_id = auth.uid()
      and fm.family_id = family
  );
$$;

-- Enable RLS
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.tasks enable row level security;
alter table public.voice_transcriptions enable row level security;
alter table public.inbound_messages enable row level security;

-- Families policies
drop policy if exists families_select on public.families;
create policy families_select
on public.families for select
using (public.is_family_member(id));

drop policy if exists families_insert on public.families;
create policy families_insert
on public.families for insert
with check (auth.uid() is not null);

-- NOTE: You'll typically also add logic so that whoever creates a family
-- is inserted into family_members as 'owner' (either via app logic or trigger).

-- Family members policies
drop policy if exists family_members_select on public.family_members;
create policy family_members_select
on public.family_members for select
using (public.is_family_member(family_id));

-- Allow users to insert themselves only if app creates membership appropriately.
-- Common pattern: only owners/admins can manage membership.
drop policy if exists family_members_insert on public.family_members;
create policy family_members_insert
on public.family_members for insert
with check (
  public.is_family_member(family_id)
  and exists (
    select 1 from public.family_members fm
    where fm.family_id = family_id
      and fm.user_id = auth.uid()
      and fm.role in ('owner','admin')
  )
);

drop policy if exists family_members_update on public.family_members;
create policy family_members_update
on public.family_members for update
using (
  public.is_family_member(family_id)
  and exists (
    select 1 from public.family_members fm
    where fm.family_id = family_id
      and fm.user_id = auth.uid()
      and fm.role in ('owner','admin')
  )
)
with check (
  public.is_family_member(family_id)
);

drop policy if exists family_members_delete on public.family_members;
create policy family_members_delete
on public.family_members for delete
using (
  public.is_family_member(family_id)
  and exists (
    select 1 from public.family_members fm
    where fm.family_id = family_id
      and fm.user_id = auth.uid()
      and fm.role in ('owner','admin')
  )
);

-- Tasks policies
drop policy if exists tasks_select on public.tasks;
create policy tasks_select
on public.tasks for select
using (public.is_family_member(family_id));

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert
on public.tasks for insert
with check (public.is_family_member(family_id));

drop policy if exists tasks_update on public.tasks;
create policy tasks_update
on public.tasks for update
using (public.is_family_member(family_id))
with check (public.is_family_member(family_id));

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete
on public.tasks for delete
using (public.is_family_member(family_id));

-- Voice transcriptions policies
drop policy if exists voice_transcriptions_select on public.voice_transcriptions;
create policy voice_transcriptions_select
on public.voice_transcriptions for select
using (public.is_family_member(family_id));

drop policy if exists voice_transcriptions_insert on public.voice_transcriptions;
create policy voice_transcriptions_insert
on public.voice_transcriptions for insert
with check (public.is_family_member(family_id));

-- inbound_messages policies (usually server-only, but still isolate by family)
drop policy if exists inbound_messages_select on public.inbound_messages;
create policy inbound_messages_select
on public.inbound_messages for select
using (public.is_family_member(family_id));

drop policy if exists inbound_messages_insert on public.inbound_messages;
create policy inbound_messages_insert
on public.inbound_messages for insert
with check (public.is_family_member(family_id));


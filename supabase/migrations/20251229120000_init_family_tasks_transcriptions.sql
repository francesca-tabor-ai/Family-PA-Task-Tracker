-- Enable extensions (safe if already enabled)
create extension if not exists pgcrypto;
-- Optional for later semantic search:
create extension if not exists vector;

-- Families
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Membership / access control
create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_e164 text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (family_id, user_id),
  constraint family_members_role_check check (role in ('owner', 'admin', 'member'))
);

create index if not exists family_members_user_id_idx on public.family_members(user_id);
create index if not exists family_members_phone_idx on public.family_members(phone_e164);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,

  title text not null,
  category text,

  assignee_user_id uuid references auth.users(id) on delete set null,
  due_at timestamptz,

  status text not null default 'open',
  source_type text, -- e.g. 'whatsapp', 'manual', 'import'
  source_media_url text,
  confidence real,

  created_by_user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),

  constraint tasks_status_check check (status in ('open', 'in_progress', 'done', 'canceled')),
  constraint tasks_confidence_check check (confidence is null or (confidence >= 0 and confidence <= 1))
);

create index if not exists tasks_family_id_idx on public.tasks(family_id);
create index if not exists tasks_assignee_idx on public.tasks(assignee_user_id);
create index if not exists tasks_due_at_idx on public.tasks(due_at);

-- Voice transcriptions (audit + linkage to media)
create table if not exists public.voice_transcriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,

  from_phone text,
  media_url text,
  transcript text,

  raw_payload jsonb, -- store webhook payload for audit/debug
  created_at timestamptz not null default now()
);

create index if not exists voice_transcriptions_family_id_idx on public.voice_transcriptions(family_id);
create index if not exists voice_transcriptions_created_at_idx on public.voice_transcriptions(created_at);

-- Optional but strongly recommended: idempotency table for Twilio retries
create table if not exists public.inbound_messages (
  provider text not null,                -- 'twilio'
  message_sid text not null,             -- Twilio MessageSid
  family_id uuid not null references public.families(id) on delete cascade,
  from_phone text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  primary key (provider, message_sid)
);

create index if not exists inbound_messages_family_id_idx on public.inbound_messages(family_id);


-- Ensure created_by_user_id is always auth.uid() on insert for tasks
create or replace function public.enforce_created_by_user_id()
returns trigger
language plpgsql
as $$
begin
  -- If client didn't set it, set it
  if new.created_by_user_id is null then
    new.created_by_user_id := auth.uid();
  end if;

  -- If client tried to spoof, reject
  if new.created_by_user_id <> auth.uid() then
    raise exception 'created_by_user_id must equal auth.uid()';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tasks_enforce_created_by on public.tasks;
create trigger trg_tasks_enforce_created_by
before insert on public.tasks
for each row
execute function public.enforce_created_by_user_id();


-- Migration: Import categories from CSV
-- Source: family_pa_task_categories.csv
-- This migration imports category/subcategory taxonomy with default status values
-- Note: This uses the first household. In production, you may want to seed per-household

-- Helper function to generate slug from name (reuse existing)
create or replace function public.generate_slug(name text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
$$;

-- Celebrations & Gifting
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Celebrations & Gifting', public.generate_slug('Celebrations & Gifting'), null, 1, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Birthdays', public.generate_slug('Birthdays'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Anniversaries', public.generate_slug('Anniversaries'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Holidays', public.generate_slug('Holidays'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Gift ideas', public.generate_slug('Gift ideas'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Gift purchases', public.generate_slug('Gift purchases'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Concierge & Lifestyle
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Concierge & Lifestyle', public.generate_slug('Concierge & Lifestyle'), null, 2, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Restaurants', public.generate_slug('Restaurants'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Spas', public.generate_slug('Spas'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Events', public.generate_slug('Events'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Experiences', public.generate_slug('Experiences'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Preferences', public.generate_slug('Preferences'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Documents & Compliance
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Documents & Compliance', public.generate_slug('Documents & Compliance'), null, 3, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Legal documents', public.generate_slug('Legal documents'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Residency permits', public.generate_slug('Residency permits'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'School documents', public.generate_slug('School documents'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Contracts', public.generate_slug('Contracts'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Expiry & Renewals
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Expiry & Renewals', public.generate_slug('Expiry & Renewals'), null, 4, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Passports', public.generate_slug('Passports'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Visas', public.generate_slug('Visas'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Driver’s licences', public.generate_slug('Driver’s licences'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Insurance renewals', public.generate_slug('Insurance renewals'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Memberships', public.generate_slug('Memberships'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Warranties', public.generate_slug('Warranties'), v_category_id, 6, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Health & Wellness
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Health & Wellness', public.generate_slug('Health & Wellness'), null, 5, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Doctor appointments', public.generate_slug('Doctor appointments'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Dentists & specialists', public.generate_slug('Dentists & specialists'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Medications', public.generate_slug('Medications'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Vaccinations', public.generate_slug('Vaccinations'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Follow-ups', public.generate_slug('Follow-ups'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Household & Administration
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Household & Administration', public.generate_slug('Household & Administration'), null, 6, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Bills & utilities', public.generate_slug('Bills & utilities'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Subscriptions', public.generate_slug('Subscriptions'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Insurance', public.generate_slug('Insurance'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Banking coordination', public.generate_slug('Banking coordination'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Filing & records', public.generate_slug('Filing & records'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Inventory, Assets & Insurance
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Inventory, Assets & Insurance', public.generate_slug('Inventory, Assets & Insurance'), null, 7, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Household inventory', public.generate_slug('Household inventory'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'High-value items', public.generate_slug('High-value items'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Warranties', public.generate_slug('Warranties'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Insurance policies', public.generate_slug('Insurance policies'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Claims', public.generate_slug('Claims'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Orders, Returns & Refunds
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Orders, Returns & Refunds', public.generate_slug('Orders, Returns & Refunds'), null, 8, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Orders', public.generate_slug('Orders'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Deliveries', public.generate_slug('Deliveries'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Returns', public.generate_slug('Returns'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Refund tracking', public.generate_slug('Refund tracking'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- People (Family)
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'People (Family)', public.generate_slug('People (Family)'), null, 9, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Adults', public.generate_slug('Adults'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Children', public.generate_slug('Children'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Emergency contacts', public.generate_slug('Emergency contacts'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Key notes', public.generate_slug('Key notes'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Pets
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Pets', public.generate_slug('Pets'), null, 10, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Pet profiles', public.generate_slug('Pet profiles'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Vet appointments', public.generate_slug('Vet appointments'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Vaccinations', public.generate_slug('Vaccinations'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Boarding & care', public.generate_slug('Boarding & care'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- School & Children’s Activities
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'School & Children’s Activities', public.generate_slug('School & Children’s Activities'), null, 11, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'School events', public.generate_slug('School events'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Forms & permissions', public.generate_slug('Forms & permissions'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'After-school activities', public.generate_slug('After-school activities'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Tutors', public.generate_slug('Tutors'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Camps', public.generate_slug('Camps'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Childcare / nannies / au pairs', public.generate_slug('Childcare / nannies / au pairs'), v_category_id, 6, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Tasks & Commitments
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Tasks & Commitments', public.generate_slug('Tasks & Commitments'), null, 12, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Inbox', public.generate_slug('Inbox'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Pending / Waiting', public.generate_slug('Pending / Waiting'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Scheduled', public.generate_slug('Scheduled'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'In progress', public.generate_slug('In progress'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Completed', public.generate_slug('Completed'), v_category_id, 5, true, 'done')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Delegated', public.generate_slug('Delegated'), v_category_id, 6, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'High-risk', public.generate_slug('High-risk'), v_category_id, 7, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;

-- Travel & Mobility
do $$
declare
  v_household_id uuid;
  v_category_id uuid;
begin
  -- Get first household
  select id into v_household_id from public.families limit 1;
  
  -- Insert or get top-level category
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
  values (v_household_id, 'Travel & Mobility', public.generate_slug('Travel & Mobility'), null, 13, true)
  on conflict (household_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order
  returning id into v_category_id;
  
  -- Insert subcategories
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Trips', public.generate_slug('Trips'), v_category_id, 1, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Flights / trains', public.generate_slug('Flights / trains'), v_category_id, 2, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Accommodation', public.generate_slug('Accommodation'), v_category_id, 3, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Travel documents', public.generate_slug('Travel documents'), v_category_id, 4, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Transport & drivers', public.generate_slug('Transport & drivers'), v_category_id, 5, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
  insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
  values (v_household_id, 'Crew / caregivers', public.generate_slug('Crew / caregivers'), v_category_id, 6, true, 'open')
  on conflict (household_id, slug) do update
    set name = excluded.name,
        parent_id = excluded.parent_id,
        sort_order = excluded.sort_order,
        default_status = excluded.default_status;
end $$;


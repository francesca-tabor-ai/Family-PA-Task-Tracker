-- Migration: Seed Initial Categories
-- Creates the standard category hierarchy for Family PA system
-- Note: This seeds categories for a default household. Adjust household_id as needed.

-- Helper function to generate slug from name
create or replace function public.generate_slug(name text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
$$;

-- Insert top-level categories
-- Note: Replace 'YOUR_HOUSEHOLD_ID' with an actual household_id from your families table
-- Or use a subquery to get the first household: (select id from public.families limit 1)

-- For now, we'll insert with a placeholder that you'll need to replace
-- In production, you might want to seed per-household or use a service role

-- Top-level categories
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active) values
-- You'll need to replace this with actual household_id or use a subquery
-- Example: (select id from public.families where name = 'Default Family' limit 1)
((select id from public.families limit 1), 'Tasks & Commitments', 'tasks-commitments', null, 1, true),
((select id from public.families limit 1), 'Household & Administration', 'household-administration', null, 2, true),
((select id from public.families limit 1), 'People', 'people', null, 3, true),
((select id from public.families limit 1), 'Pets', 'pets', null, 4, true),
((select id from public.families limit 1), 'Expiry & Renewals', 'expiry-renewals', null, 5, true),
((select id from public.families limit 1), 'Health & Wellness', 'health-wellness', null, 6, true),
((select id from public.families limit 1), 'School & Children''s Activities', 'school-childrens-activities', null, 7, true),
((select id from public.families limit 1), 'Travel & Mobility', 'travel-mobility', null, 8, true),
((select id from public.families limit 1), 'Concierge & Lifestyle', 'concierge-lifestyle', null, 9, true),
((select id from public.families limit 1), 'Celebrations & Gifting', 'celebrations-gifting', null, 10, true),
((select id from public.families limit 1), 'Orders, Returns & Refunds', 'orders-returns-refunds', null, 11, true),
((select id from public.families limit 1), 'Inventory, Assets & Insurance', 'inventory-assets-insurance', null, 12, true),
((select id from public.families limit 1), 'Documents & Compliance', 'documents-compliance', null, 13, true)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Tasks & Commitments
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'tasks-commitments' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Follow-ups', 'follow-ups', 1),
  ('Deadlines', 'deadlines', 2),
  ('Appointments', 'appointments', 3)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Household & Administration
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'household-administration' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Bills & Utilities', 'bills-utilities', 1),
  ('Maintenance', 'maintenance', 2),
  ('Cleaning', 'cleaning', 3),
  ('Shopping', 'shopping', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for People
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'people' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Care & Support', 'care-support', 1),
  ('Activities', 'activities', 2),
  ('Communication', 'communication', 3)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Pets
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'pets' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Veterinary', 'veterinary', 1),
  ('Grooming', 'grooming', 2),
  ('Food & Supplies', 'food-supplies', 3),
  ('Exercise & Activities', 'exercise-activities', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Expiry & Renewals
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'expiry-renewals' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Passports', 'passports', 1),
  ('Licenses', 'licenses', 2),
  ('Insurance', 'insurance', 3),
  ('Subscriptions', 'subscriptions', 4),
  ('Memberships', 'memberships', 5)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Health & Wellness
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'health-wellness' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Dentists & Specialists', 'dentists-specialists', 1),
  ('General Practitioners', 'general-practitioners', 2),
  ('Appointments', 'appointments', 3),
  ('Medications', 'medications', 4),
  ('Fitness & Exercise', 'fitness-exercise', 5)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for School & Children's Activities
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'school-childrens-activities' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('School Events', 'school-events', 1),
  ('Homework & Assignments', 'homework-assignments', 2),
  ('Extracurricular', 'extracurricular', 3),
  ('Parent-Teacher', 'parent-teacher', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Travel & Mobility
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'travel-mobility' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Flights', 'flights', 1),
  ('Accommodation', 'accommodation', 2),
  ('Transportation', 'transportation', 3),
  ('Planning', 'planning', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Concierge & Lifestyle
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'concierge-lifestyle' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Personal Services', 'personal-services', 1),
  ('Dining & Reservations', 'dining-reservations', 2),
  ('Events & Entertainment', 'events-entertainment', 3)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Celebrations & Gifting
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'celebrations-gifting' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Birthdays', 'birthdays', 1),
  ('Holidays', 'holidays', 2),
  ('Gifts & Cards', 'gifts-cards', 3),
  ('Planning', 'planning', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Orders, Returns & Refunds
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'orders-returns-refunds' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Online Orders', 'online-orders', 1),
  ('Returns', 'returns', 2),
  ('Refunds', 'refunds', 3),
  ('Tracking', 'tracking', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Inventory, Assets & Insurance
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'inventory-assets-insurance' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Home Inventory', 'home-inventory', 1),
  ('Valuables', 'valuables', 2),
  ('Insurance Claims', 'insurance-claims', 3),
  ('Maintenance Records', 'maintenance-records', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;

-- Sub-categories for Documents & Compliance
insert into public.categories (household_id, name, slug, parent_id, sort_order, is_active)
select 
  (select id from public.families limit 1),
  name,
  slug,
  (select id from public.categories where slug = 'documents-compliance' and household_id = (select id from public.families limit 1) limit 1),
  sort_order,
  true
from (values
  ('Legal Documents', 'legal-documents', 1),
  ('Tax & Financial', 'tax-financial', 2),
  ('Certificates & Licenses', 'certificates-licenses', 3),
  ('Filing & Organization', 'filing-organization', 4)
) as subcats(name, slug, sort_order)
on conflict (household_id, slug) do nothing;


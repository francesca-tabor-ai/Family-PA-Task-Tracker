-- Migration: Seed Initial Category Taxonomy
-- Inserts the standard top-level categories and common subcategories

-- Top-level categories (system-wide, family_id is null)
insert into public.categories (family_id, path, parent_path, level, is_active) values
-- Tasks & Commitments
(null, 'Tasks & Commitments', null, 1, true),
(null, 'Tasks & Commitments > Follow-ups', 'Tasks & Commitments', 2, true),
(null, 'Tasks & Commitments > Deadlines', 'Tasks & Commitments', 2, true),
(null, 'Tasks & Commitments > Appointments', 'Tasks & Commitments', 2, true),

-- Household & Administration
(null, 'Household & Administration', null, 1, true),
(null, 'Household & Administration > Bills & Utilities', 'Household & Administration', 2, true),
(null, 'Household & Administration > Maintenance', 'Household & Administration', 2, true),
(null, 'Household & Administration > Cleaning', 'Household & Administration', 2, true),
(null, 'Household & Administration > Shopping', 'Household & Administration', 2, true),

-- People (Family)
(null, 'People (Family)', null, 1, true),
(null, 'People (Family) > Care & Support', 'People (Family)', 2, true),
(null, 'People (Family) > Activities', 'People (Family)', 2, true),
(null, 'People (Family) > Communication', 'People (Family)', 2, true),

-- Pets
(null, 'Pets', null, 1, true),
(null, 'Pets > Veterinary', 'Pets', 2, true),
(null, 'Pets > Grooming', 'Pets', 2, true),
(null, 'Pets > Food & Supplies', 'Pets', 2, true),
(null, 'Pets > Exercise & Activities', 'Pets', 2, true),

-- Expiry & Renewals
(null, 'Expiry & Renewals', null, 1, true),
(null, 'Expiry & Renewals > Passports', 'Expiry & Renewals', 2, true),
(null, 'Expiry & Renewals > Licenses', 'Expiry & Renewals', 2, true),
(null, 'Expiry & Renewals > Insurance', 'Expiry & Renewals', 2, true),
(null, 'Expiry & Renewals > Subscriptions', 'Expiry & Renewals', 2, true),
(null, 'Expiry & Renewals > Memberships', 'Expiry & Renewals', 2, true),

-- Health & Wellness
(null, 'Health & Wellness', null, 1, true),
(null, 'Health & Wellness > Dentists & specialists', 'Health & Wellness', 2, true),
(null, 'Health & Wellness > General Practitioners', 'Health & Wellness', 2, true),
(null, 'Health & Wellness > Appointments', 'Health & Wellness', 2, true),
(null, 'Health & Wellness > Medications', 'Health & Wellness', 2, true),
(null, 'Health & Wellness > Fitness & Exercise', 'Health & Wellness', 2, true),

-- School & Children's Activities
(null, 'School & Children''s Activities', null, 1, true),
(null, 'School & Children''s Activities > School Events', 'School & Children''s Activities', 2, true),
(null, 'School & Children''s Activities > Homework & Assignments', 'School & Children''s Activities', 2, true),
(null, 'School & Children''s Activities > Extracurricular', 'School & Children''s Activities', 2, true),
(null, 'School & Children''s Activities > Parent-Teacher', 'School & Children''s Activities', 2, true),

-- Travel & Mobility
(null, 'Travel & Mobility', null, 1, true),
(null, 'Travel & Mobility > Flights', 'Travel & Mobility', 2, true),
(null, 'Travel & Mobility > Accommodation', 'Travel & Mobility', 2, true),
(null, 'Travel & Mobility > Transportation', 'Travel & Mobility', 2, true),
(null, 'Travel & Mobility > Planning', 'Travel & Mobility', 2, true),

-- Concierge & Lifestyle
(null, 'Concierge & Lifestyle', null, 1, true),
(null, 'Concierge & Lifestyle > Personal Services', 'Concierge & Lifestyle', 2, true),
(null, 'Concierge & Lifestyle > Dining & Reservations', 'Concierge & Lifestyle', 2, true),
(null, 'Concierge & Lifestyle > Events & Entertainment', 'Concierge & Lifestyle', 2, true),

-- Celebrations & Gifting
(null, 'Celebrations & Gifting', null, 1, true),
(null, 'Celebrations & Gifting > Birthdays', 'Celebrations & Gifting', 2, true),
(null, 'Celebrations & Gifting > Holidays', 'Celebrations & Gifting', 2, true),
(null, 'Celebrations & Gifting > Gifts & Cards', 'Celebrations & Gifting', 2, true),
(null, 'Celebrations & Gifting > Planning', 'Celebrations & Gifting', 2, true),

-- Orders, Returns & Refunds
(null, 'Orders, Returns & Refunds', null, 1, true),
(null, 'Orders, Returns & Refunds > Online Orders', 'Orders, Returns & Refunds', 2, true),
(null, 'Orders, Returns & Refunds > Returns', 'Orders, Returns & Refunds', 2, true),
(null, 'Orders, Returns & Refunds > Refunds', 'Orders, Returns & Refunds', 2, true),
(null, 'Orders, Returns & Refunds > Tracking', 'Orders, Returns & Refunds', 2, true),

-- Inventory, Assets & Insurance
(null, 'Inventory, Assets & Insurance', null, 1, true),
(null, 'Inventory, Assets & Insurance > Home Inventory', 'Inventory, Assets & Insurance', 2, true),
(null, 'Inventory, Assets & Insurance > Valuables', 'Inventory, Assets & Insurance', 2, true),
(null, 'Inventory, Assets & Insurance > Insurance Claims', 'Inventory, Assets & Insurance', 2, true),
(null, 'Inventory, Assets & Insurance > Maintenance Records', 'Inventory, Assets & Insurance', 2, true),

-- Documents & Compliance
(null, 'Documents & Compliance', null, 1, true),
(null, 'Documents & Compliance > Legal Documents', 'Documents & Compliance', 2, true),
(null, 'Documents & Compliance > Tax & Financial', 'Documents & Compliance', 2, true),
(null, 'Documents & Compliance > Certificates & Licenses', 'Documents & Compliance', 2, true),
(null, 'Documents & Compliance > Filing & Organization', 'Documents & Compliance', 2, true),

-- Communication & Capture
(null, 'Communication & Capture', null, 1, true),
(null, 'Communication & Capture > Calls & Messages', 'Communication & Capture', 2, true),
(null, 'Communication & Capture > Voice Notes', 'Communication & Capture', 2, true),
(null, 'Communication & Capture > Follow-ups', 'Communication & Capture', 2, true),

-- Risk & Confirmation
(null, 'Risk & Confirmation', null, 1, true),
(null, 'Risk & Confirmation > High Priority', 'Risk & Confirmation', 2, true),
(null, 'Risk & Confirmation > Confirmations Needed', 'Risk & Confirmation', 2, true),
(null, 'Risk & Confirmation > Time-Sensitive', 'Risk & Confirmation', 2, true)
on conflict (path) do nothing; -- Don't overwrite if categories already exist


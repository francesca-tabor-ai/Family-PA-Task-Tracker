# Category Dropdown Debugging Guide

## Problem
Category dropdown is empty on the main page (`/`) even though categories should be seeded from CSV.

## Root Cause Analysis

### 1. Data Flow
```
UI Component (AddTaskForm)
  ↓
Server Component (app/(authed)/page.tsx)
  ↓
fetchCategoryTree() → fetchCategories()
  ↓
Supabase Query: SELECT * FROM categories WHERE household_id = ? AND is_active = true
  ↓
RLS Policy: is_family_member(household_id)
```

### 2. Common Issues

#### Issue A: Migrations Not Applied
**Symptom:** No categories in database at all
**Check:**
```sql
SELECT COUNT(*) FROM categories;
```
**Fix:**
```bash
supabase db push
# or
supabase migration up
```

#### Issue B: Categories Seeded for Wrong Family
**Symptom:** Categories exist but user can't see them
**Root Cause:** Migration seeds to `(select id from public.families limit 1)` - the FIRST family
**Check:**
```sql
-- See which family has categories
SELECT household_id, COUNT(*) 
FROM categories 
GROUP BY household_id;

-- See which family the user belongs to
SELECT family_id FROM family_members WHERE user_id = '<user-id>';
```
**Fix:** Re-seed categories for the user's family, or seed for all families

#### Issue C: User Not a Family Member
**Symptom:** RLS blocks access even if categories exist
**Check:**
```sql
SELECT * FROM family_members WHERE user_id = '<user-id>';
```
**Fix:** Create a family and add user as a member

#### Issue D: RLS Policy Issue
**Symptom:** Categories exist, user is family member, but still can't see them
**Check:**
```sql
-- Test RLS policy
SELECT * FROM categories 
WHERE household_id = '<family-id>' 
  AND is_active = true;
```
**Fix:** Verify `is_family_member()` function works correctly

## Diagnostic Tools

### 1. API Endpoint: `/api/debug/categories`
Returns detailed diagnostic information:
- User authentication status
- Family membership
- Category counts (for user's family and all families)
- Sample data
- Error messages

**Usage:**
```bash
curl https://your-app.vercel.app/api/debug/categories \
  -H "Cookie: sb-access-token=..."
```

### 2. Script: `scripts/verify-categories.ts`
Runs database diagnostics using service role key (bypasses RLS).

**Usage:**
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="..."
export SUPABASE_SERVICE_ROLE_KEY="..."

# Run script
npx tsx scripts/verify-categories.ts
```

## Step-by-Step Fix

### Step 1: Verify Database State
```bash
# Check if migrations are applied
supabase migration list

# Check if categories exist
supabase db query "SELECT COUNT(*) FROM categories;"
```

### Step 2: Check User's Family
```bash
# Get user's family_id
supabase db query "
  SELECT fm.family_id, f.name 
  FROM family_members fm
  JOIN families f ON f.id = fm.family_id
  WHERE fm.user_id = '<user-id>';
"
```

### Step 3: Check Categories for User's Family
```bash
supabase db query "
  SELECT COUNT(*) 
  FROM categories 
  WHERE household_id = '<family-id>' 
    AND is_active = true;
"
```

### Step 4: Re-seed Categories (if needed)
If categories don't exist for the user's family:

**Option A: Update migration to seed for all families**
```sql
-- In migration, loop through all families
DO $$
DECLARE
  family_rec RECORD;
BEGIN
  FOR family_rec IN SELECT id FROM public.families
  LOOP
    -- Insert categories for this family
    INSERT INTO public.categories (household_id, name, slug, ...)
    VALUES (family_rec.id, 'Category Name', 'slug', ...)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
```

**Option B: Manual seed for specific family**
```sql
-- Replace <FAMILY_ID> with actual family ID
DO $$
DECLARE
  v_household_id uuid := '<FAMILY_ID>';
  -- ... rest of migration logic
```

**Option C: Use service role to seed (bypasses RLS)**
Create a one-time script that uses service role key to seed categories for all families.

### Step 5: Verify RLS Policies
```sql
-- Check if is_family_member function exists
SELECT proname FROM pg_proc WHERE proname = 'is_family_member';

-- Test RLS policy
SET ROLE authenticated;
SELECT * FROM categories WHERE household_id = '<family-id>';
```

## Quick Fixes

### Fix 1: Ensure User Has Family
```sql
-- Create a family if none exists
INSERT INTO families (name) VALUES ('Default Family') RETURNING id;

-- Add user to family
INSERT INTO family_members (family_id, user_id, role)
VALUES ('<family-id>', '<user-id>', 'owner');
```

### Fix 2: Seed Categories for User's Family
```sql
-- Get user's family_id
WITH user_family AS (
  SELECT family_id FROM family_members WHERE user_id = '<user-id>' LIMIT 1
)
-- Copy categories from first family to user's family
INSERT INTO categories (household_id, name, slug, parent_id, sort_order, is_active, default_status)
SELECT 
  (SELECT family_id FROM user_family),
  name,
  slug,
  parent_id,
  sort_order,
  is_active,
  default_status
FROM categories
WHERE household_id = (SELECT id FROM families LIMIT 1)
ON CONFLICT (household_id, slug) DO NOTHING;
```

## Testing Checklist

- [ ] Migrations applied: `supabase migration list`
- [ ] Categories table exists: `SELECT COUNT(*) FROM categories;`
- [ ] User has family: `SELECT * FROM family_members WHERE user_id = '<user-id>';`
- [ ] Categories exist for user's family: Check via `/api/debug/categories`
- [ ] RLS policies work: Test query as authenticated user
- [ ] UI shows categories: Visit `/` and expand "More options"

## Expected Behavior

1. User logs in
2. Server fetches user's `family_id` from `family_members`
3. Server queries `categories` WHERE `household_id = family_id` AND `is_active = true`
4. RLS policy `is_family_member(household_id)` allows access
5. Categories are returned and displayed in dropdown

## Related Files

- `lib/supabase/queries/categories.ts` - Category query functions
- `app/(authed)/page.tsx` - Server component that fetches categories
- `components/AddTaskForm.tsx` - UI component with dropdown
- `supabase/migrations/20250102020000_import_csv_categories.sql` - Seed migration
- `supabase/migrations/20250101030000_create_categories_table.sql` - Table + RLS


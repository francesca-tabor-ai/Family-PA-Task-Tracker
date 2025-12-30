# Category Query Examples

## Fetch Categories with Children (Hierarchical)

### Option 1: Fetch all categories and build hierarchy in application
```sql
-- Fetch all categories for a household, ordered by parent and sort_order
SELECT 
  id,
  household_id,
  name,
  slug,
  parent_id,
  sort_order,
  is_active,
  created_at,
  updated_at
FROM public.categories
WHERE household_id = $1
  AND is_active = true
ORDER BY 
  COALESCE(parent_id, id),  -- Group by parent (nulls first for top-level)
  sort_order,
  name;
```

### Option 2: Recursive CTE to get full hierarchy
```sql
WITH RECURSIVE category_tree AS (
  -- Base case: top-level categories
  SELECT 
    id,
    household_id,
    name,
    slug,
    parent_id,
    sort_order,
    is_active,
    0 as level,
    ARRAY[id] as path
  FROM public.categories
  WHERE household_id = $1
    AND parent_id IS NULL
    AND is_active = true
  
  UNION ALL
  
  -- Recursive case: children
  SELECT 
    c.id,
    c.household_id,
    c.name,
    c.slug,
    c.parent_id,
    c.sort_order,
    c.is_active,
    ct.level + 1,
    ct.path || c.id
  FROM public.categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
  WHERE c.household_id = $1
    AND c.is_active = true
    AND NOT (c.id = ANY(ct.path))  -- Prevent cycles
)
SELECT * FROM category_tree
ORDER BY path, sort_order;
```

### Option 3: Fetch with parent name (flat structure with parent info)
```sql
SELECT 
  c.id,
  c.household_id,
  c.name,
  c.slug,
  c.parent_id,
  p.name as parent_name,
  p.slug as parent_slug,
  c.sort_order,
  c.is_active,
  c.created_at,
  c.updated_at
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id
WHERE c.household_id = $1
  AND c.is_active = true
ORDER BY 
  COALESCE(c.parent_id, c.id),
  c.sort_order,
  c.name;
```

## Fetch Top-Level Categories Only
```sql
SELECT 
  id,
  household_id,
  name,
  slug,
  sort_order,
  is_active
FROM public.categories
WHERE household_id = $1
  AND parent_id IS NULL
  AND is_active = true
ORDER BY sort_order, name;
```

## Fetch Children of a Specific Category
```sql
SELECT 
  id,
  household_id,
  name,
  slug,
  parent_id,
  sort_order,
  is_active
FROM public.categories
WHERE household_id = $1
  AND parent_id = $2  -- Parent category ID
  AND is_active = true
ORDER BY sort_order, name;
```

## Fetch Category by Slug
```sql
SELECT 
  id,
  household_id,
  name,
  slug,
  parent_id,
  sort_order,
  is_active,
  created_at,
  updated_at
FROM public.categories
WHERE household_id = $1
  AND slug = $2
  AND is_active = true;
```

## Count Categories by Level
```sql
SELECT 
  CASE 
    WHEN parent_id IS NULL THEN 'Top Level'
    ELSE 'Subcategory'
  END as level,
  COUNT(*) as count
FROM public.categories
WHERE household_id = $1
  AND is_active = true
GROUP BY 
  CASE 
    WHEN parent_id IS NULL THEN 'Top Level'
    ELSE 'Subcategory'
  END;
```

## Get Full Category Path (e.g., "Health & Wellness > Dentists & Specialists")
```sql
WITH RECURSIVE category_path AS (
  -- Start with the category
  SELECT 
    id,
    name,
    parent_id,
    name as full_path
  FROM public.categories
  WHERE id = $1  -- Category ID
  
  UNION ALL
  
  -- Walk up to parent
  SELECT 
    c.id,
    c.name,
    c.parent_id,
    c.name || ' > ' || cp.full_path
  FROM public.categories c
  INNER JOIN category_path cp ON c.id = cp.parent_id
)
SELECT full_path 
FROM category_path 
WHERE parent_id IS NULL;
```


import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { transformCategoryRowToCategory } from '@/lib/utils/category-transform'
import type { CategoryRow } from '@/lib/utils/category-transform'
import { isValidCategoryPath } from '@/lib/types/category'

// GET /api/categories - Fetch all categories (system-wide + family-specific)
export async function GET() {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's family_id
  const { data: familyMember, error: familyError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', session.user.id)
    .limit(1)
    .single()

  if (familyError || !familyMember) {
    return NextResponse.json(
      { error: 'User is not a member of any family' },
      { status: 400 }
    )
  }

  // Fetch categories: system-wide (family_id is null) + family-specific
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .or(`family_id.is.null,family_id.eq.${familyMember.family_id}`)
    .eq('is_active', true)
    .order('path', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform database rows to API format
  const transformedCategories = (categories || []).map((row: CategoryRow) => 
    transformCategoryRowToCategory(row)
  )

  return NextResponse.json(transformedCategories)
}

// POST /api/categories - Create new category (family-specific only)
export async function POST(request: Request) {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's family_id
  const { data: familyMember, error: familyError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', session.user.id)
    .limit(1)
    .single()

  if (familyError || !familyMember) {
    return NextResponse.json(
      { error: 'User is not a member of any family' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { path, parent_path } = body

  // Validate required fields
  if (!path || typeof path !== 'string' || path.trim().length === 0) {
    return NextResponse.json(
      { error: 'Path is required' },
      { status: 400 }
    )
  }

  // Validate path format
  if (!isValidCategoryPath(path)) {
    return NextResponse.json(
      { error: 'Invalid category path format. Use format: "Category" or "Category > Subcategory"' },
      { status: 400 }
    )
  }

  // Calculate level from path
  const level = path.split(' > ').length

  // Validate parent_path if provided
  if (parent_path !== null && parent_path !== undefined) {
    if (!isValidCategoryPath(parent_path)) {
      return NextResponse.json(
        { error: 'Invalid parent path format' },
        { status: 400 }
      )
    }
    // Ensure parent_path is actually a parent of path
    if (!path.startsWith(parent_path + ' > ')) {
      return NextResponse.json(
        { error: 'Parent path must be a valid parent of the category path' },
        { status: 400 }
      )
    }
  }

  // Create category (family-specific)
  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      family_id: familyMember.family_id,
      path: path.trim(),
      parent_path: parent_path?.trim() || null,
      level,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Category with this path already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to API format
  const transformedCategory = transformCategoryRowToCategory(category as CategoryRow)

  return NextResponse.json(transformedCategory, { status: 201 })
}


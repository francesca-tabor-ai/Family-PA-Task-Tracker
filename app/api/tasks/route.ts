import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/tasks - Fetch all tasks (filtered by RLS)
export async function GET() {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch tasks - RLS will automatically filter by family_id
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(tasks || [])
}

// POST /api/tasks - Create new task
export async function POST(request: Request) {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's family_id (required for tasks)
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
  const { title, category_id, subcategory_id, description, assignee_user_id, due_at } = body

  // Validate required fields
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    )
  }

  // Validate category_id (required for manual task creation)
  if (!category_id || typeof category_id !== 'string') {
    return NextResponse.json(
      { error: 'Category is required' },
      { status: 400 }
    )
  }

  // Verify category exists and belongs to the family
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, household_id, default_status')
    .eq('id', category_id)
    .eq('is_active', true)
    .single()

  if (categoryError || !category) {
    return NextResponse.json(
      { error: 'Invalid category' },
      { status: 400 }
    )
  }

  // Verify category belongs to the family
  if (category.household_id !== familyMember.family_id) {
    return NextResponse.json(
      { error: 'Category does not belong to your family' },
      { status: 403 }
    )
  }

  // Determine final category_id: if subcategory is selected, use subcategory_id; otherwise use category_id
  let finalCategoryId = category_id;
  let defaultStatus = 'open'; // Default fallback

  // If subcategory_id is provided, verify it exists and is a child of the category
  if (subcategory_id) {
    const { data: subcategory, error: subcategoryError } = await supabase
      .from('categories')
      .select('id, parent_id, household_id, default_status')
      .eq('id', subcategory_id)
      .eq('is_active', true)
      .single()

    if (subcategoryError || !subcategory) {
      return NextResponse.json(
        { error: 'Invalid subcategory' },
        { status: 400 }
      )
    }

    if (subcategory.parent_id !== category_id) {
      return NextResponse.json(
        { error: 'Subcategory does not belong to the selected category' },
        { status: 400 }
      )
    }

    if (subcategory.household_id !== familyMember.family_id) {
      return NextResponse.json(
        { error: 'Subcategory does not belong to your family' },
        { status: 403 }
      )
    }

    // Use subcategory's ID as the category_id (since subcategories are also categories)
    // TODO: Add subcategory_id field to tasks table for proper parent/subcategory tracking
    finalCategoryId = subcategory_id;
    
    // Use subcategory's default_status if available
    if (subcategory.default_status) {
      defaultStatus = subcategory.default_status;
    }
  } else {
    // If no subcategory, check the category's default_status
    if (category.default_status) {
      defaultStatus = category.default_status;
    }
  }

  // Create task
  // Note: created_by_user_id is enforced by trigger, family_id is required
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      family_id: familyMember.family_id,
      title: title.trim(),
      description: description?.trim() || null,
      category_id: finalCategoryId,
      category: null, // Legacy field - keep null
      assignee_user_id: assignee_user_id || null,
      due_at: due_at || null,
      status: defaultStatus, // Use default_status from category/subcategory
      source_type: 'manual', // Manual creation via UI
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(task, { status: 201 })
}


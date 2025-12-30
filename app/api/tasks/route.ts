import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { transformTaskRowToTask } from '@/lib/utils/task-transform'
import type { TaskRow } from '@/lib/utils/task-transform'

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

  // Transform database rows to API format
  const transformedTasks = (tasks || []).map((row: TaskRow) => transformTaskRowToTask(row))

  return NextResponse.json(transformedTasks)
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
  const { 
    title, 
    description,
    status = 'inbox',
    categories = [],
    people = [],
    dueDate,
    scheduledFor,
    highRisk = false,
    assignee_user_id,
  } = body

  // Validate required fields
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    )
  }

  // Validate status
  const validStatuses = ['inbox', 'waiting', 'scheduled', 'in_progress', 'completed', 'delegated']
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate categories (must be array of strings with valid paths)
  if (categories && !Array.isArray(categories)) {
    return NextResponse.json(
      { error: 'Categories must be an array' },
      { status: 400 }
    )
  }

  if (categories && categories.length > 0) {
    // Validate each category path exists in the categories table
    const { data: validCategories, error: categoryError } = await supabase
      .from('categories')
      .select('path')
      .or(`family_id.is.null,family_id.eq.${familyMember.family_id}`)
      .eq('is_active', true)
      .in('path', categories)

    if (categoryError) {
      return NextResponse.json(
        { error: 'Failed to validate categories' },
        { status: 500 }
      )
    }

    const validPaths = (validCategories || []).map(c => c.path)
    const invalidPaths = categories.filter((path: string) => !validPaths.includes(path))

    if (invalidPaths.length > 0) {
      return NextResponse.json(
        { error: `Invalid category paths: ${invalidPaths.join(', ')}` },
        { status: 400 }
      )
    }
  }

  // Create task
  // Note: created_by_user_id is enforced by trigger, family_id is required
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      family_id: familyMember.family_id,
      title: title.trim(),
      description: description || null,
      status,
      categories: categories || [],
      people: people || [],
      due_at: dueDate || null,
      scheduled_for: scheduledFor || null,
      high_risk: highRisk || false,
      source: 'manual', // Manual creation via UI
      assignee_user_id: assignee_user_id || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to API format
  const transformedTask = transformTaskRowToTask(task as TaskRow)

  return NextResponse.json(transformedTask, { status: 201 })
}


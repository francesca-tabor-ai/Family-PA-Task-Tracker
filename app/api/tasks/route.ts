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
  const { title, category, assignee_user_id, due_at } = body

  // Validate required fields
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    )
  }

  // Create task
  // Note: created_by_user_id is enforced by trigger, family_id is required
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      family_id: familyMember.family_id,
      title: title.trim(),
      category: category || null,
      assignee_user_id: assignee_user_id || null,
      due_at: due_at || null,
      status: 'open', // Default status
      source_type: 'manual', // Manual creation via UI
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(task, { status: 201 })
}


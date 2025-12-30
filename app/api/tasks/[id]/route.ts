import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Force dynamic rendering - this route requires authentication and runtime data
export const dynamic = 'force-dynamic'

// PATCH /api/tasks/[id] - Update task (primarily status)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status, title, category, assignee_user_id, due_at } = body

  // Validate status if provided
  if (status && !['open', 'in_progress', 'done', 'canceled'].includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be one of: open, in_progress, done, canceled' },
      { status: 400 }
    )
  }

  // Build update object
  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (title !== undefined) updates.title = title.trim()
  if (category !== undefined) updates.category = category || null
  if (assignee_user_id !== undefined) updates.assignee_user_id = assignee_user_id || null
  if (due_at !== undefined) updates.due_at = due_at || null

  // Update task - RLS will ensure user can only update their family's tasks
  const { data: task, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json(task)
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete task - RLS will ensure user can only delete their family's tasks
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}


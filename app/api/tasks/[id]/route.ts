import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { transformTaskRowToTask } from '@/lib/utils/task-transform'
import type { TaskRow } from '@/lib/utils/task-transform'

// PATCH /api/tasks/[id] - Update task
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
  const { 
    status, 
    title, 
    description,
    categories,
    people,
    dueDate,
    scheduledFor,
    highRisk,
    assignee_user_id,
  } = body

  // Validate status if provided
  const validStatuses = ['inbox', 'waiting', 'scheduled', 'in_progress', 'completed', 'delegated']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate categories if provided
  if (categories !== undefined) {
    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Categories must be an array' },
        { status: 400 }
      )
    }

    if (categories.length > 0) {
      // Get user's family_id for category validation
      const { data: { session: sessionForValidation } } = await supabase.auth.getSession()
      if (!sessionForValidation) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: familyMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', sessionForValidation.user.id)
        .limit(1)
        .single()

      if (familyMember) {
        // Validate each category path exists
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
    }
  }

  // Build update object (snake_case for database)
  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (title !== undefined) updates.title = title.trim()
  if (description !== undefined) updates.description = description || null
  if (categories !== undefined) updates.categories = categories || []
  if (people !== undefined) updates.people = people || []
  if (dueDate !== undefined) updates.due_at = dueDate || null
  if (scheduledFor !== undefined) updates.scheduled_for = scheduledFor || null
  if (highRisk !== undefined) updates.high_risk = highRisk
  if (assignee_user_id !== undefined) updates.assignee_user_id = assignee_user_id || null

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

  // Transform to API format
  const transformedTask = transformTaskRowToTask(task as TaskRow)

  return NextResponse.json(transformedTask)
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


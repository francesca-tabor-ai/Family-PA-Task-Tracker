// Server-side task queries
import { createClient } from '@/lib/supabase/server'

export interface Task {
  id: string
  family_id: string
  title: string
  description: string | null
  category: string | null
  category_id: string | null
  assignee_user_id: string | null
  due_at: string | null
  status: string
  source_type: string | null
  source_media_url: string | null
  confidence: number | null
  created_by_user_id: string
  created_at: string
}

/**
 * Fetch all tasks for the current user's family
 */
export async function fetchTasks(familyId?: string) {
  const supabase = createClient()

  // Get user's family_id if not provided
  if (!familyId) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return []
    }

    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', session.user.id)
      .limit(1)
      .single()

    if (!familyMember) {
      return []
    }

    familyId = familyMember.family_id
  }

  // Fetch all tasks for the family
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return (tasks || []) as Task[]
}

/**
 * Fetch tasks by category_id
 */
export async function fetchTasksByCategory(categoryId: string | null, familyId?: string) {
  const tasks = await fetchTasks(familyId)
  
  if (categoryId === null) {
    // Return uncategorised tasks (category_id IS NULL)
    return tasks.filter(task => task.category_id === null)
  }
  
  // Return tasks with matching category_id
  return tasks.filter(task => task.category_id === categoryId)
}

/**
 * Group tasks by status
 * Maps current status values to dashboard groups
 */
export function groupTasksByStatus(tasks: Task[]) {
  const grouped = {
    inbox: [] as Task[],
    pending: [] as Task[],
    scheduled: [] as Task[],
    completed: [] as Task[],
    other: [] as Task[],
  }

  tasks.forEach(task => {
    const status = task.status.toLowerCase()
    
    // Inbox: 'open' or 'inbox'
    if (status === 'open' || status === 'inbox') {
      grouped.inbox.push(task)
    }
    // Pending: 'waiting', 'delegated'
    else if (status === 'waiting' || status === 'delegated') {
      grouped.pending.push(task)
    }
    // Scheduled: 'scheduled'
    else if (status === 'scheduled') {
      grouped.scheduled.push(task)
    }
    // Completed: 'done', 'completed'
    else if (status === 'done' || status === 'completed') {
      grouped.completed.push(task)
    }
    // Other statuses (in_progress, canceled, etc.)
    else {
      grouped.other.push(task)
    }
  })

  return grouped
}

/**
 * Get task counts by status
 */
export function getTaskCountsByStatus(tasks: Task[]) {
  const grouped = groupTasksByStatus(tasks)
  return {
    inbox: grouped.inbox.length,
    pending: grouped.pending.length,
    scheduled: grouped.scheduled.length,
    completed: grouped.completed.length,
    total: tasks.length,
  }
}


// Utility functions to transform between database format and API format
import { Task, TaskStatus, TaskSource, mapLegacyStatus, mapLegacySource } from '@/lib/types/task'

// Database row format (snake_case)
export interface TaskRow {
  id: string
  family_id: string
  title: string
  description?: string | null
  status: string
  categories?: string[] | null
  people?: string[] | null
  due_at?: string | null
  scheduled_for?: string | null
  high_risk?: boolean | null
  source?: string | null
  source_type?: string | null  // Legacy field
  created_at: string
  updated_at?: string | null
  category?: string | null  // Legacy field
  assignee_user_id?: string | null
  created_by_user_id?: string
  source_media_url?: string | null
  confidence?: number | null
}

// Transform database row to API format (camelCase)
export function transformTaskRowToTask(row: TaskRow): Task {
  // Map legacy status if needed
  const status = mapLegacyStatus(row.status) as TaskStatus
  
  // Map legacy source if needed
  const source = row.source 
    ? (row.source as TaskSource)
    : mapLegacySource(row.source_type)

  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    status,
    categories: row.categories || [],
    people: row.people || [],
    dueDate: row.due_at || null,
    scheduledFor: row.scheduled_for || null,
    highRisk: row.high_risk || false,
    source,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    
    // Legacy fields for compatibility
    family_id: row.family_id,
    assignee_user_id: row.assignee_user_id,
    created_by_user_id: row.created_by_user_id,
    source_media_url: row.source_media_url,
    confidence: row.confidence,
  }
}

// Transform API format to database format (snake_case)
export function transformTaskToRow(task: Partial<Task>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {}

  if (task.id !== undefined) row.id = task.id
  if (task.title !== undefined) row.title = task.title
  if (task.description !== undefined) row.description = task.description || null
  if (task.status !== undefined) row.status = task.status
  if (task.categories !== undefined) row.categories = task.categories || []
  if (task.people !== undefined) row.people = task.people || []
  if (task.dueDate !== undefined) row.due_at = task.dueDate || null
  if (task.scheduledFor !== undefined) row.scheduled_for = task.scheduledFor || null
  if (task.highRisk !== undefined) row.high_risk = task.highRisk
  if (task.source !== undefined) row.source = task.source
  if (task.family_id !== undefined) row.family_id = task.family_id
  if (task.assignee_user_id !== undefined) row.assignee_user_id = task.assignee_user_id
  if (task.created_by_user_id !== undefined) row.created_by_user_id = task.created_by_user_id
  if (task.source_media_url !== undefined) row.source_media_url = task.source_media_url
  if (task.confidence !== undefined) row.confidence = task.confidence

  return row
}


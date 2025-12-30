// Utility functions to transform between database format and API format for Categories
import { Category } from '@/lib/types/category'

// Database row format (snake_case)
export interface CategoryRow {
  id: string
  family_id: string | null
  path: string
  parent_path: string | null
  level: number
  is_active: boolean
  created_at: string
  updated_at?: string | null
}

// Transform database row to API format (camelCase)
export function transformCategoryRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    family_id: row.family_id,
    path: row.path,
    parent_path: row.parent_path,
    level: row.level,
    is_active: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}

// Transform API format to database format (snake_case)
export function transformCategoryToRow(category: Partial<Category>): Partial<CategoryRow> {
  const row: Partial<CategoryRow> = {}

  if (category.id !== undefined) row.id = category.id
  if (category.family_id !== undefined) row.family_id = category.family_id
  if (category.path !== undefined) row.path = category.path
  if (category.parent_path !== undefined) row.parent_path = category.parent_path
  if (category.level !== undefined) row.level = category.level
  if (category.is_active !== undefined) row.is_active = category.is_active
  if (category.createdAt !== undefined) row.created_at = category.createdAt
  if (category.updatedAt !== undefined) row.updated_at = category.updatedAt

  return row
}


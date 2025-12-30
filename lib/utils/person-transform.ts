// Utility functions to transform between database format and API format for People
import { Person, PersonGroup } from '@/lib/types/person'

// Database row format (snake_case)
export interface PersonRow {
  id: string
  family_id: string
  name: string
  group_type: string
  notes?: string | null
  created_at: string
  updated_at?: string | null
}

// Transform database row to API format (camelCase)
export function transformPersonRowToPerson(row: PersonRow): Person {
  return {
    id: row.id,
    family_id: row.family_id,
    name: row.name,
    group: row.group_type as PersonGroup,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}

// Transform API format to database format (snake_case)
export function transformPersonToRow(person: Partial<Person>): Partial<PersonRow> {
  const row: Partial<PersonRow> = {}

  if (person.id !== undefined) row.id = person.id
  if (person.family_id !== undefined) row.family_id = person.family_id
  if (person.name !== undefined) row.name = person.name
  if (person.group !== undefined) row.group_type = person.group
  if (person.notes !== undefined) row.notes = person.notes || null
  if (person.createdAt !== undefined) row.created_at = person.createdAt
  if (person.updatedAt !== undefined) row.updated_at = person.updatedAt

  return row
}


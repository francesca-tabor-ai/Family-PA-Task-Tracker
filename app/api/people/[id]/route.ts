import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { transformPersonRowToPerson } from '@/lib/utils/person-transform'
import type { PersonRow } from '@/lib/utils/person-transform'
import type { PersonGroup } from '@/lib/types/person'

// PATCH /api/people/[id] - Update person
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
  const { name, group, notes } = body

  // Validate group if provided
  if (group !== undefined) {
    const validGroups: PersonGroup[] = ['adult', 'child', 'pet', 'emergency_contact']
    if (!validGroups.includes(group)) {
      return NextResponse.json(
        { error: `Invalid group. Must be one of: ${validGroups.join(', ')}` },
        { status: 400 }
      )
    }
  }

  // Build update object (snake_case for database)
  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name.trim()
  if (group !== undefined) updates.group_type = group
  if (notes !== undefined) updates.notes = notes || null

  // Update person - RLS will ensure user can only update their family's people
  const { data: person, error } = await supabase
    .from('people')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 })
  }

  // Transform to API format
  const transformedPerson = transformPersonRowToPerson(person as PersonRow)

  return NextResponse.json(transformedPerson)
}

// DELETE /api/people/[id] - Delete person
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

  // Delete person - RLS will ensure user can only delete their family's people
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}


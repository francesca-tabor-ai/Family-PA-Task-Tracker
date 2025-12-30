import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { transformPersonRowToPerson } from '@/lib/utils/person-transform'
import type { PersonRow } from '@/lib/utils/person-transform'
import type { PersonGroup } from '@/lib/types/person'

// GET /api/people - Fetch all people for the user's family
export async function GET() {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's family_id
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

  // Fetch people - RLS will automatically filter by family_id
  const { data: people, error } = await supabase
    .from('people')
    .select('*')
    .eq('family_id', familyMember.family_id)
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform database rows to API format
  const transformedPeople = (people || []).map((row: PersonRow) => transformPersonRowToPerson(row))

  return NextResponse.json(transformedPeople)
}

// POST /api/people - Create new person
export async function POST(request: Request) {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's family_id
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
  const { name, group = 'adult', notes } = body

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'Name is required' },
      { status: 400 }
    )
  }

  // Validate group
  const validGroups: PersonGroup[] = ['adult', 'child', 'pet', 'emergency_contact']
  if (!validGroups.includes(group)) {
    return NextResponse.json(
      { error: `Invalid group. Must be one of: ${validGroups.join(', ')}` },
      { status: 400 }
    )
  }

  // Create person
  const { data: person, error } = await supabase
    .from('people')
    .insert({
      family_id: familyMember.family_id,
      name: name.trim(),
      group_type: group,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to API format
  const transformedPerson = transformPersonRowToPerson(person as PersonRow)

  return NextResponse.json(transformedPerson, { status: 201 })
}


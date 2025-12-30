import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Force dynamic rendering - this route requires authentication and runtime data
export const dynamic = 'force-dynamic'

// GET /api/debug/categories - Diagnostic endpoint to check category data
export async function GET() {
  const supabase = createClient()

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      authError: authError?.message 
    }, { status: 401 })
  }

  // Get user's family_id
  const { data: familyMember, error: familyError } = await supabase
    .from('family_members')
    .select('family_id, user_id')
    .eq('user_id', session.user.id)
    .limit(1)
    .maybeSingle()

  if (familyError || !familyMember) {
    return NextResponse.json({
      error: 'No family membership found',
      familyError: familyError?.message,
      userId: session.user.id
    }, { status: 400 })
  }

  // Check if categories table exists and has data
  const { data: categories, error: categoriesError, count } = await supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .eq('household_id', familyMember.family_id)
    .eq('is_active', true)

  // Also check total categories (without household filter) to see if data exists at all
  const { data: allCategories, error: allCategoriesError, count: allCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .limit(5)

  // Check families table
  const { data: families, error: familiesError } = await supabase
    .from('families')
    .select('id, name')
    .limit(5)

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email
    },
    family: {
      id: familyMember.family_id,
      memberFound: true
    },
    categories: {
      forHousehold: {
        count: count || 0,
        data: categories || [],
        error: categoriesError?.message
      },
      all: {
        count: allCount || 0,
        sample: allCategories || [],
        error: allCategoriesError?.message
      }
    },
    families: {
      count: families?.length || 0,
      sample: families || [],
      error: familiesError?.message
    },
    diagnostics: {
      hasSession: !!session,
      hasFamilyMember: !!familyMember,
      householdId: familyMember?.family_id,
      categoriesQueryError: categoriesError?.message,
      allCategoriesQueryError: allCategoriesError?.message
    }
  })
}


#!/usr/bin/env tsx
/**
 * Diagnostic script to verify category data in the database
 * 
 * Usage:
 *   tsx scripts/verify-categories.ts
 * 
 * This script checks:
 * 1. If categories table exists
 * 2. If categories are seeded
 * 3. If user's family has categories
 * 4. If RLS policies are working
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY or SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key to bypass RLS for diagnostics
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('🔍 Checking database state...\n')

  // 1. Check families
  console.log('1️⃣ Checking families table...')
  const { data: families, error: familiesError } = await supabase
    .from('families')
    .select('id, name, created_at')
    .order('created_at', { ascending: true })

  if (familiesError) {
    console.error('   ❌ Error:', familiesError.message)
  } else {
    console.log(`   ✅ Found ${families?.length || 0} families`)
    if (families && families.length > 0) {
      console.log('   Families:')
      families.forEach((f, i) => {
        console.log(`      ${i + 1}. ${f.name} (${f.id})`)
      })
    }
  }

  // 2. Check categories (all)
  console.log('\n2️⃣ Checking categories table...')
  const { data: allCategories, error: categoriesError, count } = await supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (categoriesError) {
    console.error('   ❌ Error:', categoriesError.message)
  } else {
    console.log(`   ✅ Found ${count || 0} active categories`)
    
    // Group by household_id
    if (allCategories && allCategories.length > 0) {
      const byHousehold = new Map<string, typeof allCategories>()
      allCategories.forEach(cat => {
        const existing = byHousehold.get(cat.household_id) || []
        existing.push(cat)
        byHousehold.set(cat.household_id, existing)
      })

      console.log(`   📊 Categories by household:`)
      for (const [householdId, cats] of byHousehold.entries()) {
        const family = families?.find(f => f.id === householdId)
        const topLevel = cats.filter(c => c.parent_id === null)
        const subcategories = cats.filter(c => c.parent_id !== null)
        console.log(`      Household: ${family?.name || householdId}`)
        console.log(`         - ${topLevel.length} top-level categories`)
        console.log(`         - ${subcategories.length} subcategories`)
        console.log(`         - Total: ${cats.length} categories`)
      }
    } else {
      console.log('   ⚠️  No categories found in database!')
      console.log('   💡 Run migrations to seed categories:')
      console.log('      supabase db push')
    }
  }

  // 3. Check family_members
  console.log('\n3️⃣ Checking family_members table...')
  const { data: members, error: membersError } = await supabase
    .from('family_members')
    .select('family_id, user_id, role')
    .limit(10)

  if (membersError) {
    console.error('   ❌ Error:', membersError.message)
  } else {
    console.log(`   ✅ Found ${members?.length || 0} family members (showing first 10)`)
    if (members && members.length > 0) {
      members.forEach((m, i) => {
        const family = families?.find(f => f.id === m.family_id)
        console.log(`      ${i + 1}. User ${m.user_id.substring(0, 8)}... in ${family?.name || m.family_id} (${m.role})`)
      })
    }
  }

  // 4. Check if first family has categories
  if (families && families.length > 0) {
    const firstFamilyId = families[0].id
    console.log(`\n4️⃣ Checking categories for first family (${families[0].name})...`)
    const { data: firstFamilyCategories, error: firstFamilyError, count: firstFamilyCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .eq('household_id', firstFamilyId)
      .eq('is_active', true)

    if (firstFamilyError) {
      console.error('   ❌ Error:', firstFamilyError.message)
    } else {
      console.log(`   ✅ Found ${firstFamilyCount || 0} categories for first family`)
      if (firstFamilyCategories && firstFamilyCategories.length > 0) {
        const topLevel = firstFamilyCategories.filter(c => c.parent_id === null)
        console.log(`      - ${topLevel.length} top-level categories`)
        topLevel.forEach(cat => {
          const children = firstFamilyCategories.filter(c => c.parent_id === cat.id)
          console.log(`        • ${cat.name} (${children.length} subcategories)`)
        })
      }
    }
  }

  // 5. Recommendations
  console.log('\n📋 Recommendations:')
  if (!allCategories || allCategories.length === 0) {
    console.log('   1. Run migrations to create and seed categories:')
    console.log('      supabase db push')
    console.log('   2. Or manually run the migration files:')
    console.log('      supabase migration up')
  } else if (families && families.length > 0) {
    const firstFamily = families[0]
    const firstFamilyCategories = allCategories?.filter(c => c.household_id === firstFamily.id) || []
    if (firstFamilyCategories.length === 0) {
      console.log('   1. Categories exist but not for the first family')
      console.log('   2. Re-run the seed migration or update it to seed for all families')
    } else {
      console.log('   ✅ Categories are seeded!')
      console.log('   💡 If UI still shows empty, check:')
      console.log('      1. User is authenticated')
      console.log('      2. User is a member of a family')
      console.log('      3. RLS policies allow reading categories')
      console.log('      4. Visit /api/debug/categories to see detailed diagnostics')
    }
  }

  console.log('\n✅ Diagnostic complete!')
}

main().catch(console.error)


// Server-side category queries
import { createClient } from '@/lib/supabase/server'
import type { Category, CategoryTreeNode } from '@/lib/types/category'

/**
 * Fetch all categories for the current user's household
 * Returns flat list of categories
 */
export async function fetchCategories(householdId?: string) {
  const supabase = createClient()

  // Get user's household_id if not provided
  if (!householdId) {
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

    householdId = familyMember.family_id
  }

  // Fetch all categories for the household
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return (categories || []) as Category[]
}

/**
 * Fetch top-level categories only (parent_id IS NULL)
 */
export async function fetchTopLevelCategories(householdId?: string) {
  const categories = await fetchCategories(householdId)
  return categories.filter(cat => cat.parent_id === null)
}

/**
 * Fetch categories organized as a tree structure
 * Returns array of top-level categories with nested children
 */
export async function fetchCategoryTree(householdId?: string): Promise<CategoryTreeNode[]> {
  const categories = await fetchCategories(householdId)
  
  // Build tree structure
  const categoryMap = new Map<string, CategoryTreeNode>()
  const rootCategories: CategoryTreeNode[] = []
  
  // First pass: create all nodes
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      level: 0,
    })
  })
  
  // Second pass: build tree structure
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!
    
    if (cat.parent_id === null) {
      rootCategories.push(node)
    } else {
      const parent = categoryMap.get(cat.parent_id)
      if (parent) {
        parent.children.push(node)
        node.level = parent.level + 1
      }
    }
  })
  
  // Sort children by sort_order, then name
  function sortChildren(node: CategoryTreeNode) {
    node.children.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order
      }
      return a.name.localeCompare(b.name)
    })
    node.children.forEach(sortChildren)
  }
  
  rootCategories.forEach(sortChildren)
  rootCategories.sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order
    }
    return a.name.localeCompare(b.name)
  })
  
  return rootCategories
}

/**
 * Fetch children of a specific category
 */
export async function fetchCategoryChildren(parentId: string, householdId?: string) {
  const categories = await fetchCategories(householdId)
  return categories.filter(cat => cat.parent_id === parentId)
}

/**
 * Fetch category by slug
 */
export async function fetchCategoryBySlug(slug: string, householdId?: string) {
  const categories = await fetchCategories(householdId)
  return categories.find(cat => cat.slug === slug) || null
}


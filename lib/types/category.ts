// Category Data Model
// Hierarchical category system for Family PA tasks and other modules

export interface Category {
  id: string;                    // UUID
  household_id: string;          // Reference to household (family)
  name: string;                  // Display name
  slug: string;                  // URL-friendly identifier, unique per household
  parent_id: string | null;     // Reference to parent category (null for top-level)
  sort_order: number;            // Order for display within the same level
  is_active: boolean;            // Whether category is active
  default_status: string | null; // Default task status when creating tasks under this category
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}

// Category with parent information (for flat queries)
export interface CategoryWithParent extends Category {
  parent_name?: string | null;
  parent_slug?: string | null;
}

// Category tree node (for hierarchical structures)
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;                 // Depth in hierarchy (0 = top-level)
}

// Helper type for creating a category
export type CreateCategoryInput = Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;  // Optional, will be generated if not provided
};

// Helper type for updating a category
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'created_at' | 'household_id'>> & {
  id: string;
};

// Utility functions
export function isTopLevel(category: Category): boolean {
  return category.parent_id === null;
}

export function getCategoryPath(categories: Category[], categoryId: string): string {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return '';
  
  if (category.parent_id === null) {
    return category.name;
  }
  
  const parent = categories.find(c => c.id === category.parent_id);
  if (!parent) return category.name;
  
  return `${getCategoryPath(categories, parent.id)} > ${category.name}`;
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];
  
  // First pass: create all nodes
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      level: 0,
    });
  });
  
  // Second pass: build tree structure
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!;
    
    if (cat.parent_id === null) {
      rootCategories.push(node);
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      }
    }
  });
  
  // Sort children by sort_order
  function sortChildren(node: CategoryTreeNode) {
    node.children.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  }
  
  rootCategories.forEach(sortChildren);
  rootCategories.sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.name.localeCompare(b.name);
  });
  
  return rootCategories;
}

export function flattenCategoryTree(tree: CategoryTreeNode[]): Category[] {
  const result: Category[] = [];
  
  function traverse(node: CategoryTreeNode) {
    result.push({
      id: node.id,
      household_id: node.household_id,
      name: node.name,
      slug: node.slug,
      parent_id: node.parent_id,
      sort_order: node.sort_order,
      is_active: node.is_active,
      default_status: node.default_status ?? null,
      created_at: node.created_at,
      updated_at: node.updated_at,
    });
    node.children.forEach(traverse);
  }
  
  tree.forEach(traverse);
  return result;
}


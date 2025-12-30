// Category Taxonomy Types
// Hierarchical category system using full paths

export interface Category {
  id: string;                    // UUID
  family_id: string | null;      // null for system-wide categories
  path: string;                   // Full path like "Health & Wellness > Dentists & specialists"
  parent_path: string | null;    // Parent category path (null for top-level)
  level: number;                  // Depth in hierarchy (1 = top-level)
  is_active: boolean;            // Whether category is active
  createdAt: string;              // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
}

// Helper type for creating a category
export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

// Helper type for updating a category
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'createdAt'>> & {
  id: string;
};

// Category tree structure for UI
export interface CategoryTreeNode {
  path: string;
  name: string;
  level: number;
  children: CategoryTreeNode[];
}

// Top-level categories (system-wide)
export const TOP_LEVEL_CATEGORIES = [
  'Tasks & Commitments',
  'Household & Administration',
  'People (Family)',
  'Pets',
  'Expiry & Renewals',
  'Health & Wellness',
  'School & Children\'s Activities',
  'Travel & Mobility',
  'Concierge & Lifestyle',
  'Celebrations & Gifting',
  'Orders, Returns & Refunds',
  'Inventory, Assets & Insurance',
  'Documents & Compliance',
  'Communication & Capture',
  'Risk & Confirmation',
] as const;

// Utility functions
export function getCategoryName(path: string): string {
  return path.split(' > ').pop() || path;
}

export function getTopLevelCategory(path: string): string {
  return path.split(' > ')[0] || path;
}

export function getParentPath(path: string): string | null {
  const parts = path.split(' > ');
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join(' > ');
}

export function getCategoryLevel(path: string): number {
  return path.split(' > ').length;
}

export function isValidCategoryPath(path: string): boolean {
  // Must match format: "Category" or "Category > Subcategory > ..."
  return /^[^>]+( > [^>]+)*$/.test(path);
}

export function buildCategoryPath(parentPath: string | null, name: string): string {
  if (!parentPath) return name;
  return `${parentPath} > ${name}`;
}


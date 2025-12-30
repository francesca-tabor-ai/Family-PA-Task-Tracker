import { fetchCategoryTree } from "@/lib/supabase/queries/categories";
import { fetchTasks } from "@/lib/supabase/queries/tasks";
import Link from "next/link";
import type { CategoryTreeNode } from "@/lib/types/category";
import type { Task } from "@/lib/supabase/queries/tasks";

// Force dynamic rendering - this page requires authenticated data from Supabase
export const dynamic = 'force-dynamic'

interface CategoryWithCount extends CategoryTreeNode {
  taskCount: number;
  subcategoryCounts: Map<string, number>;
}

function countTasksByCategory(tasks: Task[], categoryId: string): number {
  return tasks.filter(task => task.category_id === categoryId).length;
}

function countTasksBySubcategory(tasks: Task[], categoryId: string, subcategoryId: string): number {
  return tasks.filter(task => 
    task.category_id === categoryId && 
    // For now, we don't have subcategory_id in tasks, so we'll count by parent category
    // This is a limitation - we'd need to add subcategory_id to tasks table
    true
  ).length;
}

export default async function AllCategoriesPage() {
  let categories: CategoryTreeNode[] = [];
  let tasks: Task[] = [];
  
  try {
    categories = await fetchCategoryTree();
    tasks = await fetchTasks();
  } catch (error) {
    console.error("Error loading categories page:", error);
  }

  // Build category counts
  const categoriesWithCounts: CategoryWithCount[] = categories.map(category => {
    const taskCount = countTasksByCategory(tasks, category.id);
    const subcategoryCounts = new Map<string, number>();
    
    category.children.forEach(subcategory => {
      // Count tasks in this subcategory (for now, just count by parent category)
      // TODO: Add subcategory_id to tasks table for accurate counting
      subcategoryCounts.set(subcategory.id, 0);
    });

    return {
      ...category,
      taskCount,
      subcategoryCounts,
    };
  });

  const uncategorisedCount = tasks.filter(task => task.category_id === null).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm font-rubik text-brand-text/60 hover:text-brand-text"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-heading-2 text-brand-text mb-2">All Categories</h1>
      <p className="text-sm font-rubik text-brand-text/60 mb-6">
        Overview of all categories and their task counts
      </p>

      {/* Uncategorised */}
      {uncategorisedCount > 0 && (
        <div className="card mb-4">
          <Link
            href="/category/uncategorised"
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-button transition-colors"
          >
            <div>
              <h3 className="text-heading-3 text-brand-text">Uncategorised</h3>
              <p className="text-sm font-rubik text-brand-text/60 mt-1">
                Tasks without a category
              </p>
            </div>
            <div className="text-2xl font-heading text-brand-text">{uncategorisedCount}</div>
          </Link>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categoriesWithCounts.map((category) => (
          <div key={category.id} className="card">
            <Link
              href={`/category/${category.slug}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-button transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-heading-3 text-brand-text">{category.name}</h3>
                {category.children.length > 0 && (
                  <p className="text-sm font-rubik text-brand-text/60 mt-1">
                    {category.children.length} subcategor{category.children.length === 1 ? "y" : "ies"}
                  </p>
                )}
              </div>
              <div className="text-2xl font-heading text-brand-text">{category.taskCount}</div>
            </Link>

            {/* Subcategories */}
            {category.children.length > 0 && (
              <div className="border-t border-brand-button-light mt-2 pt-2 pl-4">
                {category.children.map((subcategory) => {
                  const subCount = category.subcategoryCounts.get(subcategory.id) || 0;
                  return (
                    <Link
                      key={subcategory.id}
                      href={`/category/${subcategory.slug}`}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-button transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand-text/60">└</span>
                        <span className="text-base font-rubik text-brand-text">{subcategory.name}</span>
                      </div>
                      <div className="text-lg font-heading text-brand-text/60">{subCount}</div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {categoriesWithCounts.length === 0 && (
        <div className="card">
          <p className="text-sm font-rubik text-brand-text/60 text-center py-8">
            No categories available yet.
          </p>
        </div>
      )}
    </div>
  );
}


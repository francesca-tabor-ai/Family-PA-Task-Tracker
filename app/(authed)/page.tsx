import TaskList from "@/components/TaskList";
import { fetchCategoryTree } from "@/lib/supabase/queries/categories";
import type { CategoryTreeNode } from "@/lib/types/category";

export default async function Page() {
  // Fetch categories for task form
  let categories: CategoryTreeNode[] = [];
  try {
    categories = await fetchCategoryTree();
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div className="space-y-6">
      <TaskList categories={categories} />
    </div>
  );
}


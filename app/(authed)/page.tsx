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
      <section className="card card-elevated">
        <h2 className="text-heading-3 text-brand-text mb-2">All Tasks</h2>
        <p className="text-sm font-rubik text-brand-text/70 font-light">
          Tasks captured by voice + API will appear here.
        </p>
      </section>

      <TaskList categories={categories} />
    </div>
  );
}


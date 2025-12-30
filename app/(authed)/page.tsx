import NotionTaskList from "@/components/NotionTaskList";
import { fetchCategoryTree } from "@/lib/supabase/queries/categories";
import type { CategoryTreeNode } from "@/lib/types/category";

// Force dynamic rendering - this page requires authenticated data from Supabase
export const dynamic = 'force-dynamic'

export default async function Page() {
  // Fetch categories for task form
  let categories: CategoryTreeNode[] = [];
  try {
    categories = await fetchCategoryTree();
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div>
      {/* Page Header - Notion style */}
      <div className="mb-8 md:mb-12">
        <h1 className="mb-2 text-3xl md:text-4xl">Family PA Task Tracker</h1>
        <p className="text-sm md:text-base text-notion-textMuted">
          Add tasks, see what's open, and keep life admin moving.
        </p>
      </div>

      <NotionTaskList categories={categories} />
    </div>
  );
}


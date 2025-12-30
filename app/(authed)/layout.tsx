import { fetchCategoryTree } from "@/lib/supabase/queries/categories";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { CategoryTreeNode } from "@/lib/types/category";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories for sidebar with error handling
  let categories: CategoryTreeNode[] = [];
  try {
    categories = await fetchCategoryTree();
  } catch (error) {
    // Log error but don't crash the page
    console.error("Error fetching categories for sidebar:", error);
    // categories remains empty array, sidebar will show "No categories available"
  }

  return (
    <div className="flex min-h-screen bg-notion-bg">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:block w-64 border-r border-notion-border bg-notion-bg p-6">
        <DashboardSidebar categories={categories} />
      </aside>

      {/* Main Content - Notion centered layout */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-notion px-6 py-12 md:py-notion">
          {children}
        </div>
      </main>
    </div>
  );
}


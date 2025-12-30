import { fetchCategoryTree } from "@/lib/supabase/queries/categories";
import DashboardSidebar from "@/components/DashboardSidebar";
import AppHeader from "@/components/AppHeader";
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
    <div className="flex min-h-screen bg-brand-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-button-light bg-white p-4">
        <DashboardSidebar categories={categories} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AppHeader />
        <div className="mx-auto max-w-3xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}


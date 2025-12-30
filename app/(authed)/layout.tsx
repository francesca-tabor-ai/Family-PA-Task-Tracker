import { fetchCategoryTree } from "@/lib/supabase/queries/categories";
import SidebarCategories from "@/components/SidebarCategories";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories for sidebar
  const categories = await fetchCategoryTree();

  return (
    <div className="flex min-h-screen bg-brand-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-button-light bg-white p-4">
        <h2 className="text-heading-3 text-brand-text mb-4">Categories</h2>
        <SidebarCategories categories={categories} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}


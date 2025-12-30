import { fetchCategoryBySlug, fetchCategoryChildren } from "@/lib/supabase/queries/categories";
import { notFound } from "next/navigation";
import Link from "next/link";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await fetchCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const children = await fetchCategoryChildren(category.id);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-brand-text/60 hover:text-brand-text"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-heading-2 text-brand-text mb-2">{category.name}</h1>
      <p className="text-sm font-rubik text-brand-text/60 mb-6">
        Category: {category.slug}
      </p>

      {children.length > 0 && (
        <div className="mt-6">
          <h2 className="text-heading-3 text-brand-text mb-4">Subcategories</h2>
          <ul className="space-y-2">
            {children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/category/${child.slug}`}
                  className="text-base font-rubik text-brand-text hover:text-brand-primary"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 p-4 bg-brand-button-light rounded-card">
        <p className="text-sm font-rubik text-brand-text/60">
          Tasks filtered by this category will appear here.
        </p>
      </div>
    </div>
  );
}


import { fetchCategoryBySlug, fetchCategoryChildren } from "@/lib/supabase/queries/categories";
import { fetchTasksByCategory, groupTasksByStatus, getTaskCountsByStatus } from "@/lib/supabase/queries/tasks";
import { notFound } from "next/navigation";
import Link from "next/link";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Handle "uncategorised" special case
  const isUncategorised = params.slug === "uncategorised";
  
  let category = null;
  if (!isUncategorised) {
    category = await fetchCategoryBySlug(params.slug);
    if (!category) {
      notFound();
    }
  }

  // Fetch tasks for this category (or uncategorised if slug is "uncategorised")
  const tasks = await fetchTasksByCategory(isUncategorised ? null : category?.id || null);
  
  // Group tasks by status
  const groupedTasks = groupTasksByStatus(tasks);
  const taskCounts = getTaskCountsByStatus(tasks);

  // Fetch subcategories if this is a real category
  const children = category ? await fetchCategoryChildren(category.id) : [];

  const categoryName = isUncategorised ? "Uncategorised" : category?.name || "Category";
  const categorySlug = isUncategorised ? "uncategorised" : category?.slug || "";

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

      <h1 className="text-heading-2 text-brand-text mb-2">{categoryName}</h1>
      {!isUncategorised && (
        <p className="text-sm font-rubik text-brand-text/60 mb-6">
          Category: {categorySlug}
        </p>
      )}

      {/* Task Counts by Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-2xl font-heading text-brand-text">{taskCounts.inbox}</div>
          <div className="text-sm font-rubik text-brand-text/60">Inbox</div>
        </div>
        <div className="card">
          <div className="text-2xl font-heading text-brand-text">{taskCounts.pending}</div>
          <div className="text-sm font-rubik text-brand-text/60">Pending</div>
        </div>
        <div className="card">
          <div className="text-2xl font-heading text-brand-text">{taskCounts.scheduled}</div>
          <div className="text-sm font-rubik text-brand-text/60">Scheduled</div>
        </div>
        <div className="card">
          <div className="text-2xl font-heading text-brand-text">{taskCounts.completed}</div>
          <div className="text-sm font-rubik text-brand-text/60">Completed</div>
        </div>
      </div>

      {/* Tasks Grouped by Status */}
      <div className="space-y-6">
        {/* Inbox Tasks */}
        {groupedTasks.inbox.length > 0 && (
          <section className="card">
            <h2 className="text-heading-3 text-brand-text mb-4">
              Inbox ({groupedTasks.inbox.length})
            </h2>
            <ul className="space-y-2">
              {groupedTasks.inbox.map((task) => (
                <li key={task.id} className="p-3 border border-brand-button-light rounded-button">
                  <div className="text-base font-rubik text-brand-text">{task.title}</div>
                  {task.due_at && (
                    <div className="text-xs font-rubik text-brand-text/60 mt-1">
                      Due: {new Date(task.due_at).toLocaleDateString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pending Tasks */}
        {groupedTasks.pending.length > 0 && (
          <section className="card">
            <h2 className="text-heading-3 text-brand-text mb-4">
              Pending ({groupedTasks.pending.length})
            </h2>
            <ul className="space-y-2">
              {groupedTasks.pending.map((task) => (
                <li key={task.id} className="p-3 border border-brand-button-light rounded-button">
                  <div className="text-base font-rubik text-brand-text">{task.title}</div>
                  {task.due_at && (
                    <div className="text-xs font-rubik text-brand-text/60 mt-1">
                      Due: {new Date(task.due_at).toLocaleDateString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Scheduled Tasks */}
        {groupedTasks.scheduled.length > 0 && (
          <section className="card">
            <h2 className="text-heading-3 text-brand-text mb-4">
              Scheduled ({groupedTasks.scheduled.length})
            </h2>
            <ul className="space-y-2">
              {groupedTasks.scheduled.map((task) => (
                <li key={task.id} className="p-3 border border-brand-button-light rounded-button">
                  <div className="text-base font-rubik text-brand-text">{task.title}</div>
                  {task.due_at && (
                    <div className="text-xs font-rubik text-brand-text/60 mt-1">
                      Due: {new Date(task.due_at).toLocaleDateString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Completed Tasks */}
        {groupedTasks.completed.length > 0 && (
          <section className="card">
            <h2 className="text-heading-3 text-brand-text mb-4">
              Completed ({groupedTasks.completed.length})
            </h2>
            <ul className="space-y-2">
              {groupedTasks.completed.map((task) => (
                <li key={task.id} className="p-3 border border-brand-button-light rounded-button bg-white/50">
                  <div className="text-base font-rubik text-brand-text/50 line-through">{task.title}</div>
                  {task.due_at && (
                    <div className="text-xs font-rubik text-brand-text/40 mt-1">
                      Due: {new Date(task.due_at).toLocaleDateString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="card">
            <p className="text-sm font-rubik text-brand-text/60 text-center py-8">
              No tasks in this category yet.
            </p>
          </div>
        )}
      </div>

      {/* Subcategories */}
      {children.length > 0 && (
        <div className="mt-8">
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
    </div>
  );
}


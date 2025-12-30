"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryTreeNode } from "@/lib/types/category";

interface SidebarCategoriesProps {
  categories: CategoryTreeNode[];
}

export default function SidebarCategories({ categories }: SidebarCategoriesProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  function toggleCategory(categoryId: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function isActive(slug: string): boolean {
    return pathname === `/category/${slug}`;
  }

  function renderCategory(category: CategoryTreeNode, level: number = 0) {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const active = isActive(category.slug);

    return (
      <div key={category.id} className="w-full">
        <div className="flex items-center" style={{ paddingLeft: `${level * 1rem}` }}>
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="mr-2 p-1 hover:bg-gray-100 rounded"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <Link
            href={`/category/${category.slug}`}
            className={`flex-1 py-2 px-3 rounded hover:bg-gray-100 ${
              active ? 'bg-gray-200 font-semibold' : ''
            }`}
          >
            {category.name}
          </Link>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-6">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No categories available
      </div>
    );
  }

  return (
    <nav className="w-full">
      <div className="space-y-1">
        {/* Uncategorised link */}
        <div className="w-full">
          <Link
            href="/category/uncategorised"
            className={`flex items-center py-2 px-3 rounded hover:bg-gray-100 ${
              pathname === '/category/uncategorised' ? 'bg-gray-200 font-semibold' : ''
            }`}
          >
            <div className="w-6" />
            <span>Uncategorised</span>
          </Link>
        </div>
        
        {/* Category tree */}
        {categories.map(category => renderCategory(category, 0))}
      </div>
    </nav>
  );
}


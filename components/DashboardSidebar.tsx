"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryTreeNode } from "@/lib/types/category";

interface DashboardSidebarProps {
  categories: CategoryTreeNode[];
}

interface CategoryItemProps {
  category: CategoryTreeNode;
  level: number;
  expandedCategories: Set<string>;
  pathname: string;
  onToggle: (categoryId: string) => void;
}

function CategoryItem({ category, level, expandedCategories, pathname, onToggle }: CategoryItemProps): JSX.Element {
  const hasChildren = category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  const active = pathname === `/category/${category.slug}`;

  return (
    <div className="w-full">
      <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 0.75}rem` }}>
        {hasChildren && (
          <button
            onClick={() => onToggle(category.id)}
            className="p-0.5 hover:bg-notion-hover rounded-notion transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            type="button"
          >
            <svg
              className={`w-3 h-3 text-notion-textMuted transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <Link
          href={`/category/${category.slug}`}
          className={`notion-sidebar-item flex-1 text-sm ${
            active 
              ? "active" 
              : "text-notion-textMuted hover:text-notion-text"
          }`}
        >
          {category.name}
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              expandedCategories={expandedCategories}
              pathname={pathname}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardSidebar({ categories }: DashboardSidebarProps): JSX.Element {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  function toggleCategory(categoryId: string): void {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  const isAllTasks = pathname === "/" || pathname === "/dashboard";
  const isAllCategories = pathname === "/categories";

  return (
    <nav className="w-full">
      <div className="mb-8">
        {/* Main Navigation - Notion style */}
        <div className="space-y-0.5 mb-6">
          <Link
            href="/"
            className={`notion-sidebar-item text-sm ${
              isAllTasks 
                ? "active" 
                : "text-notion-textMuted hover:text-notion-text"
            }`}
          >
            <span>All Tasks</span>
          </Link>
          
          <Link
            href="/categories"
            className={`notion-sidebar-item text-sm ${
              isAllCategories 
                ? "active" 
                : "text-notion-textMuted hover:text-notion-text"
            }`}
          >
            <span>Categories</span>
          </Link>
          
          {/* Divider */}
          <div className="border-t border-notion-border my-2"></div>
          
          {/* WhatsApp Link */}
          <a
            href="https://chat.whatsapp.com/HGu60zYZPYLG6bWGu0qNJ7"
            target="_blank"
            rel="noopener noreferrer"
            className="notion-sidebar-item text-sm text-[#128c7e]"
            title="Send a voice note to create a task"
          >
            <span>🎙️ Add via WhatsApp</span>
          </a>
        </div>

        {/* Categories Section - Notion style */}
        <div className="border-t border-notion-border pt-4">
          <div className="text-xs font-medium text-notion-textMuted uppercase tracking-wide mb-2 px-2">
            Categories
          </div>
          
          <div className="space-y-0.5">
            <Link
              href="/category/uncategorised"
              className={`notion-sidebar-item text-sm ${
                pathname === "/category/uncategorised" 
                  ? "active" 
                  : "text-notion-textMuted hover:text-notion-text"
              }`}
            >
              <span>Uncategorised</span>
            </Link>
            
            {categories.length === 0 ? (
              <div className="px-2 py-2 text-xs text-notion-textMuted">
                No categories available
              </div>
            ) : (
              categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  level={0}
                  expandedCategories={expandedCategories}
                  pathname={pathname}
                  onToggle={toggleCategory}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


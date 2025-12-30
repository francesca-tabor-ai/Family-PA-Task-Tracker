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
      <div className="flex items-center" style={{ paddingLeft: `${level * 1}rem` }}>
        {hasChildren && (
          <button
            onClick={() => onToggle(category.id)}
            className="mr-2 p-1 hover:bg-gray-100 rounded"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
            active ? "bg-gray-200 font-semibold" : ""
          }`}
        >
          {category.name}
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-6">
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
      <div className="mb-6">
        {/* App Name */}
        <h1 className="text-heading-2 text-brand-text mb-2">Family PA Task Tracker</h1>
        <p className="text-xs font-rubik text-brand-text/60 font-light mb-4">
          Add tasks, see what's open, and keep life admin moving.
        </p>
        
        {/* Main Navigation */}
        <div className="space-y-1 mb-6">
          <Link
            href="/"
            className={`flex items-center py-2 px-3 rounded hover:bg-gray-100 ${
              isAllTasks ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            <div className="w-6" />
            <span>All Tasks</span>
          </Link>
          
          <Link
            href="/categories"
            className={`flex items-center py-2 px-3 rounded hover:bg-gray-100 ${
              isAllCategories ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            <div className="w-6" />
            <span>All Categories</span>
          </Link>
          
          {/* Divider */}
          <div className="border-t border-brand-button-light my-2"></div>
          
          {/* WhatsApp Link */}
          <a
            href="https://chat.whatsapp.com/HGu60zYZPYLG6bWGu0qNJ7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center py-2 px-3 rounded hover:bg-gray-100 text-[#128c7e]"
            title="Send a voice note to create a task"
          >
            <div className="w-6" />
            <span>🎙️ Add via WhatsApp</span>
          </a>
        </div>

        {/* Categories Section */}
        <div className="border-t border-brand-button-light pt-4">
          <h3 className="text-sm font-semibold text-brand-text/60 mb-2 uppercase tracking-wide">
            Categories
          </h3>
          
          <div className="space-y-1">
            <div className="w-full">
              <Link
                href="/category/uncategorised"
                className={`flex items-center py-2 px-3 rounded hover:bg-gray-100 ${
                  pathname === "/category/uncategorised" ? "bg-gray-200 font-semibold" : ""
                }`}
              >
                <div className="w-6" />
                <span>Uncategorised</span>
              </Link>
            </div>
            
            {categories.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
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


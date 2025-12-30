"use client";

import { useState, useEffect, useRef } from "react";
import type { CategoryTreeNode } from "@/lib/types/category";

interface NotionTaskInputProps {
  onAdd: (task: { title: string; category_id: string; subcategory_id?: string; description?: string }) => void;
  categories: CategoryTreeNode[];
}

export default function NotionTaskInput({ onAdd, categories }: NotionTaskInputProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const availableSubcategories = selectedCategory?.children || [];
  const canSubmit = title.trim().length > 0 && categoryId.length > 0;

  useEffect(() => {
    setSubcategoryId("");
  }, [categoryId]);

  useEffect(() => {
    setShowAddButton(title.trim().length > 0 || document.activeElement === inputRef.current);
  }, [title]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    onAdd({
      title: title.trim(),
      category_id: categoryId,
      subcategory_id: subcategoryId || undefined,
      description: description.trim() || undefined,
    });

    setTitle("");
    setCategoryId("");
    setSubcategoryId("");
    setDescription("");
    setIsExpanded(false);
    inputRef.current?.focus();
  };

  return (
    <div className="mb-8">
      {/* Main input - Notion style */}
      <div className="flex items-center gap-2 group">
        <div className="notion-input-container flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowAddButton(true)}
            onBlur={() => {
              // Delay to allow button click
              setTimeout(() => setShowAddButton(title.trim().length > 0), 200);
            }}
            placeholder="Type a task and press Enter..."
            className="notion-input flex-1"
            autoFocus
          />
          {showAddButton && canSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur
              className="notion-add-button"
              aria-label="Add task"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* Expanded options */}
      {isExpanded && (
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-notion-border">
          <div>
            <label className="block text-xs font-medium text-notion-textMuted mb-1.5 uppercase tracking-wide">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-notion border border-notion-border bg-notion-bg text-notion-text text-sm focus:outline-none focus:ring-1 focus:ring-notion-text/20"
              required
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {availableSubcategories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-notion-textMuted mb-1.5 uppercase tracking-wide">
                Subcategory (optional)
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-notion border border-notion-border bg-notion-bg text-notion-text text-sm focus:outline-none focus:ring-1 focus:ring-notion-text/20"
              >
                <option value="">None</option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-notion-textMuted mb-1.5 uppercase tracking-wide">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-notion border border-notion-border bg-notion-bg text-notion-text text-sm resize-none focus:outline-none focus:ring-1 focus:ring-notion-text/20"
              placeholder="Add more details..."
            />
          </div>
        </div>
      )}

      {/* Toggle expand button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-xs text-notion-textMuted hover:text-notion-text flex items-center gap-1.5 px-1 py-1 rounded-notion hover:bg-notion-hover transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {isExpanded ? "Less options" : "More options"}
      </button>

      {/* Validation message */}
      {!isExpanded && categoryId === "" && title.trim().length > 0 && (
        <p className="mt-2 text-xs text-amber-600">
          Please expand to select a category (required)
        </p>
      )}
    </div>
  );
}


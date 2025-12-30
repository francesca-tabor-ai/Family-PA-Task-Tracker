"use client";

import { useState, useEffect } from "react";
import type { CategoryTreeNode } from "@/lib/types/category";

interface AddTaskFormProps {
  onAdd: (task: { title: string; category_id: string; subcategory_id?: string; description?: string }) => void;
  categories: CategoryTreeNode[];
}

export default function AddTaskForm({ onAdd, categories }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Find selected category to get subcategories
  const selectedCategory = categories.find(c => c.id === categoryId);
  const availableSubcategories = selectedCategory?.children || [];

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategoryId("");
  }, [categoryId]);

  const canSubmit = title.trim().length > 0 && categoryId.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onAdd({
      title: title.trim(),
      category_id: categoryId,
      subcategory_id: subcategoryId || undefined,
      description: description.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setCategoryId("");
    setSubcategoryId("");
    setDescription("");
    setIsExpanded(false);
  };

  return (
    <form
      className="sticky top-4 z-10 bg-white p-4 rounded-card shadow-card-elevated"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3">
        {/* Title Input */}
        <input
          className="w-full rounded-button border-2 border-brand-primary/20 bg-white px-5 py-4 text-base font-rubik text-brand-text placeholder:text-brand-text/40 outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          placeholder="Add a task (e.g., Book dentist)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-rubik text-brand-text/60 hover:text-brand-text flex items-center gap-2"
        >
          {isExpanded ? "Less options" : "More options"}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded Form Fields */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-brand-button-light">
            {/* Category Selection (Required) */}
            <div>
              <label className="block text-sm font-rubik font-semibold text-brand-text mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-button border-2 border-brand-primary/20 bg-white px-4 py-3 text-base font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
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

            {/* Subcategory Selection (Optional, only if category has subcategories) */}
            {availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-rubik font-semibold text-brand-text mb-2">
                  Subcategory (optional)
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full rounded-button border-2 border-brand-primary/20 bg-white px-4 py-3 text-base font-rubik text-brand-text outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
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

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm font-rubik font-semibold text-brand-text mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-button border-2 border-brand-primary/20 bg-white px-4 py-3 text-base font-rubik text-brand-text placeholder:text-brand-text/40 outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none"
                placeholder="Add more details about this task..."
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`btn font-rubik font-semibold text-base px-6 py-4 min-w-[100px] sm:min-w-[120px] ${
            canSubmit
              ? "btn-primary-action"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Add Task
        </button>

        {/* Validation Message */}
        {!isExpanded && categoryId === "" && title.trim().length > 0 && (
          <p className="text-sm text-amber-600 font-rubik">
            Please expand to select a category (required)
          </p>
        )}
      </div>
    </form>
  );
}

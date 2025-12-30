"use client";

import { useState } from "react";
import type { Task } from "@/lib/supabase/queries/tasks";

interface NotionTaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  isNew?: boolean;
}

export default function NotionTaskRow({ task, onToggle, isNew }: NotionTaskRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = task.status === "done" || task.status === "completed";

  return (
    <div
      className="notion-task-row group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`notion-checkbox ${isCompleted ? "checked" : ""}`}
        aria-label={isCompleted ? `Reopen "${task.title}"` : `Mark "${task.title}" as done`}
        type="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(task.id);
          }
        }}
      >
        {isCompleted && (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className={`text-base text-notion-text ${isCompleted ? "line-through text-notion-textMuted" : ""}`}>
          {task.title}
        </div>
        {task.description && (
          <div className={`text-sm mt-1 ${isCompleted ? "line-through text-notion-textMuted" : "text-notion-textMuted"}`}>
            {task.description}
          </div>
        )}
      </div>

      {/* Actions (appear on hover) */}
      {isHovered && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(task.id)}
            className="notion-button"
            aria-label={isCompleted ? "Reopen task" : "Complete task"}
            type="button"
          >
            <svg className="w-4 h-4 text-notion-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isCompleted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}


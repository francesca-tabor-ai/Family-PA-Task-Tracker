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

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('.notion-checkbox') ||
      target.closest('.notion-drag-handle') ||
      target.closest('.notion-due-pill') ||
      target.closest('.notion-avatar-cluster') ||
      target.closest('.notion-overflow-menu')
    ) {
      return;
    }
    // Row click handler (could open detail panel or inline edit)
    // For now, just toggle on row click
    onToggle(task.id);
  };

  return (
    <div
      className="notion-task-row group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
    >
      {/* Drag handle (appears on hover) */}
      <div className="notion-drag-handle" title="Drag to reorder">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`notion-checkbox ${isCompleted ? "checked" : ""}`}
        aria-label={isCompleted ? `Reopen "${task.title}"` : `Mark "${task.title}" as done`}
        type="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
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
      <div className="notion-task-content">
        <div className={`text-base text-notion-text ${isCompleted ? "line-through text-notion-textMuted" : ""}`}>
          {task.title}
        </div>
        {task.description && (
          <div className={`text-sm mt-1 ${isCompleted ? "line-through text-notion-textMuted" : "text-notion-textMuted"}`}>
            {task.description}
          </div>
        )}
      </div>

      {/* Assignee avatars cluster (placeholder for future) */}
      {/* <div className="notion-avatar-cluster">
        <div className="w-5 h-5 rounded-full bg-notion-border border-2 border-white"></div>
      </div> */}

      {/* Due date pill (placeholder for future) */}
      {/* {task.due_at && (
        <div className="notion-due-pill">
          {new Date(task.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )} */}

      {/* Overflow menu (⋯) - appears on hover */}
      <div className="notion-overflow-menu" title="More options">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </div>
    </div>
  );
}


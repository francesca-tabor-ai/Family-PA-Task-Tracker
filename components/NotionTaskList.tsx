"use client";

import { useMemo, useState, useEffect } from "react";
import NotionTaskInput from "./NotionTaskInput";
import NotionTaskRow from "./NotionTaskRow";
import NotionSection from "./NotionSection";
import type { CategoryTreeNode } from "@/lib/types/category";
import type { Task } from "@/lib/supabase/queries/tasks";

interface NotionTaskListProps {
  categories: CategoryTreeNode[];
}

export default function NotionTaskList({ categories }: NotionTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const openTasks = useMemo(() => 
    tasks.filter(t => t.status === "open" || t.status === "inbox"), 
    [tasks]
  );
  const doneTasks = useMemo(() => 
    tasks.filter(t => t.status === "done" || t.status === "completed"), 
    [tasks]
  );

  async function addTask(taskData: { title: string; category_id: string; subcategory_id?: string; description?: string }) {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
        setNewTaskIds(prev => new Set([...prev, newTask.id]));
        
        setTimeout(() => {
          setNewTaskIds(prev => {
            const next = new Set(prev);
            next.delete(newTask.id);
            return next;
          });
        }, 1500);
      } else {
        const error = await response.json();
        alert(`Error creating task: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  }

  async function toggle(id: string) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === "open" || task.status === "inbox" ? "done" : "open";

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev =>
          prev.map(t => (t.id === id ? updatedTask : t))
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-notion-textMuted">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <NotionTaskInput onAdd={addTask} categories={categories} />

      {openTasks.length > 0 && (
        <NotionSection 
          title="Open" 
          count={openTasks.length}
          storageKey="notion-section-open"
        >
          <div className="space-y-0.5">
            {openTasks.map((task) => (
              <NotionTaskRow
                key={task.id}
                task={task}
                onToggle={toggle}
                isNew={newTaskIds.has(task.id)}
              />
            ))}
          </div>
        </NotionSection>
      )}

      {doneTasks.length > 0 && (
        <NotionSection 
          title="Done" 
          count={doneTasks.length}
          storageKey="notion-section-done"
          defaultExpanded={false}
        >
          <div className="space-y-0.5">
            {doneTasks.map((task) => (
              <NotionTaskRow
                key={task.id}
                task={task}
                onToggle={toggle}
              />
            ))}
          </div>
        </NotionSection>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-notion-textMuted">No tasks yet. Add one above to get started.</p>
        </div>
      )}
    </div>
  );
}


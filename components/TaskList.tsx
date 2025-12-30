"use client";

import { useMemo, useState, useEffect } from "react";
import AddTaskForm from "./AddTaskForm";
import type { CategoryTreeNode } from "@/lib/types/category";
import type { Task } from "@/lib/supabase/queries/tasks";

interface TaskListProps {
  categories: CategoryTreeNode[];
}

export default function TaskList({ categories }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());

  // Fetch tasks from API
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
        
        // Remove highlight after animation
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
      <div className="card">
        <p className="text-sm font-rubik text-brand-text/60 text-center py-8">
          Loading tasks...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AddTaskForm onAdd={addTask} categories={categories} />

      <section className="card card-elevated">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-heading-3 text-brand-text">Open</h3>
          <span className="text-sm font-rubik text-brand-text/60 font-medium">({openTasks.length})</span>
        </div>
        <ul className="space-y-2">
          {openTasks.map((t, index) => (
            <li 
              key={t.id} 
              className={`task-item flex items-start gap-4 rounded-button border border-brand-button-light bg-white p-4 animate-fade-in ${
                newTaskIds.has(t.id) ? "task-item-new" : ""
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => toggle(t.id)}
                className="checkbox-custom flex-shrink-0 mt-1"
                aria-label={`Mark "${t.title}" as done`}
                type="button"
              >
                <svg 
                  className="w-4 h-4 text-white transition-opacity duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <div className="flex-1">
                <span className="text-base font-rubik text-brand-text font-normal block">{t.title}</span>
                {t.description && (
                  <p className="text-sm font-rubik text-brand-text/60 mt-1">{t.description}</p>
                )}
              </div>
            </li>
          ))}
          {openTasks.length === 0 && (
            <div className="empty-state">
              <p className="empty-state-text text-base">
                No open tasks—nice work 🎉
              </p>
              <p className="empty-state-text text-sm mt-2">
                <strong>Tip:</strong> You can add tasks by sending a WhatsApp voice note. Click the WhatsApp link in the top-right corner to join the group.
              </p>
            </div>
          )}
        </ul>
      </section>

      {doneTasks.length > 0 && (
        <section className="card">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-heading-3 text-brand-text">Done</h3>
            <span className="text-sm font-rubik text-brand-text/60 font-medium">({doneTasks.length})</span>
          </div>
          <ul className="space-y-2">
            {doneTasks.map((t, index) => (
              <li 
                key={t.id} 
                className="task-item flex items-start gap-4 rounded-button border border-brand-button-light bg-white/50 p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => toggle(t.id)}
                  className="checkbox-custom checked flex-shrink-0 mt-1"
                  aria-label={`Reopen "${t.title}"`}
                  type="button"
                >
                  <svg 
                    className="w-4 h-4 text-white transition-opacity duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <div className="flex-1">
                  <span className="text-base font-rubik text-brand-text/50 line-through font-light block">{t.title}</span>
                  {t.description && (
                    <p className="text-sm font-rubik text-brand-text/40 line-through mt-1">{t.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

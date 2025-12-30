"use client";

import { useMemo, useState, useEffect } from "react";
import AddTaskForm from "./AddTaskForm";

type Task = {
  id: string;
  title: string;
  status: "open" | "done";
  createdAt: string;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Book dentist appointment", status: "open", createdAt: new Date().toISOString() },
    { id: "2", title: "Submit expense report", status: "done", createdAt: new Date().toISOString() }
  ]);
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());

  const openTasks = useMemo(() => tasks.filter(t => t.status === "open"), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === "done"), [tasks]);

  function addTask(title: string) {
    const t: Task = { id: crypto.randomUUID(), title, status: "open", createdAt: new Date().toISOString() };
    setTasks(prev => [t, ...prev]);
    setNewTaskIds(prev => new Set([...prev, t.id]));
    // Remove highlight after animation
    setTimeout(() => {
      setNewTaskIds(prev => {
        const next = new Set(prev);
        next.delete(t.id);
        return next;
      });
    }, 1500);
  }

  function toggle(id: string) {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: t.status === "open" ? "done" : "open" } : t))
    );
  }

  return (
    <div className="space-y-6">
      <AddTaskForm onAdd={addTask} />

      <section className="card card-elevated">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-heading-3 text-brand-text">Open</h3>
          <span className="text-sm font-rubik text-brand-text/60 font-medium">({openTasks.length})</span>
        </div>
        <ul className="space-y-2">
          {openTasks.map((t, index) => (
            <li 
              key={t.id} 
              className={`task-item flex items-center gap-4 rounded-button border border-brand-button-light bg-white p-4 animate-fade-in ${
                newTaskIds.has(t.id) ? "task-item-new" : ""
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => toggle(t.id)}
                className="checkbox-custom flex-shrink-0"
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
              <span className="flex-1 text-base font-rubik text-brand-text font-normal">{t.title}</span>
            </li>
          ))}
          {openTasks.length === 0 && (
            <div className="empty-state">
              <p className="empty-state-text text-base">
                No open tasks—nice work 🎉
              </p>
              <p className="empty-state-text text-sm mt-2">
                Voice-captured tasks will appear here.
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
                className="task-item flex items-center gap-4 rounded-button border border-brand-button-light bg-white/50 p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => toggle(t.id)}
                  className="checkbox-custom checked flex-shrink-0"
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
                <span className="flex-1 text-base font-rubik text-brand-text/50 line-through font-light">{t.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";
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

  const openTasks = useMemo(() => tasks.filter(t => t.status === "open"), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === "done"), [tasks]);

  function addTask(title: string) {
    const t: Task = { id: crypto.randomUUID(), title, status: "open", createdAt: new Date().toISOString() };
    setTasks(prev => [t, ...prev]);
  }

  function toggle(id: string) {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: t.status === "open" ? "done" : "open" } : t))
    );
  }

  return (
    <div className="space-y-8">
      <section className="card">
        <AddTaskForm onAdd={addTask} />
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-heading-3 text-brand-text">Open</h3>
          <span className="text-xs font-rubik text-brand-text/60 font-medium">{openTasks.length}</span>
        </div>
        <ul className="space-y-3">
          {openTasks.map(t => (
            <li 
              key={t.id} 
              className="flex items-center justify-between rounded-button border border-brand-button-light bg-white p-4 transition-all duration-200 hover:shadow-card"
            >
              <span className="text-sm font-rubik text-brand-text font-normal">{t.title}</span>
              <button
                className="btn btn-secondary text-xs"
                onClick={() => toggle(t.id)}
              >
                Mark done
              </button>
            </li>
          ))}
          {openTasks.length === 0 && (
            <p className="mt-4 text-sm font-rubik text-brand-text/60 font-light">Nothing open 🎉</p>
          )}
        </ul>
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-heading-3 text-brand-text">Done</h3>
          <span className="text-xs font-rubik text-brand-text/60 font-medium">{doneTasks.length}</span>
        </div>
        <ul className="space-y-3">
          {doneTasks.map(t => (
            <li 
              key={t.id} 
              className="flex items-center justify-between rounded-button border border-brand-button-light bg-white p-4 transition-all duration-200 hover:shadow-card"
            >
              <span className="text-sm font-rubik text-brand-text/50 line-through font-light">{t.title}</span>
              <button
                className="btn btn-ghost text-xs"
                onClick={() => toggle(t.id)}
              >
                Reopen
              </button>
            </li>
          ))}
          {doneTasks.length === 0 && (
            <p className="mt-4 text-sm font-rubik text-brand-text/60 font-light">No completed tasks yet.</p>
          )}
        </ul>
      </section>
    </div>
  );
}


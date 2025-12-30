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
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <AddTaskForm onAdd={addTask} />
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Open</h3>
          <span className="text-xs text-neutral-500">{openTasks.length}</span>
        </div>
        <ul className="mt-3 space-y-2">
          {openTasks.map(t => (
            <li key={t.id} className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm">{t.title}</span>
              <button
                className="rounded-lg border px-3 py-1 text-xs hover:bg-neutral-50"
                onClick={() => toggle(t.id)}
              >
                Mark done
              </button>
            </li>
          ))}
          {openTasks.length === 0 && <p className="mt-2 text-sm text-neutral-500">Nothing open 🎉</p>}
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Done</h3>
          <span className="text-xs text-neutral-500">{doneTasks.length}</span>
        </div>
        <ul className="mt-3 space-y-2">
          {doneTasks.map(t => (
            <li key={t.id} className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm line-through text-neutral-500">{t.title}</span>
              <button
                className="rounded-lg border px-3 py-1 text-xs hover:bg-neutral-50"
                onClick={() => toggle(t.id)}
              >
                Reopen
              </button>
            </li>
          ))}
          {doneTasks.length === 0 && <p className="mt-2 text-sm text-neutral-500">No completed tasks yet.</p>}
        </ul>
      </section>
    </div>
  );
}


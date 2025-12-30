"use client";

import { useState } from "react";

export default function AddTaskForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

  return (
    <form
      className="flex flex-col sm:flex-row gap-3 sticky top-4 z-10 bg-white p-4 rounded-card shadow-card-elevated"
      onSubmit={(e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        onAdd(t);
        setTitle("");
      }}
    >
      <input
        className="w-full rounded-button border-2 border-brand-primary/20 bg-white px-5 py-4 text-base font-rubik text-brand-text placeholder:text-brand-text/40 outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
        placeholder="Add a task (e.g., Book dentist)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <button 
        type="submit"
        className="btn btn-primary-action font-rubik font-semibold text-base px-6 py-4 min-w-[100px] sm:min-w-[120px]"
      >
        Add Task
      </button>
    </form>
  );
}

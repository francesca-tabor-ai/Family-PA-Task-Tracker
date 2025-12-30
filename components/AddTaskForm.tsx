"use client";

import { useState } from "react";

export default function AddTaskForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

  return (
    <form
      className="flex gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        onAdd(t);
        setTitle("");
      }}
    >
      <input
        className="w-full rounded-button border border-brand-button-dark bg-white px-4 py-3 text-sm font-rubik text-brand-text placeholder:text-brand-text/40 outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-text focus:border-brand-text"
        placeholder="Add a task…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button 
        type="submit"
        className="btn btn-primary font-rubik font-medium"
      >
        Add
      </button>
    </form>
  );
}

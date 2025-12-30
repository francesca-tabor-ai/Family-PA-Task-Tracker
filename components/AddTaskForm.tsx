"use client";

import { useState } from "react";

export default function AddTaskForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        onAdd(t);
        setTitle("");
      }}
    >
      <input
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
        placeholder="Add a task…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800">
        Add
      </button>
    </form>
  );
}

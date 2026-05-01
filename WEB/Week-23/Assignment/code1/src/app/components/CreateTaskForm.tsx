"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { Priority } from "@/lib/store";

export default function CreateTaskForm() {
  const utils = trpc.useUtils();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      // Invalidate the getAll query so the list refreshes
      utils.task.getAll.invalidate();
      setTitle("");
      setDescription("");
      setPriority("medium");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  const inputClass =
    "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">New Task</h2>

      {createTask.error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4">
          {createTask.error.message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Task title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className={inputClass}
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <button
          type="submit"
          disabled={createTask.isPending || !title.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createTask.isPending ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}

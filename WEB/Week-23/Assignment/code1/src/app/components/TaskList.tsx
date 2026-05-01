"use client";

import { trpc } from "@/lib/trpc/client";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

export default function TaskList() {
  const utils = trpc.useUtils();

  const { data: tasks, isLoading, error } = trpc.task.getAll.useQuery();

  const toggleComplete = trpc.task.update.useMutation({
    onSuccess: () => utils.task.getAll.invalidate(),
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.getAll.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
        Failed to load tasks: {error.message}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400">
        No tasks yet. Create one above!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-3 transition-opacity ${
            task.completed ? "opacity-60" : ""
          }`}
        >
          {/* Complete toggle */}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() =>
              toggleComplete.mutate({ id: task.id, completed: !task.completed })
            }
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer"
          />

          {/* Task info */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium text-slate-900 text-sm ${
                task.completed ? "line-through text-slate-400" : ""
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-slate-400 text-xs mt-0.5">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>
              <span className="text-xs text-slate-300">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={() => deleteTask.mutate({ id: task.id })}
            disabled={deleteTask.isPending}
            className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50 text-lg leading-none"
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      ))}

      <p className="text-xs text-slate-400 text-right mt-1">
        {tasks.filter((t) => t.completed).length}/{tasks.length} completed
      </p>
    </div>
  );
}

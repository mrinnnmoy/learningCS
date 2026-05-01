import { randomUUID } from "crypto";

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | undefined;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
}

// In-memory store — resets when the server restarts
let tasks: Task[] = [
  {
    id: randomUUID(),
    title: "Learn tRPC",
    description: "Set up a tRPC project",
    priority: "high",
    completed: false,
    createdAt: new Date(),
  },
  {
    id: randomUUID(),
    title: "Write tests",
    description: undefined,
    priority: "medium",
    completed: false,
    createdAt: new Date(),
  },
  {
    id: randomUUID(),
    title: "Deploy to Vercel",
    description: "Set up CI/CD",
    priority: "low",
    completed: false,
    createdAt: new Date(),
  },
];

export const store = {
  getAll: (): Task[] => [...tasks],

  getById: (id: string): Task | undefined => tasks.find((t) => t.id === id),

  create: (data: Omit<Task, "id" | "completed" | "createdAt">): Task => {
    const task: Task = {
      id: randomUUID(),
      completed: false,
      createdAt: new Date(),
      ...data,
    };
    tasks.push(task);
    return task;
  },

  update: (
    id: string,
    data: Partial<Omit<Task, "id" | "createdAt">>,
  ): Task | undefined => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    tasks[index] = { ...tasks[index], ...data };
    return tasks[index];
  },

  remove: (id: string): boolean => {
    const before = tasks.length;
    tasks = tasks.filter((t) => t.id !== id);
    return tasks.length < before;
  },

  getByPriority: (priority: Priority): Task[] =>
    tasks.filter((t) => t.priority === priority),
};

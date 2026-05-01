import CreateTaskForm from "./components/CreateTaskForm";
import TaskList from "./components/TaskList";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Task Manager</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Type-safe task management powered by tRPC + React Query
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <CreateTaskForm />
        <TaskList />
      </div>
    </div>
  );
}

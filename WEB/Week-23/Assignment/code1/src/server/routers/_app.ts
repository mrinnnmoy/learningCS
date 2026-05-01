import { router } from "../trpc";
import { taskRouter } from "./task";

export const appRouter = router({
  task: taskRouter,
});

// Export the TYPE only — this is what crosses to the client
export type AppRouter = typeof appRouter;

import { z } from "zod";
import { router, procedure, TRPCError } from "../trpc";
import { store } from "@/lib/store";

const PrioritySchema = z.enum(["low", "medium", "high"]);

export const taskRouter = router({
  getAll: procedure.query(() => store.getAll()),

  getById: procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ input }) => {
      const task = store.getById(input.id);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${input.id} not found`,
        });
      }
      return task;
    }),

  getByPriority: procedure
    .input(z.object({ priority: PrioritySchema }))
    .query(({ input }) => store.getByPriority(input.priority)),

  create: procedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(200),
        description: z.string().optional(),
        priority: PrioritySchema.default("medium"),
      }),
    )
    .mutation(({ input }) => store.create(input)),

  update: procedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        priority: PrioritySchema.optional(),
        completed: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      const task = store.update(id, data);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${id} not found`,
        });
      }
      return task;
    }),

  delete: procedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => {
      const deleted = store.remove(input.id);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task ${input.id} not found`,
        });
      }
      return { success: true as const };
    }),
});

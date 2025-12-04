import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const logRouter = t.router({
  list: t.procedure.query(() => []),
  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => ({ id: input.id })),
  create: t.procedure
    .input(z.object({ action: z.string(), userId: z.string() }))
    .mutation(({ input }) => ({
      id: "new-id",
      action: input.action,
      userId: input.userId,
    })),
  discord: t.procedure
    .input(z.object({ action: z.string(), details: z.string() }))
    .mutation(({ input }) => ({
      action: input.action,
      details: input.details,
    })),
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: true })),
});

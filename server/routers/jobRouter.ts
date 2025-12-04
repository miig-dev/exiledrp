import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const jobRouter = t.router({
  list: t.procedure.query(() => []),
  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => ({ id: input.id })),
  create: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => ({ id: "new-id", name: input.name })),
  update: t.procedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(({ input }) => ({ id: input.id, name: input.name })),
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: true })),
  stats: t.procedure.query(() => ({ total: 0 })),
});

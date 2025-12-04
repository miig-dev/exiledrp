import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const emergencyRouter = t.router({
  list: t.procedure.query(() => []),
  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => ({ id: input.id })),
  create: t.procedure
    .input(z.object({ type: z.string() }))
    .mutation(({ input }) => ({ id: "new-id", type: input.type })),
  assign: t.procedure
    .input(z.object({ id: z.string(), staffId: z.string() }))
    .mutation(({ input }) => ({ id: input.id, staffId: input.staffId })),
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: true })),
  stats: t.procedure.query(() => ({ total: 0 })),
});

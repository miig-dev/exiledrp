import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const staffRouter = t.router({
  list: t.procedure.query(() => []),
  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => ({ id: input.id })),
  create: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => ({ id: "new-id", name: input.name })),
  note: t.procedure
    .input(z.object({ staffId: z.string(), note: z.string() }))
    .mutation(({ input }) => ({ staffId: input.staffId, note: input.note })),
  sanction: t.procedure
    .input(z.object({ staffId: z.string(), sanction: z.string() }))
    .mutation(({ input }) => ({
      staffId: input.staffId,
      sanction: input.sanction,
    })),
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: true })),
});

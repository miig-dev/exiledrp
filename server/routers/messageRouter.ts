import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const messageRouter = t.router({
  list: t.procedure.query(() => []),
  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => ({ id: input.id })),
  create: t.procedure
    .input(z.object({ content: z.string() }))
    .mutation(({ input }) => ({ id: "new-id", content: input.content })),
  attach: t.procedure
    .input(z.object({ messageId: z.string(), file: z.string() }))
    .mutation(({ input }) => ({
      messageId: input.messageId,
      file: input.file,
    })),
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: true })),
});

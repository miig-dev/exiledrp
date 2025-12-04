import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { animationRouter } from "./routers/animationRouter";
import { emergencyRouter } from "./routers/emergencyRouter";
import { jobRouter } from "./routers/jobRouter";
import { logRouter } from "./routers/logRouter";
import { messageRouter } from "./routers/messageRouter";
import { staffRouter } from "./routers/staffRouter";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return { greeting: `Bonjour, ${input?.name ?? "visiteur"} !` };
    }),
  animation: animationRouter,
  job: jobRouter,
  emergency: emergencyRouter,
  staff: staffRouter,
  message: messageRouter,
  log: logRouter,
});

export type AppRouter = typeof appRouter;

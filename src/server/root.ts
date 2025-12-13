import { animationRouter } from "./routers/animation";
import { emergencyRouter } from "./routers/emergency";
import { jobRouter } from "./routers/job";
import { logRouter } from "./routers/log";
import { messageRouter } from "./routers/message";
import { staffRouter } from "./routers/staff";
import { router } from "./trpc";

export const appRouter = router({
  animation: animationRouter,
  staff: staffRouter,
  emergency: emergencyRouter,
  job: jobRouter,
  log: logRouter,
  message: messageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

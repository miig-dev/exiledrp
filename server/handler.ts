import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./trpc";

export const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const animationRouter = t.router({
  list: t.procedure.query(() => {
    // TODO: Récupérer toutes les animations
    return [];
  }),
  get: t.procedure.input(z.object({ id: z.string() })).query(({ input }) => {
    // TODO: Récupérer une animation par ID
    return { id: input.id };
  }),
  create: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      // TODO: Créer une animation
      return { id: "new-id", name: input.name };
    }),
  update: t.procedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(({ input }) => {
      // TODO: Mettre à jour une animation
      return { id: input.id, name: input.name };
    }),
  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      // TODO: Supprimer une animation
      return { success: true };
    }),
  stats: t.procedure.query(() => {
    // TODO: Statistiques sur les animations
    return { total: 0 };
  }),
});

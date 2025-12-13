import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

export const createTRPCContext = async (opts?: { headers: Headers }) => {
  // Récupérer la session Better Auth
  const session = await auth.api.getSession({
    headers: opts?.headers || (await headers()),
  });

  return {
    prisma,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const router = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Helper function to check if user has a specific role
 */
async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  return (
    user?.roles.some((r) => r.name.toLowerCase() === roleName.toLowerCase()) ??
    false
  );
}

/**
 * Staff procedure - Requires "staff" role or higher
 */
export const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const userRoles = (ctx.session.user as { roles?: string[] }).roles || [];
  const hasStaffRole =
    userRoles.some((r) =>
      ["staff", "gestion", "direction"].includes(r.toLowerCase())
    ) ||
    (await hasRole(ctx.session.user.id as string, "staff")) ||
    (await hasRole(ctx.session.user.id as string, "gestion")) ||
    (await hasRole(ctx.session.user.id as string, "direction"));

  if (!hasStaffRole) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé au staff",
    });
  }

  return next({ ctx });
});

/**
 * Gestion procedure - Requires "gestion" or "direction" role
 */
export const gestionProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const userRoles = (ctx.session.user as { roles?: string[] }).roles || [];
    const hasGestionRole =
      userRoles.some((r) =>
        ["gestion", "direction"].includes(r.toLowerCase())
      ) ||
      (await hasRole(ctx.session.user.id as string, "gestion")) ||
      (await hasRole(ctx.session.user.id as string, "direction"));

    if (!hasGestionRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Accès réservé à la gestion et direction",
      });
    }

    return next({ ctx });
  }
);

/**
 * Direction procedure - Requires "direction" role
 */
export const directionProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const userRoles = (ctx.session.user as { roles?: string[] }).roles || [];
    const hasDirectionRole =
      userRoles.some((r) => r.toLowerCase() === "direction") ||
      (await hasRole(ctx.session.user.id as string, "direction"));

    if (!hasDirectionRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Accès réservé à la direction",
      });
    }

    return next({ ctx });
  }
);

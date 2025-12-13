import { discordLog } from "@/lib/discord-logger";
import { findUserByIdentifier } from "@/lib/discord-user";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const emergencyRouter = router({
  /**
   * CITOYEN: Créer un appel d'urgence
   */
  createCall: protectedProcedure
    .input(
      z.object({
        type: z.enum(["POLICE", "EMS", "MECANO"]),
        message: z
          .string()
          .min(5, "Le message doit contenir au moins 5 caractères"),
        coords: z.string().optional(), // "x,y,z"
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const call = await prisma.emergencyCall.create({
          data: {
            type: input.type,
            message: input.message,
            coords: input.coords,
            callerId: ctx.session.user.id as string,
            status: "PENDING",
          },
          include: {
            caller: {
              select: { username: true },
            },
          },
        });

        // Log Discord
        await discordLog("WARN", {
          title: "🚨 Nouvel Appel d'Urgence",
          description: `Un nouvel appel d'urgence a été émis.`,
          fields: [
            { name: "Type", value: input.type, inline: true },
            { name: "Priorité", value: "1", inline: true },
            {
              name: "Appelant",
              value: call.caller.username || "Inconnu",
              inline: true,
            },
            { name: "Message", value: input.message, inline: false },
            {
              name: "Localisation",
              value: input.coords || "Non spécifiée",
              inline: true,
            },
          ],
        });

        return { success: true, callId: call.id };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible d'envoyer l'appel d'urgence",
        });
      }
    }),

  /**
   * SERVICES: Récupérer les appels actifs (PENDING ou TAKEN)
   * TODO: Filtrer par métier de l'utilisateur (ex: Un flic ne voit que POLICE/EMS)
   */
  getActiveCalls: protectedProcedure
    .input(z.object({ type: z.enum(["POLICE", "EMS", "MECANO"]).optional() }))
    .query(async ({ input }) => {
      return await prisma.emergencyCall.findMany({
        where: {
          status: { not: "DONE" },
          ...(input?.type ? { type: input.type } : {}),
        },
        include: {
          caller: {
            select: { username: true, avatar: true },
          },
          takenBy: {
            select: { username: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  /**
   * SERVICES: Prendre un appel
   */
  takeCall: protectedProcedure
    .input(z.object({ callId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const call = await prisma.emergencyCall.update({
          where: { id: input.callId },
          data: {
            status: "TAKEN",
            takenById: ctx.session.user.id,
            takenAt: new Date(),
          },
          include: {
            caller: {
              select: { username: true, discordId: true },
            },
            takenBy: {
              select: { username: true, discordId: true },
            },
          },
        });

        // Log Discord
        await discordLog("INFO", {
          title: "Appel d'Urgence Pris en Charge",
          description: `Un appel d'urgence a été assigné.`,
          fields: [
            { name: "Type", value: call.type, inline: true },
            {
              name: "Appelant",
              value: call.caller.username || "Inconnu",
              inline: true,
            },
            {
              name: "Discord ID Appelant",
              value: call.caller.discordId || "Non défini",
              inline: true,
            },
            {
              name: "Pris en charge par",
              value: call.takenBy?.username || ctx.session.user.name || "Inconnu",
              inline: true,
            },
            {
              name: "Discord ID Assigné",
              value: call.takenBy?.discordId || "Non défini",
              inline: true,
            },
          ],
        });

        return { success: true, call };
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appel introuvable ou déjà traité",
        });
      }
    }),

  /**
   * ADMIN: Assigner manuellement un appel à un utilisateur
   * Accepte userId (UUID) ou discordId (Discord ID)
   */
  assignCall: protectedProcedure
    .input(
      z.object({
        callId: z.string(),
        userId: z.string(), // Peut être UUID ou Discord ID
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Trouver l'utilisateur par Discord ID ou User ID
        const targetUser = await findUserByIdentifier(input.userId);
        if (!targetUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Utilisateur introuvable (vérifiez le Discord ID ou User ID)",
          });
        }

        const call = await prisma.emergencyCall.update({
          where: { id: input.callId },
          data: {
            status: "TAKEN",
            takenById: targetUser.id,
            takenAt: new Date(),
          },
          include: {
            caller: {
              select: { username: true, discordId: true },
            },
            takenBy: {
              select: { username: true, discordId: true },
            },
          },
        });

        // Log Discord
        await discordLog("INFO", {
          title: "Appel d'Urgence Assigné Manuellement",
          description: `Un appel d'urgence a été assigné manuellement.`,
          fields: [
            { name: "Type", value: call.type, inline: true },
            {
              name: "Appelant",
              value: call.caller.username || "Inconnu",
              inline: true,
            },
            {
              name: "Discord ID Appelant",
              value: call.caller.discordId || "Non défini",
              inline: true,
            },
            {
              name: "Assigné à",
              value: call.takenBy?.username || "Inconnu",
              inline: true,
            },
            {
              name: "Discord ID Assigné",
              value: call.takenBy?.discordId || "Non défini",
              inline: true,
            },
            {
              name: "Assigné par",
              value: ctx.session.user.name || "Inconnu",
              inline: true,
            },
          ],
        });

        return { success: true, call };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de l'assignation de l'appel",
        });
      }
    }),

  /**
   * SERVICES: Clôturer un appel
   */
  closeCall: protectedProcedure
    .input(z.object({ callId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Vérifier que c'est bien la personne qui a pris l'appel qui le clôture
      try {
        const callBefore = await prisma.emergencyCall.findUnique({
          where: { id: input.callId },
          include: {
            caller: {
              select: { username: true },
            },
            takenBy: {
              select: { username: true },
            },
          },
        });

        const call = await prisma.emergencyCall.update({
          where: { id: input.callId },
          data: {
            status: "DONE",
          },
        });

        // Log Discord
        if (callBefore) {
          await discordLog("SUCCESS", {
            title: "Appel d'Urgence Clôturé",
            description: `Un appel d'urgence a été résolu et clôturé.`,
            fields: [
              { name: "Type", value: callBefore.type, inline: true },
              {
                name: "Appelant",
                value: callBefore.caller.username || "Inconnu",
                inline: true,
              },
              {
                name: "Résolu par",
                value:
                  callBefore.takenBy?.username ||
                  ctx.session.user.name ||
                  "Inconnu",
                inline: true,
              },
            ],
          });
        }

        return { success: true, call };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la clôture de l'appel",
        });
      }
    }),
});
